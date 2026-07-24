"use server";

import { parse } from "papaparse";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";
import { getUserId } from "@/lib/supabase/server";

export interface CsvPreviewResponse {
  error?: string;
  headers?: string[];
  previewData?: Record<string, string>[];
  success?: boolean;
}

export async function parseCsvForPreview(formData: FormData): Promise<CsvPreviewResponse> {
  try {
    await getUserId(); // ensure auth
    const file = formData.get("file") as File;
    if (!file) return { error: "No file uploaded." };

    const text = await file.text();
    
    return new Promise((resolve) => {
      parse(text, {
        header: true,
        skipEmptyLines: true,
        preview: 6, // need 5 rows of data for preview, plus header
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            resolve({ error: "Failed to parse CSV file." });
          } else {
            resolve({
              headers: results.meta.fields || [],
              previewData: results.data.slice(0, 5) as Record<string, string>[],
              success: true
            });
          }
        },
        error: (err: Error) => resolve({ error: err.message })
      });
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export interface LeadImportResponse {
  error?: string;
  success?: boolean;
  imported?: number;
  skippedDupes?: number;
  rejectedInvalid?: number;
  errors?: string[];
}

export async function importLeads(formData: FormData, mapping: Record<string, string>): Promise<LeadImportResponse> {
  try {
    const userId = await getUserId();
    
    // Clean up any lingering soft-deleted leads so they don't block the import
    await prisma.lead.deleteMany({
      where: { userId, deletedAt: { not: null } }
    });

    const file = formData.get("file") as File;
    if (!file) return { error: "No file uploaded." };

    const text = await file.text();
    
    // Reverse mapping: column_name -> our_field. Trim column names to be safe.
    const columnToField: Record<string, string> = {};
    for (const [field, col] of Object.entries(mapping)) {
       if (col) columnToField[col.trim()] = field;
    }

    console.log('Importing leads with mapping:', mapping);

    return new Promise((resolve) => {
      parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: async (results) => {
          const rows = results.data as Record<string, string>[];
          console.log(`Parsed ${rows.length} rows from CSV.`);
          
          let imported = 0;
          let skippedDupes = 0;
          let rejectedInvalid = 0;
          const errors: string[] = [];
          
          const seenPhonesGlobal = new Set<string>();
          const CHUNK_SIZE = 500;

          // Process in chunks to avoid blocking the event loop and overwhelming the DB
          for (let chunkStart = 0; chunkStart < rows.length; chunkStart += CHUNK_SIZE) {
            const chunk = rows.slice(chunkStart, chunkStart + CHUNK_SIZE);
            const validRowsChunk: Array<{ userId: string; phoneNumber: string; firstName: string | null; lastName: string | null; email: string | null; source: string; optIn: boolean; status: LeadStatus }> = [];
            const seenPhonesInChunk = new Set<string>();

            // 1. Process and normalize chunk rows
            for (let i = 0; i < chunk.length; i++) {
              const globalIndex = chunkStart + i;
              const row = chunk[i];
              const mappedData: Record<string, string> = {};
              
              // Map columns
              for (const [col, val] of Object.entries(row)) {
                 const field = columnToField[col];
                 if (field) {
                   mappedData[field] = val;
                 }
              }

              const rawPhone = mappedData.phoneNumber;
              
              if (!rawPhone || typeof rawPhone !== 'string' || rawPhone.trim() === '') {
                 rejectedInvalid++;
                 if (errors.length < 50) errors.push(`Row ${globalIndex+1}: Missing phone number.`);
                 continue;
              }

              try {
                 // Try to parse using libphonenumber-js to E.164. 
                 let phoneStr = rawPhone.trim();
                 if (!phoneStr.startsWith('+')) {
                   phoneStr = `+${phoneStr.replace(/\D/g, '')}`;
                 }
                 
                 if (!isValidPhoneNumber(phoneStr)) {
                    rejectedInvalid++;
                    if (errors.length < 50) errors.push(`Row ${globalIndex+1}: Invalid phone number format (${rawPhone}).`);
                    continue;
                 }

                 const normalizedPhone = parsePhoneNumber(phoneStr).format('E.164');

                 // Check against globally seen phones in this import
                 if (seenPhonesGlobal.has(normalizedPhone)) {
                   skippedDupes++;
                   continue;
                 }
                 seenPhonesGlobal.add(normalizedPhone);
                 seenPhonesInChunk.add(normalizedPhone);

                 validRowsChunk.push({
                   userId,
                   phoneNumber: normalizedPhone,
                   firstName: (mappedData.firstName || null)?.toString().trim() || null,
                   lastName: (mappedData.lastName || null)?.toString().trim() || null,
                   email: (mappedData.email || null)?.toString().trim() || null,
                   source: (mappedData.source || 'CSV Import').toString().trim(),
                   optIn: true,
                   status: LeadStatus.NEW
                 });

              } catch (err) {
                 console.error(`Error processing row ${globalIndex+1}:`, err);
                 rejectedInvalid++;
                 if (errors.length < 50) errors.push(`Row ${globalIndex+1}: Could not parse phone number (${rawPhone}).`);
                 continue;
              }
            }

            if (validRowsChunk.length === 0) {
               // Yield to event loop even if chunk was empty/invalid
               await new Promise(resolve => setTimeout(resolve, 0));
               continue;
            }

            // 2. Fetch existing user leads to deduplicate against DB for this chunk
            const existingLeads = await prisma.lead.findMany({
               where: { userId, phoneNumber: { in: Array.from(seenPhonesInChunk) } },
               select: { phoneNumber: true }
            });
            const existingPhones = new Set(existingLeads.map(l => l.phoneNumber));

            // 3. Filter out DB duplicates and insert
            const finalRowsToInsert = validRowsChunk.filter(row => {
               if (existingPhones.has(row.phoneNumber)) {
                  skippedDupes++;
                  return false;
               }
               return true;
            });

            if (finalRowsToInsert.length > 0) {
               await prisma.lead.createMany({
                 data: finalRowsToInsert
               });
               
               imported += finalRowsToInsert.length;
            }

            // Yield to event loop to prevent blocking between chunks
            await new Promise(resolve => setTimeout(resolve, 0));
          }

          if (imported > 0) {
             // Create a single activity log for the entire import
             await prisma.activityLog.create({
                data: {
                  userId,
                  eventType: "LEAD_IMPORTED",
                  details: JSON.stringify({ method: "CSV", count: imported })
                }
             });
          }

          resolve({
             success: true,
             imported,
             skippedDupes,
             rejectedInvalid,
             errors: errors.slice(0, 20) // Only return first 20 errors to avoid overwhelming client
          });
        },
        error: (err: Error) => resolve({ error: err.message })
      });
    });
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Import failed due to server error." };
  }
}
export async function updateLead(leadId: string, data: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string; status?: LeadStatus }) {
  try {
    const userId = await getUserId();
    
    // Check ownership
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { userId: true }
    });
    
    if (!lead || lead.userId !== userId) {
      return { error: "Lead not found or unauthorized." };
    }

    // If phone is updated, normalize it
    let normalizedPhone = data.phoneNumber;
    if (data.phoneNumber) {
      const phoneStr = data.phoneNumber.startsWith('+') ? data.phoneNumber : `+${data.phoneNumber.replace(/\D/g, '')}`;
      if (!isValidPhoneNumber(phoneStr)) {
        return { error: "Invalid phone number format." };
      }
      normalizedPhone = parsePhoneNumber(phoneStr).format('E.164');
      
      // Check for phone collision
      const collision = await prisma.lead.findFirst({
        where: { userId, phoneNumber: normalizedPhone, id: { not: leadId } }
      });
      if (collision) {
        return { error: "Another lead already has this phone number." };
      }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: normalizedPhone,
        email: data.email,
        status: data.status
      }
    });

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Update failed." };
  }
}

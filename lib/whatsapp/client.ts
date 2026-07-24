export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  accessToken: string,
  phoneNumberId: string,
  recipientPhone: string,
  messageBody: string
): Promise<WhatsAppMessageResult> {
  // Mock mode for testing
  if (accessToken.startsWith("MOCK") || accessToken === "test") {
    console.log(`[MOCK WHATSAPP] Sending message to ${recipientPhone}: ${messageBody}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      messageId: `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: {
          body: messageBody
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", data);
      return {
        success: false,
        error: data.error?.message || "Failed to send message"
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id
    };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error"
    };
  }
}

export function renderTemplate(
  templateBody: string,
  leadData: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    email: string | null;
    source: string | null;
    [key: string]: string | null | undefined;
  }
): string {
  let rendered = templateBody;

  const replacements: Record<string, string> = {
    "first_name": leadData.firstName || "there",
    "last_name": leadData.lastName || "",
    "full_name": [leadData.firstName, leadData.lastName].filter(Boolean).join(" ") || "there",
    "phone": leadData.phoneNumber,
    "email": leadData.email || "",
    "source": leadData.source || "our platform"
  };

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{${key}\\}`, "gi");
    rendered = rendered.replace(regex, value);
  }

  const customFieldRegex = /\{([^}]+)\}/g;
  rendered = rendered.replace(customFieldRegex, (_, key) => {
    const k = key.toLowerCase().replace(/\s+/g, "_");
    return leadData[k] || leadData[key] || `{${key}}`;
  });

  return rendered;
}

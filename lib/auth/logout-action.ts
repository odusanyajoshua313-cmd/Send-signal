"use server";

import { logOut as logout } from "@/lib/auth/actions";

export async function logoutAction() {
  await logout();
}

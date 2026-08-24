"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearSession, setSession } from "@/lib/session";

export type AuthState = { error?: string };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { error: "Invalid email or password." };
    }
    await setSession({ userId: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error("login failed", err);
    return {
      error:
        "Could not sign in. Database tables may be missing — check DATABASE_URL and redeploy after prisma db push.",
    };
  }
  redirect("/docs");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

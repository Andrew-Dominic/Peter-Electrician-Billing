"use server";

import prisma from "@/lib/prisma";
import { verifyPassword, createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id, user.email);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

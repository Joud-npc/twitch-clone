"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAvatar(userId: string, avatarUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  if (session.user.id !== userId) throw new Error("Non autorisé");

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  revalidatePath("/dashboard");
}
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(streamId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  if (!content.trim() || content.length > 500) {
    throw new Error("Message invalide");
  }

  await prisma.message.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      streamId,
    },
  });

  revalidatePath(`/stream/${streamId}`);
}

export async function getMessages(streamId: string) {
  return prisma.message.findMany({
    where: { streamId },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}
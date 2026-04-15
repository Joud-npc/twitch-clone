"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStreamTitle(streamId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  if (!title.trim() || title.length > 100) {
    throw new Error("Titre invalide");
  }

  await prisma.stream.update({
    where: { id: streamId, userId: session.user.id },
    data: { title: title.trim() },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/stream/${streamId}`);
}

export async function updateLiveStatus(streamId: string, isLive: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  await prisma.stream.update({
    where: { id: streamId, userId: session.user.id },
    data: { isLive },
  });

  revalidatePath("/dashboard");
}

export async function incrementViewers(streamId: string) {
  await prisma.stream.update({
    where: { id: streamId },
    data: { viewerCount: { increment: 1 } },
  });
}

export async function decrementViewers(streamId: string) {
  await prisma.stream.update({
    where: { id: streamId },
    data: { viewerCount: { decrement: 1 } },
  });
}
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StreamPlayer from "@/components/StreamPlayer";
import LiveChat from "@/components/LiveChat";

interface StreamPageProps {
  params: Promise<{ id: string }>;
}

export default async function StreamPage({ params }: StreamPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const stream = await prisma.stream.findUnique({
    where: { id },
    include: { user: { select: { username: true } } },
  });

  if (!stream) {
    notFound();
  }

  const liveStreams = await prisma.stream.findMany({
    where: { isLive: true },
    include: { user: { select: { username: true, avatarUrl: true } } },
    take: 20,
  });

  const isHost = stream.userId === session.user.id;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar streams={liveStreams} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StreamPlayer
          channelName={stream.agoraChannel}
          isHost={isHost}
          streamTitle={stream.title}
          streamerName={session.user.name ?? "Streamer"}
          streamId={stream.id}
        />
      </main>

      <aside className="w-80 flex flex-col border-l border-[#2D2D35]">
        <LiveChat
          streamId={stream.id}
          currentUsername={session.user.name ?? "Anonyme"}
        />
      </aside>
    </div>
  );
}
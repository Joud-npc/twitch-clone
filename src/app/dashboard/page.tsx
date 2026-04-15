import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import StreamPlayer from "@/components/StreamPlayer";
import LiveChat from "@/components/LiveChat";
import EditStreamTitle from "@/components/EditStreamTitle";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, avatarUrl: true },
  });

  let stream = await prisma.stream.findFirst({
    where: { userId: session.user.id },
  });

  if (!stream) {
    stream = await prisma.stream.create({
      data: {
        title: `Stream de ${session.user.name}`,
        userId: session.user.id!,
      },
    });
  }

  const liveStreams = await prisma.stream.findMany({
    where: { isLive: true },
    include: { user: { select: { username: true, avatarUrl: true } } },
    take: 20,
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar streams={liveStreams} currentUser={currentUser ?? undefined} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <EditStreamTitle
          streamId={stream.id}
          initialTitle={stream.title}
        />
        <StreamPlayer
          channelName={stream.agoraChannel}
          isHost={true}
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
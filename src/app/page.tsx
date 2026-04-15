import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const streams = await prisma.stream.findMany({
    include: { user: { select: { username: true, avatarUrl: true } } },
    orderBy: [{ isLive: "desc" }, { updatedAt: "desc" }],
    take: 50,
  });

  const liveStreams = streams.filter((s) => s.isLive);
  const offlineStreams = streams.filter((s) => !s.isLive);

  return (
    <div className="min-h-screen bg-[#0E0E10]">
      {/* Navbar */}
      <nav className="bg-[#1F1F23] border-b border-[#2D2D35] px-6 py-3 flex items-center justify-between">
        <h1 className="text-[#9146FF] font-bold text-xl">StreamFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-[#ADADB8] text-sm">
            Bonjour, {session.user.name} 👋
          </span>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#9146FF] hover:bg-[#7D2FF7] text-white text-sm font-bold rounded-md transition-colors"
          >
            🎮 Mon stream
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Streams en direct */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-white font-bold text-lg">
              En direct ({liveStreams.length})
            </h2>
          </div>

          {liveStreams.length === 0 ? (
            <div className="bg-[#1F1F23] rounded-xl p-8 text-center border border-[#2D2D35]">
              <p className="text-[#ADADB8]">Aucun stream en direct pour le moment</p>
              <Link
                href="/dashboard"
                className="inline-block mt-4 px-6 py-2 bg-[#9146FF] hover:bg-[#7D2FF7] text-white font-bold rounded-md transition-colors text-sm"
              >
                Sois le premier à streamer !
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liveStreams.map((stream) => (
                <Link
                  key={stream.id}
                  href={`/stream/${stream.id}`}
                  className="group bg-[#1F1F23] rounded-xl overflow-hidden border border-[#2D2D35] hover:border-[#9146FF] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <div className="text-[#ADADB8] text-sm">🔴 En direct</div>
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded uppercase">
                      Live
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                      👥 {stream.viewerCount}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="p-3 flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      {stream.user.avatarUrl ? (
                        <img
                          src={stream.user.avatarUrl}
                          alt={stream.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#9146FF] flex items-center justify-center text-white text-sm font-bold">
                          {stream.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-[#9146FF] transition-colors">
                        {stream.title}
                      </p>
                      <p className="text-[#ADADB8] text-xs truncate">
                        {stream.user.username}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Streams hors ligne */}
        {offlineStreams.length > 0 && (
          <section>
            <h2 className="text-[#ADADB8] font-bold text-lg mb-4">
              Chaînes ({offlineStreams.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {offlineStreams.map((stream) => (
                <Link
                  key={stream.id}
                  href={`/stream/${stream.id}`}
                  className="group bg-[#1F1F23] rounded-xl overflow-hidden border border-[#2D2D35] hover:border-[#ADADB8] transition-colors opacity-75 hover:opacity-100"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-[#0E0E10] flex items-center justify-center">
                    <div className="text-[#ADADB8] text-sm">Hors ligne</div>
                  </div>

                  {/* Infos */}
                  <div className="p-3 flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      {stream.user.avatarUrl ? (
                        <img
                          src={stream.user.avatarUrl}
                          alt={stream.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2D2D35] flex items-center justify-center text-[#ADADB8] text-sm font-bold">
                          {stream.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#ADADB8] text-sm font-semibold truncate">
                        {stream.title}
                      </p>
                      <p className="text-[#ADADB8] text-xs truncate">
                        {stream.user.username}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
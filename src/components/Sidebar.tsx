"use client";

import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

interface Stream {
  id: string;
  title: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

interface SidebarProps {
  streams: Stream[];
  currentUser?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export default function Sidebar({ streams, currentUser }: SidebarProps) {
  return (
    <aside className="w-60 bg-[#1F1F23] flex flex-col border-r border-[#2D2D35] overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#2D2D35]">
        <h1 className="text-[#9146FF] font-bold text-xl">StreamFlow</h1>
      </div>

      {/* Avatar utilisateur connecté */}
      {currentUser && (
        <UserAvatar
          username={currentUser.username}
          avatarUrl={currentUser.avatarUrl}
          userId={currentUser.id}
        />
      )}

      {/* Lives en cours */}
      <div className="px-3 py-4">
        <p className="text-[#ADADB8] text-xs font-semibold uppercase tracking-wider mb-3">
          En direct
        </p>

        {streams.length === 0 ? (
          <p className="text-[#ADADB8] text-sm px-1">Aucun stream en cours</p>
        ) : (
          <ul className="space-y-1">
            {streams.map((stream) => (
              <li key={stream.id}>
                <Link
                  href={`/stream/${stream.id}`}
                  className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#2D2D35] transition-colors group"
                >
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

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {stream.user.username}
                    </p>
                    <p className="text-[#ADADB8] text-xs truncate">
                      {stream.title}
                    </p>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lien dashboard */}
      <div className="mt-auto px-3 py-4 border-t border-[#2D2D35]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#2D2D35] transition-colors text-[#ADADB8] hover:text-white text-sm"
        >
          🎮 Mon stream
        </Link>
      </div>
    </aside>
  );
}
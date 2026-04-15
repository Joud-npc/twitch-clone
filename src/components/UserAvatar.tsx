"use client";

import { useState } from "react";
import { updateAvatar } from "@/app/api/user/actions";

interface UserAvatarProps {
  username: string;
  avatarUrl: string | null;
  userId: string;
}

export default function UserAvatar({ username, avatarUrl, userId }: UserAvatarProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image trop lourde (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      setLoading(true);

      await updateAvatar(userId, base64);

      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-[#2D2D35]">
      <div className="relative group">
        {preview ? (
          <img
            src={preview}
            alt={username}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#9146FF]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#9146FF] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#9146FF]">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span className="text-white text-xs font-bold">Modifier</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-sm">{username}</p>
        {loading && <p className="text-[#ADADB8] text-xs">Sauvegarde...</p>}
        {saved && <p className="text-green-400 text-xs">✓ Avatar mis à jour</p>}
      </div>
    </div>
  );
}
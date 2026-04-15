"use client";

import { useState } from "react";
import { updateStreamTitle } from "@/app/api/streams/actions";

interface EditStreamTitleProps {
  streamId: string;
  initialTitle: string;
}

export default function EditStreamTitle({
  streamId,
  initialTitle,
}: EditStreamTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setLoading(true);

    await updateStreamTitle(streamId, title.trim());

    setLoading(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#1F1F23] border-b border-[#2D2D35]">
      {editing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            maxLength={100}
            autoFocus
            className="flex-1 bg-[#0E0E10] border border-[#9146FF] rounded px-3 py-1 text-white text-sm focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 bg-[#9146FF] hover:bg-[#7D2FF7] text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Sauvegarder"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 bg-[#2D2D35] hover:bg-[#3D3D45] text-white text-sm rounded transition-colors"
          >
            Annuler
          </button>
        </>
      ) : (
        <>
          <span className="text-white text-sm font-medium flex-1">{title}</span>
          {saved && (
            <span className="text-green-400 text-xs">✓ Sauvegardé</span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 bg-[#2D2D35] hover:bg-[#3D3D45] text-[#ADADB8] hover:text-white text-sm rounded transition-colors"
          >
            ✏️ Modifier le titre
          </button>
        </>
      )}
    </div>
  );
}
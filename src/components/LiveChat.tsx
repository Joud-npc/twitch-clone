"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, getMessages } from "@/app/api/messages/actions";

interface Message {
  id: string;
  content: string;
  user: { username: string };
  createdAt: Date;
}

interface LiveChatProps {
  streamId: string;
  currentUsername: string;
}

export default function LiveChat({ streamId, currentUsername }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getMessages(streamId);
      setMessages(data);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [streamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");

    startTransition(async () => {
      await sendMessage(streamId, content);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1F1F23]">
      <div className="px-4 py-3 border-b border-[#2D2D35]">
        <h3 className="text-white font-semibold text-sm">Chat en direct</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 text-sm">
            <span className="font-bold text-[#9146FF] shrink-0">
              {msg.user.username}:
            </span>
            <span className="text-[#EFEFF1] break-words">{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-[#2D2D35]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Envoyer un message..."
            maxLength={500}
            className="flex-1 bg-[#0E0E10] text-white placeholder-[#ADADB8] text-sm px-3 py-2 rounded border border-[#2D2D35] focus:outline-none focus:border-[#9146FF]"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="px-3 py-2 bg-[#9146FF] hover:bg-[#7D2FF7] disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
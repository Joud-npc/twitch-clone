"use client";

import { incrementViewers, decrementViewers, updateLiveStatus } from "@/app/api/streams/actions";
import { useEffect, useRef, useState, useCallback } from "react";
import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from "agora-rtc-sdk-ng";

interface StreamPlayerProps {
  channelName: string;
  isHost: boolean;
  streamTitle: string;
  streamerName: string;
  streamId: string;
}

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export default function StreamPlayer({
  channelName,
  isHost,
  streamTitle,
  streamerName,
  streamId,
}: StreamPlayerProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    const initAgora = async () => {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(4);

      const client = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-joined", async () => {
        setViewerCount((v) => v + 1);
        await incrementViewers(streamId);
      });

      client.on("user-left", async () => {
        setViewerCount((v) => Math.max(0, v - 1));
        await decrementViewers(streamId);
      });

      clientRef.current = client;
      setClientReady(true);
    };

    initAgora();

    return () => {
      clientRef.current?.removeAllListeners();
    };
  }, [streamId]);

  const joinAsViewer = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      setError(null);
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(4);

      await client.setClientRole("audience");
      await client.join(APP_ID, channelName, null, null);

      // FIX CLÉ : le viewer arrive APRÈS que le stream a déjà commencé.
      // Agora ne re-déclenche pas "user-published" pour les users déjà présents,
      // donc on doit manuellement souscrire aux remote users déjà connectés.
      const remoteUsers = client.remoteUsers;
      for (const user of remoteUsers) {
        if (user.hasVideo) {
          await client.subscribe(user, "video");
          if (remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current);
          }
        }
        if (user.hasAudio) {
          await client.subscribe(user, "audio");
          user.audioTrack?.play();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Impossible de rejoindre : ${message}`);
    }
  }, [channelName]);

  useEffect(() => {
    if (!isHost && clientReady) {
      joinAsViewer();
    }
  }, [isHost, clientReady, joinAsViewer]);

  const startStream = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      setError(null);
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      await client.setClientRole("host");
      await client.join(APP_ID, channelName, null, null);

      const screenTrack = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: "1080p_1" },
        "disable"
      );

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([videoTrack, micTrack]);
      await updateLiveStatus(streamId, true);

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(micTrack);
      setIsLive(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Impossible de démarrer le stream : ${message}`);
    }
  }, [channelName, streamId]);

  const stopStream = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    localVideoTrack?.stop();
    localVideoTrack?.close();
    localAudioTrack?.stop();
    localAudioTrack?.close();

    await client.unpublish();
    await client.leave();
    await updateLiveStatus(streamId, false);

    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setIsLive(false);
  }, [localVideoTrack, localAudioTrack, streamId]);

  return (
    <div className="flex flex-col w-full h-full bg-[#0E0E10]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1F1F23]">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded uppercase tracking-wider animate-pulse">
              Live
            </span>
          )}
          <span className="text-white font-semibold">{streamTitle}</span>
          <span className="text-[#ADADB8] text-sm">par {streamerName}</span>
        </div>
        {isLive && (
          <span className="text-[#ADADB8] text-sm">
            👥 {viewerCount} spectateur{viewerCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="relative flex-1 bg-black">
        {isHost && (
          <div
            ref={localVideoRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: isLive ? "block" : "none" }}
          />
        )}
        {!isHost && (
          <div
            ref={remoteVideoRef}
            className="absolute inset-0 w-full h-full"
          />
        )}
        {!isLive && isHost && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#ADADB8]">Clique sur Go Live pour démarrer</p>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {isHost && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1F1F23]">
          {!isLive ? (
            <button
              onClick={startStream}
              className="px-6 py-2 bg-[#9146FF] hover:bg-[#7D2FF7] text-white font-bold rounded-md transition-colors"
            >
              🔴 Go Live
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-md transition-colors"
            >
              ⏹ Terminer le stream
            </button>
          )}
          <span className="text-[#ADADB8] text-sm">
            {isLive ? "Vous êtes en direct !" : "Prêt à streamer"}
          </span>
        </div>
      )}
    </div>
  );
}
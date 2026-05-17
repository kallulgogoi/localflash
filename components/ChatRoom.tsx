"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, MessageSquareDashed, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { SystemMessage } from "./SystemMessage";
import { Timer } from "./Timer";
import { UserCountBadge } from "./UserCountBadge";
import { VanishScreen } from "./VanishScreen";
import { useMessages } from "@/hooks/useMessages";
import { usePresence } from "@/hooks/usePresence";
import { useTimer } from "@/hooks/useTimer";
import { deleteAllMessages } from "@/lib/firebase/messageService";
import { markRoomInactive } from "@/lib/firebase/roomService";
import {
  getStoredUsername,
  getStoredAvatarColor,
  getOrCreateUserId,
} from "@/utils/storage";
import type { Room } from "@/types";

interface ChatRoomProps {
  room: Room;
}

export function ChatRoom({ room }: ChatRoomProps) {
  const router = useRouter();
  const { messages, send, sendSystemMessage } = useMessages(room.roomId);
  const { onlineCount } = usePresence(room.roomId);
  const { expired } = useTimer(room.expiresAt);
  const [inputText, setInputText] = useState("");
  const [vanishing, setVanishing] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(0);
  const initialLoadDone = useRef(false);
  const MAX_CHARS = 300;

  const username = getStoredUsername() ?? "Anonymous";
  const avatarColor = getStoredAvatarColor() ?? "#FF4D00";
  const userId = getOrCreateUserId();

  // Send join message once
  useEffect(() => {
    if (!hasJoined) {
      setHasJoined(true);
      sendSystemMessage(`${username} joined`);
    }
  }, [hasJoined, username, sendSystemMessage]);

  const playJoinSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Ignore if audio fails (e.g. before user interaction)
    }
  }, []);

  // Watch for new messages to trigger toast/sound
  useEffect(() => {
    if (messages.length === 0) return;

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      lastMessageCount.current = messages.length;
      return;
    }

    if (messages.length > lastMessageCount.current) {
      const newMessages = messages.slice(lastMessageCount.current);
      lastMessageCount.current = messages.length;

      newMessages.forEach((msg) => {
        if (msg.type === "system" && msg.text.endsWith(" joined")) {
          const joinedName = msg.text.replace(" joined", "");
          if (joinedName !== username) {
            toast.success(`${joinedName} has joined the room`, {
              icon: "👋",
              duration: 3000,
            });
            playJoinSound();
          }
        }
      });
    }
  }, [messages, username, playJoinSound]);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle room expiry
  useEffect(() => {
    if (expired && !vanishing) {
      setVanishing(true);
      // Cleanup Firebase
      deleteAllMessages(room.roomId).catch(console.error);
      markRoomInactive(room.roomId).catch(console.error);
    }
  }, [expired, vanishing, room.roomId]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    send(text);
    setInputText("");
  }, [inputText, send]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (vanishing) {
    return <VanishScreen onComplete={() => router.push("/")} />;
  }

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{ backgroundColor: "#09090b" }}
    >
      {/* pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.373 1.373v57.254l-1.373 1.373H1.373L0 58.627V1.373L1.373 0h53.254zM29.5 31.5L30 31l2.5 2.5-3 3L27 34l3-3 2.5 2.5-.5.5v-2.5h-2.5v2.5zM20 21l1.5-1.5 2.5 2.5-3 3-2.5-2.5 1.5-1.5zM40 21l-1.5-1.5-2.5 2.5 3 3 2.5-2.5-1.5-1.5zM30 11.5L29.5 12l-2.5-2.5 3-3L33 9l-3 3-2.5-2.5.5-.5v2.5h2.5v-2.5z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/*HEADER  */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-10"
        style={{
          backgroundColor: "rgba(9, 9, 11, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-zinc-100" strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-zinc-100">
            LocalFlash
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Timer expiresAt={room.expiresAt} />
          <UserCountBadge count={onlineCount} />
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="pt-4 pb-2">
          {/* Room created system message */}
          <SystemMessage text="Room created · Messages vanish in 30 min" />

          {messages.map((msg) =>
            msg.type === "system" ? (
              <SystemMessage key={msg.messageId} text={msg.text} />
            ) : (
              <MessageBubble key={msg.messageId} message={msg} />
            ),
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="mb-4">
                <MessageSquareDashed
                  className="w-12 h-12 text-zinc-700"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm font-medium text-zinc-400">
                Be the first to say something
              </p>
              <p className="text-xs mt-1 text-zinc-500">
                Anyone within 1km can see your messages
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ── INPUT FOOTER ── */}
      <footer
        className="flex-shrink-0 px-4 py-3 z-10"
        style={{
          backgroundColor: "rgba(9, 9, 11, 0.85)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* User identity row */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div
            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {username.charAt(0)}
          </div>
          <span className="text-xs font-medium text-zinc-500">{username}</span>
        </div>

        {/* Input row */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              id="message-input"
              value={inputText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS)
                  setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              maxLength={MAX_CHARS}
              className="pr-12 h-11 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700"
              style={{
                backgroundColor: "#18181b",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f4f4f5",
                caretColor: "#f4f4f5",
              }}
            />
            {/* Character counter */}
            <span
              className="absolute right-3 bottom-2.5 text-[10px] pointer-events-none"
              style={{
                color:
                  inputText.length >= MAX_CHARS - 20 ? "#ef4444" : "#71717a",
              }}
            >
              {inputText.length}/{MAX_CHARS}
            </span>
          </div>

          <Button
            id="send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="h-11 w-11 p-0 rounded-xl flex-shrink-0 transition-all duration-150 flex items-center justify-center"
            style={{
              backgroundColor: inputText.trim() ? "#ffffff" : "#18181b",
              color: inputText.trim() ? "#09090b" : "#71717a",
              border: inputText.trim()
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Send className="w-4 h-4 ml-0.5" strokeWidth={2} />
          </Button>
        </div>
      </footer>
    </div>
  );
}

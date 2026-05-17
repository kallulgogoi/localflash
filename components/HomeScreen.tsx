"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "@/hooks/useLocation";
import { useRoom } from "@/hooks/useRoom";
import {
  Zap,
  MapPin,
  Timer,
  Ghost,
  Loader2,
  UsersRound,
  Search,
} from "lucide-react";

export function HomeScreen() {
  const { lat, lng, loading: locLoading, requestLocation } = useLocation();
  const { status, findOrCreateRoom } = useRoom();

  const isSearching = status === "searching" || status === "joining";
  const isLoading = locLoading || isSearching;

  React.useEffect(() => {
    if (lat !== null && lng !== null && status === "idle") {
      findOrCreateRoom(lat, lng);
    }
  }, [lat, lng, status, findOrCreateRoom]);

  const handleFindRoom = () => {
    requestLocation();
  };

  const getStatusText = () => {
    if (locLoading) return "Requesting location...";
    if (status === "searching") return "Searching for people nearby...";
    if (status === "joining") return "Joining room...";
    return null;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#09090b" }}
    >
      {/* Background gradients for subtle depth */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] blur-3xl pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,255,255,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Logo / brand above card */}
      <div className="mb-8 text-center flex flex-col items-center">
        <UsersRound
          className="w-12 h-12 mb-3 text-zinc-300"
          strokeWidth={1.5}
        />
        <p className="text-xs tracking-[0.2em] uppercase font-semibold text-zinc-500">
          Anonymous · Local · Ephemeral
        </p>
      </div>

      <Card
        className="w-full max-w-sm relative overflow-hidden"
        style={{
          backgroundColor: "#121214",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
          borderRadius: "24px",
        }}
      >
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-100">
              LocalFlash
            </h1>
            <p className="text-sm text-zinc-400">
              Chat locally. Vanish completely.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {[
              {
                icon: <MapPin className="w-4 h-4" />,
                text: "1km radius — people near you only",
              },
              {
                icon: <Timer className="w-4 h-4" />,
                text: "30 minutes — then everything vanishes",
              },
              {
                icon: <Ghost className="w-4 h-4" />,
                text: "Fully anonymous — no login ever",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-zinc-400">{item.icon}</span>
                <span className="text-xs font-medium text-zinc-300">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                <p className="text-sm font-medium text-zinc-300">
                  {getStatusText()}
                </p>
              </div>
              <Progress
                value={locLoading ? 25 : status === "searching" ? 60 : 85}
                className="h-1.5 bg-zinc-800"
                style={
                  {
                    "--progress-foreground": "#fafafa",
                  } as React.CSSProperties
                }
              />
            </div>
          )}

          {/* CTA Button */}
          <Button
            id="find-room-btn"
            onClick={handleFindRoom}
            disabled={isLoading}
            className="w-full h-12 text-sm font-semibold rounded-xl transition-all duration-200"
            style={{
              backgroundColor: isLoading ? "rgba(255,255,255,0.1)" : "#ffffff",
              color: isLoading ? "#a1a1aa" : "#09090b",
              border: "none",
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Searching...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find My Room
              </span>
            )}
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs mt-6 text-zinc-500 font-medium">
            Your location is used only to match you nearby. Never stored.
          </p>
        </CardContent>
      </Card>

      {/* Bottom hint */}
      <p className="mt-8 text-xs font-medium text-zinc-600">
        No account. No history. No trace.
      </p>
    </div>
  );
}

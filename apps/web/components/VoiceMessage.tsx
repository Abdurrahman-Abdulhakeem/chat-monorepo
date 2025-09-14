/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

export const VoiceMessage = ({ message, isOwn }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef: any = useRef(null);

  // Format time display
  const formatTime = (seconds: any) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle audio events
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(message.media?.duration ?? audioRef.current.duration ?? 0);
      setIsLoaded(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleLoadStart = () => {
    setIsLoaded(false);
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
  };

  // Generate waveform bars (simplified visualization)
  const generateWaveform = () => {
    const bars = [];
    const numBars = 25;

    for (let i = 0; i < numBars; i++) {
      const height = Math.random() * 16 + 4; // Random height between 4-20px
      const isActive = duration > 0 && i / numBars <= currentTime / duration;

      bars.push(
        <div
          key={i}
          className="w-0.5 rounded-full transition-all duration-150"
          style={{
            height: `${height}px`,
            backgroundColor: isActive
              ? isOwn
                ? "rgba(255,255,255,0.9)"
                : "#3b82f6"
              : isOwn
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.3)",
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div
      className={`inline-block max-w-[280px] px-3 py-2 rounded-2xl ${
        isOwn
          ? "bg-blue-700/20 text-white/80 rounded-br-sm"
          : "bg-white/10 supports-[backdrop-filter:blur(2px)]:backdrop-blur rounded-bl-sm"
      }`}
    >
      <audio
        ref={audioRef}
        src={message.media?.url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        preload="metadata"
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isOwn
              ? "bg-white/10 hover:bg-white/20 text-white/70"
              : "bg-blue-700/10 hover:bg-blue-700/20 text-white/70"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {!isLoaded ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* Waveform */}
        <div className="flex items-center gap-0.5 flex-1 min-w-0">
          {generateWaveform()}
        </div>

        {/* Duration */}
        <span
          className={`text-xs font-medium min-w-[35px] ${
            isOwn ? "text-white/50" : "text-white/50"
          }`}
        >
          {isLoaded ? formatTime(isPlaying ? currentTime : duration) : "--:--"}
        </span>
      </div>
    </div>
  );
};

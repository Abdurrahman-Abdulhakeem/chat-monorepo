/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import {
  SendHorizontal,
  XCircle,
  ImagePlus,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
} from "lucide-react";
import api from "@/lib/api";
import Loader from "./Loader";

export function ChatInput({
  send,
  activeConv,
  socket,
  preview,
  setPreview,
  previewFile,
  getInputProps,
  open,
}: any) {
  const [value, setValue] = useState("");
  const [height, setHeight] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);

  // Voice note states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice note refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const MAX_HEIGHT = 150; // px (~6 lines)

  // Auto focus when component mounts
  useEffect(() => {
    if (window.innerWidth >= 768) {
      textareaRef.current?.focus();
    }
  }, [activeConv]);

  // Blur (lose focus) when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        textareaRef.current.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket || !activeConv) return;
    socket.emit("presence:ping", {
      convId: activeConv._id,
      typing: value.length > 0,
    });
  }, [value, socket, activeConv]);

  // Create audio URL when audioBlob changes
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  // Voice note functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context for visualization
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mimeType = MediaRecorder.isTypeSupported("audio/mp4;codecs=aac")
        ? "audio/mp4"
        : "audio/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start amplitude visualization
      updateAmplitude();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAmplitude(0);
    }
  };

  const updateAmplitude = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAmplitude(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAmplitude);
  };

  const togglePlayback = async () => {
    if (!audioRef.current || !audioUrl) {
      console.log("No audio ref or url");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
      } else {
        // Ensure audio is loaded
        if (audioRef.current.readyState < 2) {
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              audioRef.current?.removeEventListener("canplay", handleCanPlay);
              resolve(void 0);
            };
            audioRef.current?.addEventListener("canplay", handleCanPlay);
            audioRef.current?.load();
          });
        }

        await audioRef.current.play();
        setIsPlaying(true);

        // Start playback timer
        playbackTimerRef.current = setInterval(() => {
          if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            setPlaybackTime(currentTime);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error in togglePlayback:", error);
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const deleteVoiceNote = () => {
    // Stop playback if playing
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Clear timers
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // Reset states
    setAudioBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
  };

  const sendVoiceNote = async () => {
    if (!audioBlob) return;

    setVoiceLoading(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "voice-note.webm");

    try {
      const { data } = await api.post("/upload", formData);

      if (data.url) {
        await send({
          kind: "voice",
          media: {
            url: data.url,
            mime: audioBlob.type,
            size: audioBlob.size,
            duration: duration || 0,
          },
        });
      }

      deleteVoiceNote();
    } catch (error) {
      console.error("Error sending voice note:", error);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSendText = () => {
    if (!value.trim()) return;
    send({
      kind: "text",
      text: value.trim(),
    });
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset after send
      setHeight(0);
      if (window.innerWidth >= 768) {
        textareaRef.current.focus();
      }
    }
  };

  const handleSendImage = async () => {
    setImgLoading(true);
    if (!previewFile) return;

    const form = new FormData();
    form.append("file", previewFile);

    const { data } = await api.post("/upload", form);
    setImgLoading(false);

    if (data.url) {
      send({
        kind: "image",
        media: {
          url: data.url,
          mime: previewFile.type,
          size: previewFile.size,
        },
      });
    }
    setPreview(null);
    if (window.innerWidth >= 768) {
      textareaRef.current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    // Auto-grow
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset
      const newHeight = Math.min(textareaRef.current.scrollHeight, MAX_HEIGHT);
      textareaRef.current.style.height = newHeight + "px";
      setHeight(newHeight);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 768) {
      e.preventDefault();
      handleSendText();
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const borderRadiusClass = height <= 60 ? "rounded-full" : "rounded-3xl";

  // Voice note recording interface
  if (isRecording) {
    return (
      <div className="p-3 bg-neutral-950/80 border-white/10 backdrop-blur backdrop-fallback supports-[backdrop-filter:blur(2px)]:backdrop-blur">
        <div className="flex items-center gap-3  rounded-full px-4 py-2 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700/80 rounded-full animate-pulse" />
            <span className="text-sm text-green-700/80 font-medium">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Amplitude visualization */}
          <div className="flex items-center gap-0.5 flex-1 px-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-green-700/80 rounded-full transition-all duration-75 ...."
                style={{
                  height: `${Math.max(
                    4,
                    amplitude * 30 + Math.random() * 10
                  )}px`,
                  opacity: 0.6 + amplitude * 0.4,
                }}
              />
            ))}
          </div>

          <button
            onClick={stopRecording}
            className="w-8 h-8 bg-green-700/70 rounded-full flex items-center justify-center hover:bg-green-700/50 transition"
          >
            <Square className="w-3 h-3 text-white/60 fill-current" />
          </button>
        </div>
      </div>
    );
  }

  // Voice note playback interface
  if (audioBlob && audioUrl) {
    return (
      <div className="p-3 bg-neutral-950/80 border-white/10 backdrop-blur backdrop-fallback supports-[backdrop-filter:blur(2px)]:backdrop-blur">
        <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2">
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnd}
            onError={handleAudioError}
            preload="metadata"
          />

          <button
            onClick={togglePlayback}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
            disabled={!audioUrl}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white/70" />
            ) : (
              <Play className="w-4 h-4 text-white/70 ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex items-center gap-2">
            {/* Waveform visualization */}
            <div className="flex items-center gap-0.5 flex-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-white/30 rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.random() * 20 + 4}px`,
                    backgroundColor:
                      duration > 0 && i < (playbackTime / duration) * 20
                        ? "#3b82f6"
                        : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>

            <span className="text-xs text-white/60 min-w-[35px]">
              {formatTime(isPlaying ? playbackTime : duration)}
            </span>
          </div>

          <button
            onClick={deleteVoiceNote}
            className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition"
          >
            <Trash2 className="w-4 h-4 text-white/60" />
          </button>

          <button
            onClick={sendVoiceNote}
            disabled={voiceLoading}
            className="py-3 h-8 w-8 relative flex justify-center rounded-full transition hover:bg-white/60 cursor-pointer bg-white/85 text-black disabled:opacity-50"
          >
            {voiceLoading ? (
              <span className="flex items-center justify-center inset-0 absolute transition">
                <Loader size={18} />
              </span>
            ) : (
              <SendHorizontal className="w-5 h-4 rotate-12 skew-x-[25deg] -mt-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-neutral-950/80 border-white/10 backdrop-blur flex gap-2 backdrop-fallback supports-[backdrop-filter:blur(2px)]:backdrop-blur">
      <div
        className={`bg-white/5 pb-1 flex items-baseline-last w-full ${borderRadiusClass}`}
      >
        <div
          onClick={open}
          className="cursor-pointer hover:bg-white/5 transition absolute bottom-4 left-5 w-10 h-10 justify-center rounded-full flex items-center"
        >
          <input {...getInputProps()} />
          <ImagePlus className="size-5 mt-1" />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message peer"
          rows={1}
          className={`max-h-[150px] w-full resize-none ml-10 mr-13 bg-transparent px-4 pr-0 py-2 pt-4 outline-none leading-5 break-words ${borderRadiusClass}`}
        />

        {value.trim() ? (
          <button
            onClick={handleSendText}
            className="py-3 h-10 w-10 flex justify-center absolute right-5 bottom-4 rounded-full transition hover:bg-white/60 cursor-pointer bg-white/85 text-black"
          >
            <SendHorizontal className="w-5 h-5 rotate-12 skew-x-[25deg]" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-10 h-10 absolute right-5 bottom-4 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <Mic className="w-5 h-5 text-white/80" />
          </button>
        )}
      </div>

      {preview && (
        <div className="absolute bottom-16 right-4 bg-black/80 p-2 z-30 rounded-lg">
          <XCircle
            onClick={() => setPreview(null)}
            className="w-5 h-5 hover:text-gray-500 transition cursor-pointer"
          />
          <div className="relative">
            {imgLoading && (
              <span className="flex items-center justify-center h-full w-full absolute transition bg-black/40">
                <Loader size={23} />
              </span>
            )}
            <img src={preview} alt="preview" className="max-w-[120px]" />
          </div>
          <div className="flex gap-2 mt-1 w-full">
            <button
              onClick={handleSendImage}
              className="px-2 py-1 ml-auto h-10 w-10 flex items-center justify-center hover:bg-white/60 cursor-pointer bg-white/85 text-black rounded-full"
            >
              <SendHorizontal className="w-5 h-5 rotate-12 skew-x-[25deg]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

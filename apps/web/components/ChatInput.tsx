/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { SendHorizontal, XCircle, ImagePlus } from "lucide-react";
import api from "@/lib/api";

export function ChatInput({ send, activeConv, socket }: any) {
  const [value, setValue] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [height, setHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_HEIGHT = 150; // px (~6 lines)

  useEffect(() => {
    if (!socket || !activeConv) return;
    socket.emit("presence:ping", {
      convId: activeConv._id,
      typing: value.length > 0,
    });
  }, [value, socket, activeConv]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setPreviewFile(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  const handleSendText = () => {
    if (!value.trim()) return;
    send({
      kind: "text",
      text: value,
    });
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset after send
      setHeight(0);
    }
  };

  const handleSendImage = async () => {
    if (!previewFile) return;

    const form = new FormData();
    form.append("file", previewFile);

    const { data } = await api.post("/upload", form);
    console.log(data);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const borderRadiusClass = height <= 60 ? "rounded-full" : "rounded-3xl";

  return (
    <div className="p-3 bg-neutral-950/80 border-white/10 backdrop-blur flex gap-2 backdrop-fallback supports-[backdrop-filter:blur(2px)]:backdrop-blur">
      <div
        className={`bg-white/5 pb-1 flex items-baseline-last w-full ${borderRadiusClass}`}
      >
        <div
          {...getRootProps()}
          className="cursor-pointer hover:bg-white/5 transition absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 justify-center rounded-full flex items-center"
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

        {value.trim() && (
          <button
            onClick={handleSendText}
            className="px- py-3 h-10 w-10 flex justify-center absolute right-5 rounded-full transition hover:bg-white/60 cursor-pointer bg-white/85 text-black "
          >
            <SendHorizontal className="w-5 h-5 rotate-12 skew-x-[25deg]" />
          </button>
        )}
      </div>

      {preview && (
        <div className="absolute bottom-16 right-4 bg-black/80 p-2 z-30 rounded-lg">
          <XCircle
            onClick={() => setPreview(null)}
            className="w-5 h-5 hover:text-gray-500 transition cursor-pointer"
          />
          <img src={preview} alt="preview" className="max-w-[120px]" />
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

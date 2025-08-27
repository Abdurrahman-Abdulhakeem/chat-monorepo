"use client";
import { motion } from "framer-motion";

export default function Loader({ size = 32 }: { size?: number }) {
  const dots = [0, 1, 2];
  return (
    <div className="flex h-dvh bg-amber-800 w-[100vw] items-center justify-center gap-1">
      {dots.map((d) => (
        <motion.span
          key={d}
          className="block rounded-full bg-white"
          style={{ width: size / 5, height: size / 5 }}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: d * 0.2,
          }}
        />
      ))}
    </div>
  );
}

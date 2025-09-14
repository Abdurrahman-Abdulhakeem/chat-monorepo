import { AnimatePresence, motion } from "framer-motion";

interface Props {
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
}

export const PreviewImage = ({ selectedImage, setSelectedImage }: Props) => {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            ✕
          </button>
          <motion.img
            key={selectedImage}
            src={selectedImage}
            alt="preview"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

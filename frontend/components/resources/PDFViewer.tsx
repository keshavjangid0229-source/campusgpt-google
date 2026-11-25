
"use client";

import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

import { motion } from "motion/react";

import {
  FileText,
  X,
  Download,
  Maximize,
  Minimize,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import type { Resource } from "../../data/resources";

type Props = {
  resource: Resource;
  onClose: () => void;
  onAsk: (resource: Resource) => void;
};

export default function PDFViewer({
  resource,
  onClose,
  onAsk,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md md:p-6"
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={resource.title}
        initial={{ scale: 0.97, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
        className={`flex flex-col overflow-hidden border border-[#a1efc725] bg-[#0c1b15] shadow-2xl ${
          fullscreen
            ? "fixed inset-0 rounded-none"
            : "h-[90dvh] w-full max-w-6xl rounded-2xl"
        }`}
      >
        {/* Toolbar */}

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#a1efc715] px-3 py-4 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden rounded-lg bg-[#a1efc710] p-3 text-[#a1efc7] sm:block">
              <FileText size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">
                {resource.title}
              </h2>

              <p className="mt-1 text-[10px] text-[#8fa69b]">
                Semester {resource.semester} · PDF
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-[#8fa69b] md:gap-2">
            <a
              href={resource.fileUrl}
              download
              aria-label="Download PDF"
              className="rounded-lg p-2 hover:bg-white/5 hover:text-white"
            >
              <Download size={18} />
            </a>

            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open PDF in new tab"
              className="rounded-lg p-2 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink size={18} />
            </a>

            <button
              onClick={() =>
                setFullscreen((value) => !value)
              }
              aria-label={
                fullscreen
                  ? "Exit fullscreen"
                  : "Fullscreen"
              }
              className="hidden rounded-lg p-2 hover:bg-white/5 hover:text-white sm:block"
            >
              {fullscreen ? (
                <Minimize size={18} />
              ) : (
                <Maximize size={18} />
              )}
            </button>

            <button
              autoFocus
              onClick={onClose}
              aria-label="Close PDF viewer"
              className="rounded-lg p-2 hover:bg-red-500/10 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Native browser PDF viewer */}

        <div className="min-h-0 flex-1 bg-[#060d0b]">
          <iframe
            src={resource.fileUrl}
            title={resource.title}
            className="h-full w-full border-none"
          />
        </div>

        {/* AI document action */}

        <footer className="shrink-0 border-t border-[#a1efc715] p-3 md:p-4">
          <button
            onClick={() => onAsk(resource)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a1efc710] px-4 py-3 text-xs font-medium text-[#a1efc7] transition hover:bg-[#a1efc720] md:text-sm"
          >
            <Sparkles size={18} />
            Ask CampusGPT about this document
          </button>

          <p className="mt-2 text-center text-[10px] text-[#8fa69b]">
            Start a chat with this PDF as context.
          </p>
        </footer>
      </motion.section>
    </motion.div>,
    document.body
  );
}

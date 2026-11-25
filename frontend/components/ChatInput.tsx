"use client";

import { useEffect, useRef, useState } from "react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import {
  Plus,
  ArrowUp,
  Orbit,
  Paperclip,
  FileText,
  X,
  BrainCircuit,
  BookOpen,
  LoaderCircle,
} from "lucide-react";

type ChatInputProps = {
  onSend: (message: string, pdf?: File) => void;
  loading?: boolean;
  disabled?: boolean;
};

const MAX_LENGTH = 8000;
const MAX_FILE_SIZE = 1024 * 1024;

export default function ChatInput({
  onSend,
  loading = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachment, setAttachment] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const readVersion = useRef(0);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height =
      Math.min(textarea.scrollHeight, 180) + "px";
  }, [input]);

  async function handleFile(file?: File) {
    if (!file) return;

    const version = ++readVersion.current;

    setError("");
    setMenuOpen(false);

    if (/\.pdf$/i.test(file.name)) {
      setReading(false);
      if (file.size > 10 * MAX_FILE_SIZE) {
        setError("Maximum PDF size is 10 MB.");
        return;
      }
      setPdf(file);
      setAttachment(null);
      textareaRef.current?.focus();
      return;
    }

    if (!/\.(txt|md|csv)$/i.test(file.name)) {
      setError("Choose a PDF, TXT, MD, or CSV file.");
      setReading(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum file size is 1 MB.");
      setReading(false);
      return;
    }

    setReading(true);

    try {
      const content = await file.text();

      if (version !== readVersion.current) return;

      if (content.length > MAX_LENGTH) {
        setError("File content exceeds 8000 characters.");
        return;
      }

      setAttachment({
        name: file.name,
        content,
      });
      setPdf(null);

      textareaRef.current?.focus();

    } catch {
      if (version === readVersion.current) {
        setError("Unable to read the selected file.");
      }
    } finally {
      if (version === readVersion.current) {
        setReading(false);
      }
    }
  }

  const fullMessage = attachment
    ? `${input.trim() || "Summarize this file."}\n\nAttached file: ${attachment.name}\n\n${attachment.content}`
    : input.trim() || (pdf ? "Make detailed study notes for the whole PDF." : "");

  const canSend =
    Boolean(fullMessage) &&
    fullMessage.length <= MAX_LENGTH &&
    !loading &&
    !disabled &&
    !reading;

  function submitMessage() {
    if (!canSend) return;

    onSend(fullMessage, pdf ?? undefined);

    setInput("");
    setAttachment(null);
    setPdf(null);
    setMenuOpen(false);
    setError("");
  }

  function applyPrompt(prompt: string) {
    setInput(prompt);
    setMenuOpen(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="relative mx-auto w-full max-w-[850px] shrink-0 px-4 pb-5">

      {/* Prompt shortcuts */}

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">

        {[
          "Summarize notes",
          "Explain a topic",
          "Generate quiz",
        ].map((prompt) => (

          <button
            key={prompt}
            type="button"
            disabled={disabled || loading}
            onClick={() => applyPrompt(prompt + ": ")}
            className="shrink-0 rounded-full border border-[#a1efc720] bg-[#10261f]/40 px-3 py-1.5 text-[11px] text-[#8fa69b] transition hover:border-[#a1efc760] hover:text-[#a1efc7] disabled:opacity-40"
          >
            {prompt}
          </button>

        ))}

      </div>

      {/* Hidden file picker */}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.md,.csv"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {/* Main composer */}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage();
        }}
        className="relative rounded-[24px] border border-[#a1efc730] bg-[#10261f] p-4 shadow-2xl transition-colors focus-within:border-[#a1efc780]"
      >

        {/* Attachment preview */}

        <AnimatePresence>

          {(attachment || pdf) && (

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: 5 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex max-w-full items-center gap-3 rounded-xl border border-[#a1efc725] bg-[#060d0b]/60 p-3 sm:w-fit"
            >

              <div className="rounded-lg bg-[#a1efc715] p-2 text-[#a1efc7]">
                <FileText size={22} />
              </div>

              <div className="min-w-0">

                <p className="max-w-[180px] truncate text-xs font-medium">
                  {pdf?.name ?? attachment?.name}
                </p>

                <p className="mt-1 text-[10px] text-[#8fa69b]">
                  {pdf ? "PDF attachment" : "Text attachment"}
                </p>

              </div>

              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => {
                  readVersion.current += 1;
                  setReading(false);
                  setAttachment(null);
                  setPdf(null);
                }}
                className="ml-auto rounded-full p-1 text-[#8fa69b] hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>

            </motion.div>

          )}

        </AnimatePresence>

        {/* Auto expanding textarea */}

        <textarea
          ref={textareaRef}
          value={input}
          maxLength={MAX_LENGTH}
          rows={1}
          disabled={disabled}
          onChange={(event) => {
            setInput(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submitMessage();
            }
          }}
          placeholder="Ask CampusGPT anything..."
          aria-label="Message CampusGPT"
          className="min-h-[42px] w-full resize-none bg-transparent text-sm leading-7 text-[#f1f5f2] outline-none placeholder:text-[#8fa69b]"
        />

        {/* Error message */}

        {error && (
          <p role="alert" className="mb-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {fullMessage.length > MAX_LENGTH && (
          <p className="mb-2 text-xs text-red-400">
            Message and attachment exceed the character limit.
          </p>
        )}

        {/* Bottom toolbar */}

        <div className="mt-3 flex items-center justify-between gap-2">

          <div className="flex items-center gap-3">

            {/* Tools menu */}

            <div className="relative">

              <motion.button
                type="button"
                whileTap={
                  reducedMotion ? {} : { scale: 0.9 }
                }
                disabled={disabled || loading || reading}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open chat tools"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#a1efc725] text-[#a1efc7] transition hover:bg-[#a1efc715] disabled:opacity-40"
              >

                <motion.span
                  animate={{
                    rotate: menuOpen ? 45 : 0,
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.2,
                  }}
                >
                  <Plus size={20} />
                </motion.span>

              </motion.button>

              <AnimatePresence>

                {menuOpen && (

                  <motion.div
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 8, scale: 0.97 }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute bottom-12 left-0 z-50 w-56 rounded-2xl border border-[#a1efc725] bg-[#0c1b15] p-2 shadow-2xl"
                  >

                    <p className="px-3 py-2 text-[10px] tracking-[2px] text-[#8fa69b]">
                      CHAT TOOLS
                    </p>

                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs hover:bg-white/5"
                    >
                      <Paperclip
                        size={17}
                        className="text-[#a1efc7]"
                      />

                      Attach PDF or text file
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyPrompt("Summarize these notes: ")
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs hover:bg-white/5"
                    >
                      <BookOpen
                        size={17}
                        className="text-[#a1efc7]"
                      />

                      Summarize notes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyPrompt("Create a practice quiz on ")
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs hover:bg-white/5"
                    >
                      <BrainCircuit
                        size={17}
                        className="text-[#a1efc7]"
                      />

                      Create quiz
                    </button>

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

            <div className="flex items-center gap-2 text-xs text-[#8fa69b]">

              <Orbit size={17} />

              <span className="hidden sm:inline">
                Campus AI
              </span>

            </div>

          </div>

          {/* Send button */}

          <div className="flex items-center gap-3">

            <span className="text-[10px] text-[#8fa69b]">
              {fullMessage.length}/{MAX_LENGTH}
            </span>

            <motion.button
              type="submit"
              aria-label="Send message"
              disabled={!canSend}
              whileHover={
                canSend && !reducedMotion
                  ? { scale: 1.06 }
                  : {}
              }
              whileTap={
                canSend && !reducedMotion
                  ? { scale: 0.94 }
                  : {}
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a1efc7] text-[#060d0b] transition-colors hover:bg-[#c6ffe0] disabled:cursor-not-allowed disabled:opacity-30"
            >

              {loading || reading ? (

                <LoaderCircle
                  size={20}
                  className="motion-safe:animate-spin"
                />

              ) : (

                <ArrowUp size={22} />

              )}

            </motion.button>

          </div>

        </div>

      </form>

      <p className="mt-3 text-center text-[10px] text-[#657d70]">
        CampusGPT can make mistakes. Verify important academic information.
      </p>

    </div>
  );
}

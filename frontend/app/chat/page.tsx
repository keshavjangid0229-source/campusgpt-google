
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import {
  PanelLeft,
  ArrowLeft,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";

import WelcomeScreen from "../../components/WelcomeScreen";

import ChatInput from "../../components/ChatInput";

import ChatMessage from "../../components/ChatMessage";

import TypingIndicator from "../../components/TypingIndicator";

import StudyResources from "../../components/resources/StudyResources";

import useChatHistory from "../../hooks/useChatHistory";
import type { Resource } from "../../data/resources";
import CampusPlanner from "../../components/CampusPlanner";

const personalities = [
  "auto", "default", "coding", "study", "research", "creative", "professional",
];
const requestTimeout = 185000;
const detailedNotesPrompt = "Make detailed study notes for the whole PDF.";
const notesRequest = /\b(?:summari[sz]e|summary|notes|bullet points)\b|सारांश|नोट्स/i;
const focusedPdfRequest = /\b(?:unit|module|chapter|page)\s*[-:#]?\s*(?:\d+|[ivx]+)\b/i;
const semesterPdfRequest = /\b(?:semester|sem)\b/i;
const syllabusOverview = /\b(?:full|whole|entire|complete|pura|poora|sara) syllabus\b|\b(?:list|show|give me) (?:all|the) (?:syllabus|units|modules)\b|पूरा पाठ्यक्रम/i;
const settingsKey = "campusgpt-ai-settings";

function subscribeToDesktop(callback: () => void) {
  const query = window.matchMedia("(min-width: 768px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "CampusGPT could not complete the request. Check that the AI backend is running.",
    );
  }
  return data;
}

export default function ChatPage() {
  const history = useChatHistory();

  const reducedMotion = useReducedMotion();

  const desktop = useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
  const [sidebarOverride, setSidebarOpen] = useState<boolean | null>(null);
  const sidebarOpen = sidebarOverride ?? desktop;

  const [activePanel, setActivePanel] =
    useState("AI Chat");

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [composerVersion, setComposerVersion] =
    useState(0);
  const [personality, setPersonality] = useState("auto");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [settingsReady, setSettingsReady] = useState(false);
  const [error, setError] = useState("");
  const [notesProgress, setNotesProgress] = useState("");
  const [deleting, setDeleting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const busyRef = useRef(false);

  const messages =
    history.activeChat?.messages ?? [];

  const loading = loadingId !== null || deleting;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(settingsKey) ?? "{}");
        if (personalities.includes(saved?.personality)) setPersonality(saved.personality);
        if (typeof saved?.memoryEnabled === "boolean") setMemoryEnabled(saved.memoryEnabled);
      } catch {
        setError("Saved AI settings could not be loaded.");
      }
      setSettingsReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function saveSettings(mode: string, memory: boolean) {
    setPersonality(mode);
    setMemoryEnabled(memory);
    try {
      localStorage.setItem(settingsKey, JSON.stringify({ personality: mode, memoryEnabled: memory }));
      setError("");
    } catch {
      setError("Settings apply for this visit. This browser could not save them.");
    }
  }

  // Scroll to latest message

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reducedMotion
        ? "instant"
        : "smooth",
    });
  }, [
    history.activeChat,
    loadingId,
    activePanel,
    reducedMotion,
  ]);

  function startNewChat() {
    history.newChat();

    setActivePanel("AI Chat");

    setComposerVersion((value) => value + 1);
  }

  function selectChat(id: string) {
    history.selectChat(id);

    setActivePanel("AI Chat");

    setComposerVersion((value) => value + 1);
  }

  // Send message

  async function sendMessage(
    question: string,
    options: { pdf?: File; resource?: Resource } = {},
  ) {
    const text = question.trim();

    if (
      !text ||
      text.length > 8000 ||
      busyRef.current ||
      !history.ready || !settingsReady
    ) {
      return;
    }

    busyRef.current = true;
    setError("");

    const chatId = options.resource
      ? history.createChat(text)
      : history.activeId ??
        history.createChat(text);
    let document = options.resource ? undefined : history.activeChat?.document;
    const completedNotes: string[] = [];

    setLoadingId(chatId);

    setActivePanel("AI Chat");

    history.addMessage(chatId, {
      role: "user",
      content: options.pdf ? `${text}\n\nPDF: ${options.pdf.name}` : text,
    });

    try {
      let pdf: Blob | undefined = options.pdf;
      const filename = options.pdf?.name ?? options.resource?.title;
      if (options.resource) {
        const response = await fetch(options.resource.fileUrl, {
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) throw new Error("This study resource could not be opened.");
        pdf = await response.blob();
      }
      if (pdf && filename) {
        const file = new FormData();
        file.append("file", pdf, /\.pdf$/i.test(filename) ? filename : `${filename}.pdf`);
        const indexed = await readResponse(await fetch("/api/campus/pdf/upload", {
          method: "POST",
          body: file,
          signal: AbortSignal.timeout(requestTimeout),
        }));
        if (typeof indexed.document_id !== "string") {
          throw new Error("The backend returned an invalid PDF reference.");
        }
        document = { id: indexed.document_id, name: filename };
        history.setDocument(chatId, document);
        if (Array.isArray(indexed.unreadable_pages) && indexed.unreadable_pages.length) {
          const pages = indexed.unreadable_pages.filter(Number.isSafeInteger);
          history.addMessage(chatId, {
            role: "assistant",
            content: `PDF ke pages ${pages.join(", ")} poori tarah readable nahi the. Notes aur answers mein sirf readable text use hoga.`,
          });
        }
      }

      const documentId = text.toLowerCase().includes("attached file:") ? undefined : document?.id;
      if (documentId && !semesterPdfRequest.test(text)
        && (syllabusOverview.test(text) || (notesRequest.test(text) && !focusedPdfRequest.test(text)))) {
        setNotesProgress("Preparing detailed PDF notes…");
        let totalSections = 1;
        for (let section = 0; section < totalSections; section++) {
          const part = await readResponse(await fetch("/api/campus/pdf/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              document_id: documentId,
              section,
            }),
            signal: AbortSignal.timeout(requestTimeout),
          }));
          if (part.section !== section || !Number.isSafeInteger(part.total_sections)
            || part.total_sections <= section || typeof part.notes !== "string") {
            throw new Error("The backend returned an invalid notes section.");
          }
          totalSections = part.total_sections;
          completedNotes.push(part.notes);
          setNotesProgress(`PDF notes · ${completedNotes.length} of ${totalSections} sections done`);
        }
        history.addMessage(chatId, { role: "assistant", content: completedNotes.join("\n\n") });
        return;
      }
      if (!documentId && memoryEnabled) history.markBackendMemory(chatId);

      const response = await fetch(
        "/api/campus/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: text,
            conversation_id: chatId,
            personality,
            memory_enabled: memoryEnabled,
            document_id: documentId,
          }),

          signal: AbortSignal.timeout(requestTimeout),
        }
      );

      const data = await readResponse(response);

      if (typeof data.reply !== "string") {
        throw new Error(
          "Invalid backend response"
        );
      }

      history.addMessage(chatId, {
        role: "assistant",
        content: data.reply,
        contextStats: data.context_stats ?? undefined,
      });
    } catch (error) {
      if (completedNotes.length) {
        history.addMessage(chatId, {
          role: "assistant",
          content: `**Partial PDF notes.** Generation stopped after section ${completedNotes.length}.\n\n${completedNotes.join("\n\n")}`,
        });
      }
      history.addMessage(chatId, {
        role: "assistant",
        content:
          error instanceof Error && error.name === "TimeoutError"
            ? "The AI backend took too long to respond. Try again in a moment."
            : error instanceof TypeError
              ? "Unable to reach CampusGPT. Check that the AI backend is running."
              : error instanceof Error ? error.message : "CampusGPT could not complete the request.",
      });
    } finally {
      setNotesProgress("");
      setLoadingId(null);

      busyRef.current = false;
    }
  }

  // Start a document-related conversation

  function askAboutDocument(resource: Resource) {
    if (busyRef.current || !history.ready) {
      window.alert(
        "Please wait until the current response is complete."
      );

      return;
    }

    setComposerVersion((value) => value + 1);

    void sendMessage(detailedNotesPrompt, { resource });
  }

  async function deleteChat(id: string) {
    if (busyRef.current) {
      setError("Wait for the current request to finish before deleting a conversation.");
      return;
    }
    if (!history.chats.find((chat) => chat.id === id)?.backendMemory) {
      history.deleteChat(id);
      return;
    }
    busyRef.current = true;
    setDeleting(true);
    setError("");
    try {
      await readResponse(await fetch(`/api/campus/memory/clear/${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(15000),
      }));
      history.deleteChat(id);
    } catch {
      setError("CampusGPT could not clear backend memory. The conversation was kept so you can retry.");
    } finally {
      setDeleting(false);
      busyRef.current = false;
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#060d0b] text-[#f1f5f2]">
      {/* Sidebar */}

      <Sidebar
        open={sidebarOpen}
        chats={history.chats}
        activeId={history.activeId}
        activePanel={activePanel}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onRename={history.renameChat}
        onTogglePin={history.togglePin}
        onPanelChange={setActivePanel}
      />

      {/* Main workspace */}

      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Ambient background */}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(85,217,155,0.045), transparent 60%)",
          }}
        />

        {/* Header */}

        <header className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-[#a1efc710] px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              aria-label="Toggle sidebar"
              className="rounded-lg p-2 text-[#8fa69b] transition hover:bg-white/5 hover:text-white"
            >
              <PanelLeft size={21} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium md:text-base">
                {activePanel === "AI Chat"
                  ? "Campus Intelligence"
                  : activePanel}
              </h2>

              <p className="truncate text-[10px] text-[#8fa69b]">
                {activePanel === "AI Chat"
                  ? history.activeChat?.title ??
                    "Neural Flow Edition"
                  : "USAR Academic Workspace"}
              </p>
            </div>
          </div>

          <div className="ml-2 flex shrink-0 items-center gap-2 rounded-full border border-[#a1efc720] px-3 py-2 text-[10px] text-[#a1efc7]">
            <span className="h-2 w-2 rounded-full bg-[#a1efc7]" />

            Preview
          </div>
        </header>

        {error && <p role="alert" className="px-5 py-2 text-sm text-red-300">{error}</p>}

        {/* AI Chat workspace */}

        {activePanel === "AI Chat" ? (
          <>
            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
              <AnimatePresence mode="wait">
                {messages.length === 0 ? (
                  <WelcomeScreen
                    key="welcome"
                    onSelect={(question) => void sendMessage(question)}
                    disabled={
                      loading || !history.ready || !settingsReady
                    }
                  />
                ) : (
                  <motion.div
                    key={history.activeId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reducedMotion
                        ? 0
                        : 0.25,
                    }}
                    onAnimationComplete={() => {
                      bottomRef.current?.scrollIntoView(
                        { behavior: "instant" }
                      );
                    }}
                    className="mx-auto w-full max-w-[850px] space-y-8 px-5 py-8"
                  >
                    {messages.map(
                      (message, index) => (
                        <ChatMessage
                          key={index}
                          role={message.role}
                          content={message.content}
                          contextStats={message.contextStats}
                        />
                      )
                    )}

                    {loadingId !== null &&
                      loadingId ===
                        history.activeId && (
                        (notesProgress
                          ? <p role="status" className="text-sm text-[#a1efc7]">{notesProgress}</p>
                          : <TypingIndicator />)
                      )}

                    <div ref={bottomRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-auto flex w-full max-w-[850px] flex-wrap items-center gap-3 px-4 pb-2 text-xs text-[#a1efc7]">
              <label className="flex items-center gap-2">
                AI mode
                <select
                  value={personality}
                  disabled={!settingsReady}
                  onChange={(event) => saveSettings(event.target.value, memoryEnabled)}
                  className="rounded-lg border border-[#a1efc725] bg-[#10261f] px-2 py-1 capitalize"
                >
                  {personalities.map((mode) => <option key={mode}>{mode}</option>)}
                </select>
              </label>
              {history.activeChat?.document && (
                <>
                <button
                  type="button"
                  disabled={loading || !settingsReady}
                  onClick={() => void sendMessage(detailedNotesPrompt)}
                  className="rounded-lg border border-[#a1efc725] px-2 py-1 disabled:opacity-40"
                >
                  Generate detailed PDF notes
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (history.activeId) history.setDocument(history.activeId, undefined);
                  }}
                  className="max-w-full truncate rounded-lg border border-[#a1efc725] px-2 py-1 disabled:opacity-40"
                >
                  Remove PDF context · {history.activeChat.document.name}
                </button>
                </>
              )}
            </div>
            <ChatInput
              key={composerVersion}
              onSend={(message, pdf) => void sendMessage(message, { pdf })}
              loading={loading}
              disabled={!history.ready || !settingsReady}
            />
          </>
        ) : activePanel === "Study resources" ? (
          /* Study resources workspace */

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <StudyResources
              onAsk={askAboutDocument}
            />
          </div>
        ) : (
          /* Remaining college workspaces */

          <motion.div
            key={activePanel}
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="relative flex-1 overflow-y-auto p-6 md:p-10"
          >
            <button
              onClick={() =>
                setActivePanel("AI Chat")
              }
              className="mb-8 flex items-center gap-2 text-sm text-[#a1efc7]"
            >
              <ArrowLeft size={17} />

              Back to chat
            </button>

            <h1 className="text-3xl font-semibold tracking-tight">
              {activePanel}
            </h1>

            {activePanel === "Settings" ? (
              <section className="mt-6 max-w-xl space-y-5 rounded-2xl border border-[#a1efc720] bg-[#10261f] p-5">
                <label className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>Default AI mode</span>
                  <select
                    disabled={!settingsReady}
                    value={personality}
                    onChange={(event) => saveSettings(event.target.value, memoryEnabled)}
                    className="rounded-lg border border-[#a1efc725] bg-[#060d0b] px-3 py-2 capitalize"
                  >
                    {personalities.map((mode) => <option key={mode}>{mode}</option>)}
                  </select>
                </label>
                <div>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      disabled={!settingsReady}
                      checked={memoryEnabled}
                      onChange={(event) => saveSettings(personality, event.target.checked)}
                      className="accent-[#a1efc7]"
                    />
                    Use AI conversation memory
                  </label>
                  <p className="mt-2 text-xs text-[#8fa69b]">
                    Turning this off pauses backend memory for future messages. This browser still keeps your chat history.
                  </p>
                </div>
              </section>
            ) : (
              <CampusPlanner key={activePanel} kind={activePanel === "Exam schedule" ? "exam" : "notice"} />
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

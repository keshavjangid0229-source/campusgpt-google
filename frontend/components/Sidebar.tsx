
"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { motion, AnimatePresence } from "motion/react";

import {

  Orbit,
  Plus,
  Search,
  MessageSquare,
  BookOpen,
  CalendarDays,
  Bell,
  Settings,
  ArrowLeft,
  PanelLeftClose,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  Pin,
  PinOff,
  Download,
  FileJson,
  History,

} from "lucide-react";

import type { Chat } from "../hooks/useChatHistory";


type SidebarProps = {

  open: boolean;

  chats: Chat[];

  activeId: string | null;

  activePanel: string;

  onClose: () => void;

  onNewChat: () => void;

  onSelect: (id: string) => void;

  onDelete: (id: string) => void;

  onRename: (id: string, title: string) => void;

  onTogglePin: (id: string) => void;

  onPanelChange: (panel: string) => void;

};


const navigation = [

  { name: "AI Chat", icon: MessageSquare },

  { name: "Study resources", icon: BookOpen },

  { name: "Exam schedule", icon: CalendarDays },

  { name: "Campus notices", icon: Bell },

];


// Download conversation

function exportChat(

  chat: Chat,

  format: "markdown" | "json"

) {

  const safeTitle = chat.title
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 60) || "conversation";

  let content = "";

  let extension = "";

  let mime = "";

  if (format === "json") {

    content = JSON.stringify(chat, null, 2);

    extension = "json";

    mime = "application/json";

  } else {

    content = [

      `# ${chat.title}`,

      "",

      "Exported from CampusGPT",

      "",

      `Created: ${new Date(chat.createdAt).toLocaleString()}`,

      "",

      ...chat.messages.map((message) => [

        `## ${message.role === "user" ? "Student" : "CampusGPT"}`,

        "",

        message.content,

        "",

        "---",

        "",

      ].join("\n")),

    ].join("\n");

    extension = "md";

    mime = "text/markdown;charset=utf-8";

  }

  const blob = new Blob([content], { type: mime });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `CampusGPT-${safeTitle}.${extension}`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.setTimeout(() => {

    URL.revokeObjectURL(url);

  }, 1000);

}


// Conversation grouping

function groupChats(chats: Chat[], now: Date) {

  const today = new Date(now);

  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);

  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, Chat[]> = {

    "Pinned": [],

    "Today": [],

    "Yesterday": [],

    "Previous 7 Days": [],

    "Older": [],

  };

  const sorted = [...chats].sort(

    (a, b) => b.updatedAt - a.updatedAt

  );

  sorted.forEach((chat) => {

    if (chat.pinned) {

      groups["Pinned"].push(chat);

    } else if (chat.updatedAt >= today.getTime()) {

      groups["Today"].push(chat);

    } else if (chat.updatedAt >= yesterday.getTime()) {

      groups["Yesterday"].push(chat);

    } else if (chat.updatedAt >= lastWeek.getTime()) {

      groups["Previous 7 Days"].push(chat);

    } else {

      groups["Older"].push(chat);

    }

  });

  return groups;

}


export default function Sidebar({

  open,

  chats,

  activeId,

  activePanel,

  onClose,

  onNewChat,

  onSelect,

  onDelete,

  onRename,

  onTogglePin,

  onPanelChange,

}: SidebarProps) {

  const [search, setSearch] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  const [menuId, setMenuId] = useState<string | null>(null);

  const [renameId, setRenameId] = useState<string | null>(null);

  const [renameValue, setRenameValue] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [calendarDate, setCalendarDate] = useState<Date | null>(null);


  // Refresh date grouping periodically

  useEffect(() => {
    const updateDate = () => setCalendarDate(new Date());
    const frame = window.requestAnimationFrame(updateDate);
    const timer = window.setInterval(updateDate, 60000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);


  // Close menus on Escape or outside click

  useEffect(() => {

    function handleKey(event: KeyboardEvent) {

      if (event.key === "Escape") {

        setMenuId(null);

        setRenameId(null);

        setDeleteId(null);

      }

    }

    function handleOutside(event: MouseEvent) {

      if (

        event.target instanceof Element &&

        !event.target.closest("[data-chat-menu]")

      ) {

        setMenuId(null);

      }

    }

    document.addEventListener("keydown", handleKey);

    document.addEventListener("click", handleOutside);

    return () => {

      document.removeEventListener("keydown", handleKey);

      document.removeEventListener("click", handleOutside);

    };

  }, []);


  const query = search.trim().toLowerCase();

  const filteredChats = chats.filter((chat) => {

    if (!query) return true;

    return (

      chat.title.toLowerCase().includes(query) ||

      chat.messages.some((message) =>

        message.content.toLowerCase().includes(query)

      )

    );

  });

  const groups = calendarDate ? groupChats(filteredChats, calendarDate) : {};


  function closeOnMobile() {

    if (window.innerWidth < 768) {

      onClose();

    }

  }


  function handleSelect(id: string) {

    onSelect(id);

    setMenuId(null);

    closeOnMobile();

  }


  function handleRename() {

    if (renameId && renameValue.trim()) {

      onRename(renameId, renameValue);

    }

    setRenameId(null);

    setRenameValue("");

  }


  return (

    <>

      <AnimatePresence>

        {open && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onClick={onClose}

            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"

          />

        )}

      </AnimatePresence>


      <AnimatePresence>

        {open && (

          <motion.aside

            initial={{ width: 0, opacity: 0 }}

            animate={{ width: 270, opacity: 1 }}

            exit={{ width: 0, opacity: 0 }}

            transition={{ duration: 0.25 }}

            className="fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-[#a1efc715] bg-[#0c1b15] md:relative md:z-20"

          >

            <div className="flex h-full w-[270px] flex-col">


              {/* Brand */}

              <div className="flex items-center justify-between px-5 pb-5 pt-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a1efc730] bg-[#a1efc710]">

                    <Orbit size={24} className="text-[#a1efc7]" />

                  </div>

                  <div>

                    <h1 className="text-sm font-semibold text-white">

                      CampusGPT

                    </h1>

                    <p className="text-[10px] text-[#8fa69b]">

                      Neural Workspace

                    </p>

                  </div>

                </div>

                <button

                  onClick={onClose}

                  aria-label="Close sidebar"

                  className="rounded-lg p-2 text-[#8fa69b] hover:bg-white/5 hover:text-white"

                >

                  <PanelLeftClose size={18} />

                </button>

              </div>


              {/* New chat */}

              <div className="px-4">

                <motion.button

                  whileTap={{ scale: 0.97 }}

                  onClick={() => {

                    onNewChat();

                    closeOnMobile();

                  }}

                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a1efc7] px-4 py-3 text-sm font-semibold text-[#060d0b] transition hover:bg-[#bdf8d9]"

                >

                  <Plus size={18} />

                  New chat

                </motion.button>

              </div>


              {/* Search */}

              <div className="mt-4 px-4">

                <button

                  onClick={() => {

                    setSearchOpen(!searchOpen);

                    setSearch("");

                  }}

                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8fa69b] transition hover:bg-white/5 hover:text-white"

                >

                  <Search size={17} />

                  Search chats

                </button>

                <AnimatePresence>

                  {searchOpen && (

                    <motion.div

                      initial={{ opacity: 0, height: 0 }}

                      animate={{ opacity: 1, height: "auto" }}

                      exit={{ opacity: 0, height: 0 }}

                      className="overflow-hidden"

                    >

                      <div className="relative mt-2">

                        <input

                          autoFocus

                          value={search}

                          onChange={(event) =>

                            setSearch(event.target.value)

                          }

                          placeholder="Find conversations..."

                          className="w-full rounded-lg border border-[#a1efc725] bg-[#060d0b] py-3 pl-3 pr-9 text-xs text-white outline-none focus:border-[#a1efc780]"

                        />

                        {search && (

                          <button

                            onClick={() => setSearch("")}

                            aria-label="Clear search"

                            className="absolute right-3 top-3 text-[#8fa69b]"

                          >

                            <X size={15} />

                          </button>

                        )}

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>


              {/* Navigation */}

              <div className="space-y-1 px-4 pb-4 pt-3">

                {navigation.map((item) => {

                  const Icon = item.icon;

                  const active = activePanel === item.name;

                  return (

                    <button

                      key={item.name}

                      onClick={() => {

                        onPanelChange(item.name);

                        closeOnMobile();

                      }}

                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${

                        active

                          ? "bg-[#a1efc710] text-[#a1efc7]"

                          : "text-[#8fa69b] hover:bg-white/5 hover:text-white"

                      }`}

                    >

                      <Icon size={17} />

                      {item.name}

                    </button>

                  );

                })}

              </div>


              <div className="mx-4 border-t border-[#a1efc715]" />


              {/* Chat history */}

              <div

                className="min-h-0 flex-1 overflow-y-auto px-3 py-4"

              >

                {filteredChats.length === 0 && (

                  <div className="px-3 py-8 text-center">

                    <History

                      size={25}

                      className="mx-auto mb-3 text-[#8fa69b]/50"

                    />

                    <p className="text-xs text-[#8fa69b]">

                      {query

                        ? "No matching conversations"

                        : "Your conversations will appear here"}

                    </p>

                  </div>

                )}


                {Object.entries(groups).map(([label, items]) => {

                  if (!items.length) return null;

                  return (

                    <section key={label} className="mb-5">

                      <div className="mb-2 flex items-center gap-2 px-3">

                        {label === "Pinned" && (

                          <Pin size={11} className="text-[#a1efc7]" />

                        )}

                        <h3 className="text-[10px] font-medium uppercase tracking-widest text-[#8fa69b]">

                          {label}

                        </h3>

                      </div>


                      <div className="space-y-1">

                        {items.map((chat) => (

                          <div

                            key={chat.id}

                            data-chat-menu

                            className="relative"

                          >

                            {renameId === chat.id ? (

                              <form

                                onSubmit={(event) => {

                                  event.preventDefault();

                                  handleRename();

                                }}

                                className="flex items-center gap-1 rounded-lg border border-[#a1efc740] bg-[#060d0b] p-2"

                              >

                                <input

                                  autoFocus

                                  maxLength={80}

                                  value={renameValue}

                                  onChange={(event) =>

                                    setRenameValue(event.target.value)

                                  }

                                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none"

                                />

                                <button

                                  type="submit"

                                  aria-label="Save name"

                                  className="text-[#a1efc7]"

                                >

                                  <Check size={15} />

                                </button>

                                <button

                                  type="button"

                                  aria-label="Cancel rename"

                                  onClick={() => setRenameId(null)}

                                  className="text-[#8fa69b]"

                                >

                                  <X size={15} />

                                </button>

                              </form>

                            ) : (

                              <div

                                className={`group flex items-center rounded-lg transition ${

                                  activeId === chat.id &&

                                  activePanel === "AI Chat"

                                    ? "bg-[#a1efc712] text-[#a1efc7]"

                                    : "text-[#b0c0b8] hover:bg-white/5"

                                }`}

                              >

                                <button

                                  onClick={() => handleSelect(chat.id)}

                                  title={chat.title}

                                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-xs"

                                >

                                  {chat.pinned ? (

                                    <Pin size={13} className="shrink-0" />

                                  ) : (

                                    <MessageSquare size={13} className="shrink-0" />

                                  )}

                                  <span className="truncate">

                                    {chat.title}

                                  </span>

                                </button>


                                <button

                                  aria-label="Conversation options"

                                  aria-expanded={menuId === chat.id}

                                  onClick={() =>

                                    setMenuId(

                                      menuId === chat.id ? null : chat.id

                                    )

                                  }

                                  className="mr-1 rounded-md p-2 text-[#8fa69b] hover:bg-white/10 hover:text-white"

                                >

                                  <MoreHorizontal size={15} />

                                </button>

                              </div>

                            )}


                            {/* Conversation menu */}

                            <AnimatePresence>

                              {menuId === chat.id && (

                                <motion.div

                                  initial={{ opacity: 0, height: 0 }}

                                  animate={{ opacity: 1, height: "auto" }}

                                  exit={{ opacity: 0, height: 0 }}

                                  className="mt-1 overflow-hidden rounded-xl border border-[#a1efc725] bg-[#14251e] p-1.5"

                                >

                                  <button

                                    onClick={() => {

                                      onTogglePin(chat.id);

                                      setMenuId(null);

                                    }}

                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs hover:bg-white/5"

                                  >

                                    {chat.pinned

                                      ? <PinOff size={14} />

                                      : <Pin size={14} />}

                                    {chat.pinned ? "Unpin chat" : "Pin chat"}

                                  </button>


                                  <button

                                    onClick={() => {

                                      setRenameId(chat.id);

                                      setRenameValue(chat.title);

                                      setMenuId(null);

                                    }}

                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs hover:bg-white/5"

                                  >

                                    <Pencil size={14} />

                                    Rename chat

                                  </button>


                                  <button

                                    onClick={() => {

                                      exportChat(chat, "markdown");

                                      setMenuId(null);

                                    }}

                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs hover:bg-white/5"

                                  >

                                    <Download size={14} />

                                    Export Markdown

                                  </button>


                                  <button

                                    onClick={() => {

                                      exportChat(chat, "json");

                                      setMenuId(null);

                                    }}

                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs hover:bg-white/5"

                                  >

                                    <FileJson size={14} />

                                    Export JSON

                                  </button>


                                  <div className="my-1 border-t border-white/5" />


                                  <button

                                    onClick={() => {

                                      setDeleteId(chat.id);

                                      setMenuId(null);

                                    }}

                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10"

                                  >

                                    <Trash2 size={14} />

                                    Delete chat

                                  </button>

                                </motion.div>

                              )}

                            </AnimatePresence>

                          </div>

                        ))}

                      </div>

                    </section>

                  );

                })}

              </div>


              {/* Bottom navigation */}

              <div className="border-t border-[#a1efc715] p-4">

                <button

                  onClick={() => {

                    onPanelChange("Settings");

                    closeOnMobile();

                  }}

                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8fa69b] hover:bg-white/5 hover:text-white"

                >

                  <Settings size={17} />

                  Settings

                </button>


                <Link

                  href="/"

                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8fa69b] hover:bg-white/5 hover:text-white"

                >

                  <ArrowLeft size={17} />

                  Back to home

                </Link>


                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#a1efc715] bg-[#a1efc705] p-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a1efc720] text-sm font-semibold text-[#a1efc7]">

                    S

                  </div>

                  <div>

                    <p className="text-xs font-medium text-white">

                      Student

                    </p>

                    <p className="mt-1 text-[10px] text-[#8fa69b]">

                      USAR Workspace

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.aside>

        )}

      </AnimatePresence>


      {/* Delete confirmation modal */}

      <AnimatePresence>

        {deleteId && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"

            onClick={() => setDeleteId(null)}

          >

            <motion.div

              role="dialog"

              aria-modal="true"

              aria-labelledby="delete-title"

              initial={{ scale: 0.95, y: 10 }}

              animate={{ scale: 1, y: 0 }}

              exit={{ scale: 0.95, y: 10 }}

              onClick={(event) => event.stopPropagation()}

              className="w-full max-w-sm rounded-2xl border border-[#a1efc725] bg-[#10261f] p-6 shadow-2xl"

            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">

                <Trash2 size={22} />

              </div>

              <h2 id="delete-title" className="text-lg font-semibold">

                Delete conversation?

              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[#8fa69b]">

                This removes the conversation from this browser
                and clears any saved AI conversation memory.

              </p>

              <div className="mt-6 flex justify-end gap-3">

                <button

                  autoFocus

                  onClick={() => setDeleteId(null)}

                  className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"

                >

                  Cancel

                </button>

                <button

                  onClick={() => {

                    onDelete(deleteId);

                    setDeleteId(null);

                  }}

                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"

                >

                  Delete

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </>

  );

}

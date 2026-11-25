
"use client";

import { useEffect, useState } from "react";

export type ContextStats = {
  selected_messages: number;
  input_tokens?: number | null;
  output_tokens?: number | null;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  contextStats?: ContextStats;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  document?: { id: string; name: string };
  backendMemory?: boolean;
};

const STORAGE_KEY = "campusgpt-chats-v1";

export default function useChatHistory() {

  const [chats, setChats] = useState<Chat[]>([]);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [ready, setReady] = useState(false);

  // Load existing conversations

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(parsed)) {
          const restored = parsed
            .filter((chat) =>
              chat &&
              typeof chat.id === "string" &&
              typeof chat.title === "string" &&
              Array.isArray(chat.messages) &&
              Number.isFinite(chat.createdAt) &&
              Number.isFinite(chat.updatedAt)
            )
            .map((chat) => ({
              ...chat,
              pinned: chat.pinned === true,
            }));
          setChats(restored);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Save conversations

  useEffect(() => {

    if (!ready) return;

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
      );

    } catch (error) {

      console.error("Failed to save chat history", error);

    }

  }, [chats, ready]);

  const activeChat =
    chats.find((chat) => chat.id === activeId) ?? null;

  // Create conversation

  function createChat(firstMessage: string) {

    const id = crypto.randomUUID();

    const now = Date.now();

    const chat: Chat = {

      id,

      title:
        firstMessage.trim().slice(0, 45) ||
        "New conversation",

      messages: [],

      createdAt: now,

      updatedAt: now,

      pinned: false,

    };

    setChats((previous) => [chat, ...previous]);

    setActiveId(id);

    return id;

  }

  // Add message

  function addMessage(id: string, message: Message) {

    setChats((previous) =>

      previous.map((chat) =>

        chat.id === id

          ? {
              ...chat,
              messages: [...chat.messages, message],
              updatedAt: Date.now(),
            }

          : chat

      )

    );

  }

  function setDocument(id: string, document: Chat["document"]) {
    setChats((previous) =>
      previous.map((chat) => chat.id === id ? { ...chat, document } : chat)
    );
  }

  function markBackendMemory(id: string) {
    setChats((previous) =>
      previous.map((chat) => chat.id === id ? { ...chat, backendMemory: true } : chat)
    );
  }

  // Start new chat

  function newChat() {

    setActiveId(null);

  }

  // Select conversation

  function selectChat(id: string) {

    setActiveId(id);

  }

  // Delete conversation

  function deleteChat(id: string) {

    setChats((previous) =>

      previous.filter((chat) => chat.id !== id)

    );

    setActiveId((previous) =>

      previous === id ? null : previous

    );

  }

  // Rename conversation

  function renameChat(id: string, title: string) {

    const name = title.trim().slice(0, 80);

    if (!name) return;

    setChats((previous) =>

      previous.map((chat) =>

        chat.id === id

          ? { ...chat, title: name }

          : chat

      )

    );

  }

  // Pin or unpin conversation

  function togglePin(id: string) {

    setChats((previous) =>

      previous.map((chat) =>

        chat.id === id

          ? { ...chat, pinned: !chat.pinned }

          : chat

      )

    );

  }

  return {

    chats,

    activeChat,

    activeId,

    ready,

    createChat,

    addMessage,
    setDocument,
    markBackendMemory,

    newChat,

    selectChat,

    deleteChat,

    renameChat,

    togglePin,

  };

}

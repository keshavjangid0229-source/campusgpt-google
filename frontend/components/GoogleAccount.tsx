"use client";

import { useEffect, useState } from "react";

export default function GoogleAccount() {
  const [account, setAccount] = useState<{ enabled: boolean; user: { name: string } | null } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAccount() {
      try {
        const response = await fetch("/api/campus/auth/session", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        setAccount(await response.json());
        setFailed(new URLSearchParams(window.location.search).get("auth") === "failed");
      } catch {
        // Chat stays available while the sign-in service is unavailable.
      }
    }
    void loadAccount();
    return () => controller.abort();
  }, []);

  if (!account?.enabled) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-[#a1efc7]">
      {failed && <span role="alert">Google sign-in failed.</span>}
      {account.user ? (
        <form action="/api/campus/auth/logout" method="post" className="flex min-w-0 items-center gap-2">
          <span className="hidden max-w-28 truncate sm:block">{account.user.name}</span>
          <button className="whitespace-nowrap rounded-lg border border-[#a1efc725] px-2 py-1">Sign out</button>
        </form>
      ) : (
        <a href="/api/campus/auth/google" className="whitespace-nowrap rounded-lg border border-[#a1efc725] px-2 py-1">
          Continue with Google
        </a>
      )}
    </div>
  );
}

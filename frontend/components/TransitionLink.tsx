"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";

import { usePageTransition } from "./TransitionProvider";

type TransitionLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function TransitionLink({
  href,
  children,
  className,
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>
  ) {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    navigate(href);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}
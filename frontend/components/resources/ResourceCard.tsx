
"use client";

import { motion } from "motion/react";

import {
  BookOpen,
  FileText,
  NotebookPen,
  FlaskConical,
  Bookmark,
  Download,
  ArrowUpRight,
  GraduationCap,
  Clock,
} from "lucide-react";

import type { Resource } from "../../data/resources";

type Props = {
  resource: Resource;
  bookmarked: boolean;
  onBookmark: (id: string) => void;
  onOpen: (resource: Resource) => void;
};

const icons = {
  Syllabus: BookOpen,
  PYQs: FileText,
  Notes: NotebookPen,
  Practicals: FlaskConical,
};

export default function ResourceCard({
  resource,
  bookmarked,
  onBookmark,
  onOpen,
}: Props) {
  const Icon = icons[resource.type];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#a1efc718] bg-[#10261f]/50 p-5 transition-colors hover:border-[#a1efc750]"
    >
      {/* Ambient glow */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#a1efc7]/5 blur-3xl transition group-hover:bg-[#a1efc7]/10" />

      {/* Card header */}

      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#a1efc725] bg-[#a1efc710] text-[#a1efc7]">
          <Icon size={24} strokeWidth={1.6} />
        </div>

        <button
          onClick={() => onBookmark(resource.id)}
          aria-label={
            bookmarked
              ? "Remove bookmark"
              : "Bookmark resource"
          }
          aria-pressed={bookmarked}
          className={`rounded-lg p-2 transition ${
            bookmarked
              ? "bg-[#a1efc715] text-[#a1efc7]"
              : "text-[#8fa69b] hover:bg-white/5 hover:text-white"
          }`}
        >
          <Bookmark
            size={18}
            fill={bookmarked ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Category */}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-[#a1efc720] bg-[#a1efc708] px-2 py-1 text-[10px] font-medium text-[#a1efc7]">
          {resource.type}
        </span>

        <span className="flex items-center gap-1 text-[10px] text-[#8fa69b]">
          <GraduationCap size={13} />
          Semester {resource.semester}
        </span>
      </div>

      {/* Resource information */}

      <h3 className="mt-3 text-base font-semibold leading-relaxed text-[#f1f5f2]">
        {resource.title}
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-[#8fa69b]">
        {resource.description}
      </p>

      <div className="flex-1" />

      <div className="mt-5 flex items-center gap-2 text-[10px] text-[#8fa69b]">
        {resource.available ? (
          <>
            <FileText size={13} />
            PDF Document
          </>
        ) : (
          <>
            <Clock size={13} />
            Document pending
          </>
        )}
      </div>

      {/* Actions */}

      <div className="mt-4 flex items-center gap-2 border-t border-[#a1efc715] pt-4">
        <button
          disabled={!resource.available}
          onClick={() => onOpen(resource)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#a1efc710] px-3 py-2.5 text-xs font-medium text-[#a1efc7] transition hover:bg-[#a1efc720] disabled:cursor-not-allowed disabled:opacity-40"
        >
          View PDF
          <ArrowUpRight size={14} />
        </button>

        {resource.available ? (
          <a
            href={resource.fileUrl}
            download
            aria-label={`Download ${resource.title}`}
            className="rounded-lg border border-[#a1efc720] p-2.5 text-[#a1efc7] transition hover:bg-[#a1efc710]"
          >
            <Download size={17} />
          </a>
        ) : (
          <button
            disabled
            aria-label="Download unavailable"
            className="cursor-not-allowed rounded-lg border border-[#a1efc720] p-2.5 text-[#8fa69b] opacity-40"
          >
            <Download size={17} />
          </button>
        )}
      </div>
    </motion.article>
  );
}


"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import {
  LibraryBig,
  Search,
  Files,
  GraduationCap,
  Bookmark,
  BookOpen,
  Clock,
  SearchX,
  ChevronDown,
  X,
} from "lucide-react";

import {
  resources,
  resourceTypes,
} from "../../data/resources";

import type { Resource } from "../../data/resources";

import ResourceCard from "./ResourceCard";

import PDFViewer from "./PDFViewer";

type Props = {
  onAsk: (resource: Resource) => void;
};

const BOOKMARK_KEY = "campusgpt-resource-bookmarks";

const RECENT_KEY = "campusgpt-recent-resources";

export default function StudyResources({
  onAsk,
}: Props) {
  const [search, setSearch] = useState("");

  const [semester, setSemester] = useState("all");

  const [category, setCategory] =
    useState("All resources");

  const [tab, setTab] = useState("all");

  const [bookmarks, setBookmarks] =
    useState<string[]>([]);

  const [recent, setRecent] =
    useState<string[]>([]);

  const [ready, setReady] = useState(false);

  const [selected, setSelected] =
    useState<Resource | null>(null);

  const [notice, setNotice] = useState("");

  // Load saved resource preferences

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedBookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]");
        const savedRecent = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        if (Array.isArray(savedBookmarks)) {
          setBookmarks(savedBookmarks.filter((item) => typeof item === "string"));
        }
        if (Array.isArray(savedRecent)) {
          setRecent(savedRecent.filter((item) => typeof item === "string"));
        }
      } catch (error) {
        console.error("Unable to load resource preferences", error);
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Persist bookmarks and recent documents

  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(
        BOOKMARK_KEY,
        JSON.stringify(bookmarks)
      );

      localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(recent)
      );
    } catch (error) {
      console.error(
        "Unable to save resource preferences",
        error
      );
    }
  }, [bookmarks, recent, ready]);

  function toggleBookmark(id: string) {
    setBookmarks((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  async function openResource(resource: Resource) {
    if (!resource.available) return;

    setNotice("");

    try {
      const response = await fetch(
        resource.fileUrl,
        { method: "HEAD" }
      );

      if (
        !response.ok ||
        !response.headers
          .get("content-type")
          ?.includes("application/pdf")
      ) {
        throw new Error("PDF unavailable");
      }

      setSelected(resource);

      setRecent((previous) => [
        resource.id,
        ...previous.filter(
          (id) => id !== resource.id
        ),
      ].slice(0, 20));
    } catch {
      setNotice(
        "This PDF could not be opened. Please check that the document exists in the resources folder."
      );
    }
  }

  function askAboutResource(resource: Resource) {
    setSelected(null);

    onAsk(resource);
  }

  function resetFilters() {
    setSearch("");
    setSemester("all");
    setCategory("All resources");
    setTab("all");
  }

  const query = search.trim().toLowerCase();

  const filteredResources = resources.filter(
    (resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(query) ||
        resource.subject.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query);

      const matchesSemester =
        semester === "all" ||
        resource.semester === Number(semester);

      const matchesCategory =
        category === "All resources" ||
        resource.type === category;

      const matchesTab =
        tab === "all" ||
        (tab === "saved" &&
          bookmarks.includes(resource.id)) ||
        (tab === "recent" &&
          recent.includes(resource.id));

      return (
        matchesSearch &&
        matchesSemester &&
        matchesCategory &&
        matchesTab
      );
    }
  );

  if (tab === "recent") {
    filteredResources.sort(
      (a, b) =>
        recent.indexOf(a.id) - recent.indexOf(b.id)
    );
  }

  const availableCount = resources.filter(
    (resource) => resource.available
  ).length;

  const subjectCount = new Set(
    resources.map((resource) => resource.subject)
  ).size;

  const stats = [
    {
      title: "Available PDFs",
      value: availableCount,
      icon: Files,
    },
    {
      title: "Subjects",
      value: subjectCount,
      icon: GraduationCap,
    },
    {
      title: "Bookmarked",
      value: bookmarks.filter((id) =>
        resources.some((resource) => resource.id === id)
      ).length,
      icon: Bookmark,
    },
  ];

  const tabs = [
    {
      id: "all",
      title: "All resources",
      icon: LibraryBig,
    },
    {
      id: "saved",
      title: "Bookmarked",
      icon: Bookmark,
    },
    {
      id: "recent",
      title: "Recently viewed",
      icon: Clock,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mx-auto w-full max-w-[1400px] px-4 py-8 md:px-10 md:py-10"
    >
      {/* Workspace heading */}

      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#a1efc7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a1efc7]" />
          USAR Academic Workspace
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#a1efc725] bg-[#a1efc710] text-[#a1efc7] md:h-16 md:w-16">
            <LibraryBig size={30} strokeWidth={1.5} />
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#f1f5f2] md:text-4xl">
              Study Resources
            </h1>

            <p className="mt-2 text-xs text-[#8fa69b] md:text-sm">
              Your academic knowledge, organized.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}

      <div className="mb-8 grid grid-cols-3 gap-2 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl border border-[#a1efc715] bg-[#10261f]/50 p-3 md:rounded-2xl md:p-5"
            >
              <Icon
                size={21}
                className="mb-4 text-[#a1efc7]"
              />

              <p className="text-2xl font-semibold text-white md:text-3xl">
                {stat.value}
              </p>

              <p className="mt-1 text-[10px] text-[#8fa69b] md:text-xs">
                {stat.title}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Workspace tabs */}

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#a1efc715]">
        {tabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-xs transition md:px-4 md:text-sm ${
                tab === item.id
                  ? "text-[#a1efc7]"
                  : "text-[#8fa69b] hover:text-white"
              }`}
            >
              <Icon size={16} />

              {item.title}

              {tab === item.id && (
                <motion.div
                  layoutId="resource-tab"
                  className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#a1efc7]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Search and semester filter */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-[#8fa69b]"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search subjects, syllabus, PYQs..."
            className="w-full rounded-xl border border-[#a1efc720] bg-[#10261f]/50 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-[#8fa69b]/60 focus:border-[#a1efc770]"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 top-3.5 text-[#8fa69b]"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="relative">
          <GraduationCap
            size={17}
            className="pointer-events-none absolute left-3 top-3.5 text-[#a1efc7]"
          />

          <select
            aria-label="Filter by semester"
            value={semester}
            onChange={(event) =>
              setSemester(event.target.value)
            }
            className="w-full appearance-none rounded-xl border border-[#a1efc720] bg-[#10261f] py-3 pl-10 pr-10 text-sm text-white outline-none focus:border-[#a1efc770] sm:w-48"
          >
            <option value="all">
              All semesters
            </option>

            {Array.from(
              { length: 8 },
              (_, index) => index + 1
            ).map((number) => (
              <option key={number} value={number}>
                Semester {number}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-3.5 text-[#8fa69b]"
          />
        </div>
      </div>

      {/* Category filters */}

      <div className="mb-7 flex flex-wrap gap-2">
        {resourceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setCategory(type)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              category === type
                ? "border-[#a1efc7] bg-[#a1efc7] text-[#060d0b]"
                : "border-[#a1efc720] bg-[#10261f]/40 text-[#8fa69b] hover:border-[#a1efc750] hover:text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Resource status */}

      {notice && (
        <div
          role="alert"
          className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200"
        >
          {notice}

          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {availableCount === 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#a1efc720] bg-[#a1efc705] p-4">
          <BookOpen
            size={19}
            className="shrink-0 text-[#a1efc7]"
          />

          <div>
            <p className="text-sm font-medium text-[#a1efc7]">
              Academic library setup
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#8fa69b]">
              This is a sample resource catalog.
              Verified college documents will become
              available after they are added.
            </p>
          </div>
        </div>
      )}

      {/* Results header */}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[#8fa69b]">
          {filteredResources.length} resources found
        </p>

        {(search ||
          semester !== "all" ||
          category !== "All resources" ||
          tab !== "all") && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#a1efc7] hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Resource grid */}

      <AnimatePresence mode="wait">
        {filteredResources.length > 0 ? (
          <motion.div
            key="resources-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                bookmarked={bookmarks.includes(
                  resource.id
                )}
                onBookmark={toggleBookmark}
                onOpen={openResource}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#a1efc725] py-20 text-center"
          >
            <SearchX
              size={40}
              strokeWidth={1.3}
              className="mb-5 text-[#8fa69b]"
            />

            <h3 className="text-lg font-medium text-white">
              No resources found
            </h3>

            <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#8fa69b]">
              Try changing your search or filters,
              or bookmark a resource to find it here.
            </p>

            <button
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-[#a1efc710] px-4 py-2 text-xs text-[#a1efc7]"
            >
              Browse all resources
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 border-t border-[#a1efc715] pt-5 text-center text-[10px] text-[#8fa69b]">
        CampusGPT · Independent Student Project
      </div>

      {/* PDF modal */}

      {selected && (
        <PDFViewer
          resource={selected}
          onClose={() => setSelected(null)}
          onAsk={askAboutResource}
        />
      )}
    </motion.div>
  );
}

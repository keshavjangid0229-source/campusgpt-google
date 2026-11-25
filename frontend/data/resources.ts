
export type ResourceType =
  | "Syllabus"
  | "PYQs"
  | "Notes"
  | "Practicals";

export type Resource = {
  id: string;
  title: string;
  subject: string;
  semester: number;
  type: ResourceType;
  description: string;
  fileUrl: string;
  updatedAt: string;
  available: boolean;
};

export const resources: Resource[] = [
  {
    id: "math-syllabus-1",
    title: "Engineering Mathematics Syllabus",
    subject: "Engineering Mathematics",
    semester: 1,
    type: "Syllabus",
    description:
      "Semester syllabus and academic unit overview.",
    fileUrl:
      "/resources/semester-1/mathematics-syllabus.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "math-pyq-1",
    title: "Engineering Mathematics PYQs",
    subject: "Engineering Mathematics",
    semester: 1,
    type: "PYQs",
    description:
      "Previous year examination question papers.",
    fileUrl:
      "/resources/semester-1/mathematics-pyq.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "math-notes-1",
    title: "Engineering Mathematics Notes",
    subject: "Engineering Mathematics",
    semester: 1,
    type: "Notes",
    description:
      "Topic-wise notes and revision material.",
    fileUrl:
      "/resources/semester-1/mathematics-notes.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "electronics-notes-1",
    title: "Analog Electronics Notes",
    subject: "Analog Electronics",
    semester: 1,
    type: "Notes",
    description:
      "Electronics concepts and revision resources.",
    fileUrl:
      "/resources/semester-1/electronics-notes.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "mechanics-pyq-1",
    title: "Engineering Mechanics PYQs",
    subject: "Engineering Mechanics",
    semester: 1,
    type: "PYQs",
    description:
      "Engineering mechanics examination resources.",
    fileUrl:
      "/resources/semester-1/mechanics-pyq.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "c-practical-1",
    title: "C Programming Practical File",
    subject: "Programming in C",
    semester: 1,
    type: "Practicals",
    description:
      "Programming exercises and laboratory resources.",
    fileUrl:
      "/resources/semester-1/c-practical.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "math-syllabus-2",
    title: "Engineering Mathematics II Syllabus",
    subject: "Engineering Mathematics II",
    semester: 2,
    type: "Syllabus",
    description:
      "Second semester mathematics resources.",
    fileUrl:
      "/resources/semester-2/mathematics-syllabus.pdf",
    updatedAt: "",
    available: false,
  },
  {
    id: "physics-notes-2",
    title: "Engineering Physics Notes",
    subject: "Engineering Physics",
    semester: 2,
    type: "Notes",
    description:
      "Physics study and revision resources.",
    fileUrl:
      "/resources/semester-2/physics-notes.pdf",
    updatedAt: "",
    available: false,
  },
];

export const resourceTypes = [
  "All resources",
  "Syllabus",
  "PYQs",
  "Notes",
  "Practicals",
] as const;

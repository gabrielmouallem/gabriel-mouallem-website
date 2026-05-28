export interface Experience {
  company: string;
  shortLabel: string;
  role: string;
  dates: string;
  location?: string;
  bullets: string[];
}

export const experiences: Experience[] = [
  {
    company: "Irricontrol",
    shortLabel: "Irricontrol",
    role: "Full Stack / Mobile Developer",
    dates: "Jul 2019 — Nov 2021",
    location: "Itajubá, BR",
    bullets: [
      "~1000% page-load improvement via API pagination, Django cache, Celery, and schema refactor",
      "MQTT real-time control + OTA radio protocols for Central Pivot irrigation IoT",
      "Led Ionic 3→4 (Angular→React) mobile migration; alarm system saving clients est. millions BRL",
    ],
  },
  {
    company: "NTT DATA",
    shortLabel: "NTT DATA",
    role: "Software Developer",
    dates: "Nov 2021 — Jan 2022",
    location: "Serasa Experian",
    bullets: [
      "Reusable report-generation system (React, TypeScript, Node/Express + NestJS, JSReport)",
    ],
  },
  {
    company: "Accenture",
    shortLabel: "Accenture",
    role: "Sr. Application Development Analyst",
    dates: "Jan 2022 — Sep 2022",
    location: "Unilever CRM",
    bullets: [
      "Co-led (1 of 2) legacy Ionic/Angular → React Native migration across 30+ countries",
      "Offline-first sync via Salesforce React Native SDK; mentored team, presented to hundreds",
    ],
  },
  {
    company: "BEES (AB InBev)",
    shortLabel: "BEES",
    role: "Software Developer",
    dates: "Sep 2022 — Aug 2023",
    location: "Campinas, BR",
    bullets: [
      "Drove BDD testing initiative: +40% coverage in 3 months → company-wide 90% deploy standard",
      "Built granular country/role-based permission system UI",
    ],
  },
  {
    company: "Turing — AI.FISH",
    shortLabel: "AI.FISH",
    role: "Software Developer (remote, USD)",
    dates: "Aug 2022 — Jun 2024",
    location: "Honolulu",
    bullets: [
      "Sole frontend dev; architected 3 AI video-analysis platforms",
      "Real-time AI bounding boxes synced to video; 80% test coverage in a complex mocking env",
    ],
  },
  {
    company: "Latitude.sh",
    shortLabel: "Latitude.sh",
    role: "Product & Software Engineer (Kubernetes)",
    dates: "Jun 2024 — Apr 2026",
    bullets: [
      "Primary dev/product driver for Managed PostgreSQL DBaaS on bare-metal K8s (CloudNativePG)",
      "S3 backups, connection pooling, IP whitelisting, audit logging; SOC 2 data-at-rest",
      "Full observability (Prometheus / Grafana / Loki / Alloy); MVP → 300+ waitlist signups",
    ],
  },
  {
    company: "Stealth",
    shortLabel: "Stealth",
    role: "Product & Software Engineer",
    dates: "Apr 2026 — Present",
    location: "San Francisco Bay Area",
    bullets: ["Coming soon…"],
  },
];

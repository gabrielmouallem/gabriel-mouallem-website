export interface Experience {
  /** URL-safe slug used for #hash deep-linking */
  slug: string;
  company: string;
  shortLabel: string;
  role: string;
  dates: string;
  location?: string;
  bullets: string[];
  /** Optional handwritten-style annotation shown to the right of
   * the description on desktop (ttiago.com style). */
  annotation?: string;
}

export const experiences: Experience[] = [
  {
    slug: "irricontrol",
    company: "Irricontrol",
    shortLabel: "Irricontrol",
    role: "Mobile Intern → Full Stack Developer",
    dates: "Jul 2019 — Nov 2021",
    location: "Itajubá, BR",
    annotation: "first taste of full-stack — learned so much it shaped everything that came after :)",
    bullets: [
      "Diagnosed and fixed a backend performance bottleneck — ~1000% page-load improvement via Django Cache, Celery background tasks, API pagination, and a schema refactor migrating models to abstract inheritance",
      "Implemented MQTT pub/sub for real-time Central Pivot irrigation IoT, plus low-level radio OTA protocols (encrypted message structures mapped to device memory) — primary liaison between hardware (embedded C#) and software (Python/React) teams",
      "Led the Ionic 3 → Ionic 4 migration (Angular/Cordova → React/Capacitor), establishing React as the company's frontend foundation",
      "Designed a mobile alarm system for irrigation equipment failures — prevented water/resource waste with estimated client savings in the millions BRL",
      "Generated on-demand operational reports via Pandas/NumPy for internal BI; informal tech lead for a team of 3 (onboarding, architecture, mentoring)",
    ],
  },
  {
    slug: "ntt-data",
    company: "NTT DATA",
    shortLabel: "NTT DATA",
    role: "Software Developer",
    dates: "Nov 2021 — Jan 2022",
    location: "Serasa Experian project",
    bullets: [
      "Built a reusable report-generation system in React + TypeScript with a Node.js (Express + NestJS) backend and JSReport templating",
      "Short engagement focused on reusability and clean architecture; stack also included Bitbucket, Jira, and Docker",
    ],
  },
  {
    slug: "accenture",
    company: "Accenture",
    shortLabel: "Accenture",
    role: "Sr. Application Development Analyst",
    dates: "Jan 2022 — Sep 2022",
    location: "Unilever CRM · São Paulo, BR",
    annotation: "big team, big stage — mentored devs and gave talks to hundreds",
    bullets: [
      "Co-led (1 of 2) the legacy Ionic 3/Angular → React Native migration of a CRM application used across 30+ countries, modernizing the Unilever mobile stack",
      "Engineered offline-first capabilities and offline-to-online sync via the Salesforce React Native SDK — reliable performance in varied connectivity",
      "Senior tech lead role: drove React Native architecture, state-management patterns (Redux Saga / Toolkit / Context), performance optimization, and coding standards",
      "Mentored devs through pair programming; presented React Native + performance talks to hundreds at Accenture Brazil",
      "Saved significant dev time by forking and tailoring a complex calendar UI component for custom drag-and-drop scheduling",
    ],
  },
  {
    slug: "bees",
    company: "BEES (AB InBev)",
    shortLabel: "BEES",
    role: "Software Developer",
    dates: "Sep 2022 — Aug 2023",
    location: "Campinas, BR",
    bullets: [
      "Inside the BEES/AB InBev enterprise platform managing multi-national product promotions and country-specific ERP integrations",
      "Spearheaded a BDD frontend testing initiative (Jest, React Testing Library) focused on UI behavior — +40 % coverage in 3 months, later supporting a company-wide 90 % coverage requirement for deploys",
      "Designed the UI for a new permission system with granular country/role access control, collaborating with backend on the data model",
      "Lectured Redux internally to align state-management practices; stack: React, TS, Redux Toolkit, Redux Saga, React Query, Storybook",
    ],
  },
  {
    slug: "ai-fish",
    company: "Turing — AI.FISH",
    shortLabel: "AI.FISH",
    role: "Software Developer (remote, USD)",
    dates: "Aug 2022 — Jun 2024",
    location: "Honolulu, HI",
    bullets: [
      "Sole frontend dev for AI.FISH (US client), architecting and delivering 3 complex AI-powered video-analysis platforms",
      "Engineered real-time AI bounding boxes accurately synchronized to playing video; solved smooth-playback / responsive-seeking challenges via custom data fetching and caching strategies over long videos with heavy AI metadata",
      "Designed a maintainable React + TypeScript architecture with feature-module organization and co-located component files (types, constants, tests) for encapsulation and DX",
      "Achieved 80 % unit test coverage in a complex mocking environment (Jest, React Testing Library, Mock Service Worker)",
    ],
  },
  {
    slug: "latitude-sh",
    company: "Latitude.sh",
    shortLabel: "Latitude.sh",
    role: "Product & Software Engineer (Kubernetes)",
    dates: "Jun 2024 — Apr 2026",
    annotation: "a whole new world — bare metal, networking, data centers, kubernetes, cloud native",
    bullets: [
      "Primary dev and product driver for the Managed PostgreSQL DBaaS on bare-metal Kubernetes (CloudNativePG operator, Rancher API)",
      "Shipped automated S3 backups, connection pooling, IP whitelisting, audit logging, and customer-facing management tools",
      "Implemented SOC 2 controls for data-at-rest and full observability — Prometheus (metrics), Grafana (dashboards), Loki (logs), Alloy (tracing/alerts) — plus multi-region replication for HA/DR",
      "Earlier as Frontend Engineer: shipped customer dashboard features and platform flows; integrated Mintlify docs, ContentLayer website, and Bugsnag / Segment / Posthog / Customer.io observability across 3 frontend apps",
      "Drove product iteration from MVP launch (300+ waitlist signups) through internal dogfooding and customer-informed refinement",
    ],
  },
  {
    slug: "stealth",
    company: "Stealth",
    shortLabel: "Stealth",
    role: "Product & Software Engineer",
    dates: "Apr 2026 — Present",
    location: "San Francisco Bay Area",
    bullets: ["Coming soon…"],
  },
];

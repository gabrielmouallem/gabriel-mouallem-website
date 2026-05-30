/**
 * Single source of truth for personal identity + contact copy.
 * Reuse these everywhere instead of hardcoding name/email/links so there's
 * one place to update.
 */
export const SITE = {
  name: "Gabriel Mouallem",
  firstName: "Gabriel",
  lastName: "Mouallem",
  /** Monogram initials, e.g. logo mark "GM". */
  initials: "GM",
  title: "Product & Software Engineer",
  description:
    "Gabriel Mouallem — Product & Software Engineer. Full-stack, Kubernetes, cloud native.",
  email: "gabriel.unifei2017@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/gabriel-mouallem/",
    github: "https://github.com/gabrielmouallem",
    resume: "/Gabriel_Mouallem_Product_Engineer_Resume.pdf",
  },
  /** Suggested filename for the résumé download attribute. */
  resumeFileName: "Gabriel_Mouallem_Product_Engineer_Resume.pdf",
  /** Standardized download CTA copy — reused by the nav button and the
   * About modal so the wording stays in sync everywhere. */
  resumeLabel: "Download CV",
} as const;

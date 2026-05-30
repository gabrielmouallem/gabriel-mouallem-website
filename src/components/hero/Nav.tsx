import { useState } from "react";
import type { MouseEventHandler, ReactNode } from "react";
import { SITE } from "../../data/site";
import { withBase } from "../../lib/base";
import { CopyIcon } from "./icons";

const EMAIL_ADDRESS = SITE.email;

interface NavItemProps {
  idx: string;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  ariaLabel?: string;
  /** Override the default `↗` icon (e.g. a copy icon for the email link). */
  icon?: ReactNode;
  iconClass?: string;
}

/**
 * Unified nav item — same `01 / LABEL ↗` shape whether it's a real <a>
 * (LinkedIn / GitHub / Email / etc.) or a <button> that opens a modal
 * (About). The clipping mask + idx serial + arrow are always identical
 * so every item reads the same.
 */
function NavItem({
  idx,
  label,
  href,
  external,
  onClick,
  ariaLabel,
  icon,
  iconClass,
}: NavItemProps) {
  const inner = (
    <>
      <span className="nav-idx" aria-hidden="true">
        {idx} /
      </span>
      <span className="nav-label" data-text={label}>
        {label}
      </span>
      <span className={`nav-arrow ${iconClass ?? ""}`.trim()} aria-hidden="true">
        {icon ?? "↗"}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        className="nav-link"
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="nav-link nav-link--button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  );
}

export function Nav({ onAbout }: { onAbout: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleEmailClick: MouseEventHandler<HTMLElement> = (e) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      e.preventDefault();
      navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <nav className="topnav" aria-label="Primary">
      <NavItem
        idx="01"
        label="About"
        onClick={onAbout}
        icon="+"
        iconClass="nav-arrow--plus"
      />
      <NavItem
        idx="02"
        label="LinkedIn"
        href={SITE.links.linkedin}
        external
      />
      <NavItem
        idx="03"
        label="GitHub"
        href={SITE.links.github}
        external
      />
      <NavItem
        idx="04"
        label={copied ? "Copied" : "Email"}
        href={`mailto:${EMAIL_ADDRESS}`}
        onClick={handleEmailClick}
        ariaLabel={
          copied
            ? "Email copied to clipboard"
            : `Copy email ${EMAIL_ADDRESS}`
        }
        icon={<CopyIcon />}
        iconClass="nav-arrow--copy"
      />
      <a
        className="nav-cta"
        href={withBase(SITE.links.resume)}
        download={SITE.resumeFileName}
      >
        <span className="nav-cta-bracket" aria-hidden="true">[</span>
        <span className="nav-cta-label">{SITE.resumeLabel}</span>
        <span className="nav-cta-arrow" aria-hidden="true">↓</span>
        <span className="nav-cta-bracket" aria-hidden="true">]</span>
      </a>
    </nav>
  );
}

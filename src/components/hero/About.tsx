import { SITE } from "../../data/site";
import { withBase } from "../../lib/base";

const EMAIL_ADDRESS = SITE.email;

export function About({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="about-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`About ${SITE.name}`}
      onClick={onClose}
    >
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="about-close"
          onClick={onClose}
          aria-label="Close about panel"
        >
          ×
        </button>

        <div className="about-grid">
          <section className="about-col">
            <h3 className="about-h">About</h3>
            <ul className="about-list">
              <li>Product/customer-oriented problem solver</li>
              <li>~7 years across IoT, AI/video, cloud infrastructure</li>
              <li>
                Currently on Stealth AI Company, hybrid from San Francisco
              </li>
              <li>Testing-first culture, BDD advocate</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Stack</h3>
            <ul className="about-list">
              <li>React / Next.js / TypeScript</li>
              <li>Python (Django, FastAPI, Flask)</li>
              <li>Node.js (Express, NestJS)</li>
              <li>Kubernetes / CloudNativePG</li>
              <li>React Native</li>
              <li>PostgreSQL / Redis / S3</li>
              <li>Jest, RTL, MSW, Storybook</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Contact</h3>
            <ul className="about-list">
              <li>
                <a
                  className="about-link"
                  href={`mailto:${EMAIL_ADDRESS}`}
                >
                  {EMAIL_ADDRESS}
                </a>
              </li>
              <li>Itajubá, Minas Gerais — Brazil</li>
              <li>Remote / SF Bay Area</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Connect</h3>
            <ul className="about-list">
              <li>
                <a
                  className="about-link"
                  href={SITE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a
                  className="about-link"
                  href={SITE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  className="about-link"
                  href={withBase(SITE.links.resume)}
                  download={SITE.resumeFileName}
                >
                  {SITE.resumeLabel} ↓
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="about-monogram" aria-hidden="true">
          <span className="about-monogram-name">GABRIEL M.</span>
          <span className="about-monogram-fill" aria-hidden="true" />
        </div>

        <div className="about-subline" aria-hidden="true">
          Software &amp; Product Engineer
        </div>

        <p className="about-copy">
          © 2026 {SITE.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

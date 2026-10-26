"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  engineeringNotebook,
  interfaceCopy,
  journey,
  profile,
  projects,
  type ProjectKey,
  type StorySection,
} from "@/content/portfolio";
import { roadmap } from "@/content/roadmap";
import { mailDraft } from "./performance";
import { sitePath } from "@/lib/sitePath";
import type { Panel } from "./types";
import { AppearancePanel, type AppearanceProps } from "./AppearancePanel";

function StoryText({ text }: { text: string }) {
  const parts = text.split("Backpacking Abi");
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Backpacking Abi
            </a>
          )}
          {part}
        </span>
      ))}
    </>
  );
}
function Sections({
  sections,
}: {
  sections: (StorySection & { link?: string; linkLabel?: string })[];
}) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.heading}>
          <h3>{section.heading}</h3>
          <p>
            <StoryText text={section.body} />
          </p>
          {section.link && (
            <a
              className="text-link"
              href={section.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.linkLabel}
            </a>
          )}
        </section>
      ))}
    </>
  );
}
function Feedback() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("An idea for the Systems Desk");
  const [status, setStatus] = useState("");
  const body = `Hi Abhinav,\r\n\r\n${message.trim()}\r\n\r\nFrom: ${name.trim() || "A Systems Desk visitor"}`;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      setStatus("Write a short note before opening your email draft.");
      return;
    }
    window.location.href = mailDraft(profile.email, topic, body);
    setStatus(
      "Your email draft is ready to open. If no mail app appears, copy the note and email it to the address below.",
    );
  }
  return (
    <section className="feedback-section">
      <h3>What would you find useful?</h3>
      <p>A bug, a missing feature, or a small idea with legs. I’m listening.</p>
      <form onSubmit={submit} className="grid gap-3">
        <label>
          About
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            <option>An idea for the Systems Desk</option>
            <option>A bug in the Systems Desk</option>
            <option>A community AI project</option>
            <option>A•WAKE feedback</option>
          </select>
        </label>
        <label>
          Your name <span className="muted">(optional)</span>
          <input
            autoComplete="name"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          Your note
          <textarea
            required
            minLength={3}
            maxLength={1200}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="I tried… It would help if…"
          />
        </label>
        <p className="muted">
          Opens your email app. Nothing is sent or stored on a server here.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="action primary-action">
            Prepare email <span aria-hidden="true">↗</span>
          </button>
          <button
            type="button"
            className="action"
            disabled={!message.trim()}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `To: ${profile.email}\nSubject: ${topic}\n\n${body}`,
                );
                setStatus("Copied. Paste it into your preferred email app.");
              } catch {
                setStatus(
                  "Clipboard access is unavailable. Select and copy your note instead.",
                );
              }
            }}
          >
            Copy note
          </button>
        </div>
        <a href={mailDraft(profile.email, topic, body)}>{profile.email}</a>
        <p role="status">{status}</p>
      </form>
    </section>
  );
}
function Roadmap() {
  return (
    <>
      <p>
        Small releases, useful on their own. These are planned projects, not
        promises of a launch date.
      </p>
      <div className="roadmap-list grid gap-3">
        {roadmap.map((item) => (
          <details
            key={item.id}
            style={{ "--item-color": item.color } as React.CSSProperties}
          >
            <summary>
              <span>
                <span className="roadmap-status">{item.status}</span>
                <strong>{item.title}</strong>
              </span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="grid gap-3">
              <p>{item.summary}</p>
              <h3>First release</h3>
              <p>{item.build}</p>
              <h3>Done when</h3>
              <p>{item.done}</p>
              <p className="muted">{item.stack}</p>
            </div>
          </details>
        ))}
      </div>
      <Feedback />
    </>
  );
}
function ProjectDetail({
  id,
  onOpen,
}: {
  id: ProjectKey;
  onOpen: (panel: Panel) => void;
}) {
  const project = projects[id];
  return (
    <>
      <p className="muted">{project.status}</p>
      <p>{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <section>
        <h3>My part</h3>
        <p>{project.contribution}</p>
      </section>
      <Sections sections={project.story} />
      {!!project.steps?.length && (
        <section>
          <h3>How the example works</h3>
          {project.demo && <p>{project.demo}</p>}
          <ol className="workflow-list">
            {project.steps.map((step, i) => (
              <li key={step}>
                <strong>{step}</strong>
                {project.demoMoments?.[i] && <p>{project.demoMoments[i]}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {!!project.notes?.length && (
        <section>
          <h3>In the notes</h3>
          <ul className="list-disc pl-5 space-y-2">
            {project.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
      {!!project.relatedProjects?.length && (
        <section>
          <h3>Look closer</h3>
          <div className="grid gap-2">
            {project.relatedProjects.map((key) => (
              <button
                className="action justify-between"
                key={key}
                onClick={() => onOpen(key)}
              >
                {projects[key].title}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {project.links?.map((link) => (
        <a
          className="text-link"
          key={link.href}
          href={sitePath(link.href)}
          target={link.href.startsWith("https:") ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          {link.label} ↗
        </a>
      ))}
      {id === "fieldnotes" && (
        <div className="flex flex-wrap gap-4">
          <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
            Backpacking Abi on Instagram
          </a>
          <a href={profile.youtube} target="_blank" rel="noopener noreferrer">
            Backpacking Abi on YouTube
          </a>
        </div>
      )}
    </>
  );
}
export function ContentPanel({
  panel,
  onClose,
  onOpen,
  atmosphere,
  setAtmosphere,
  motion,
  setMotion,
  look,
  onLook,
  onResetLook,
  onReplay,
}: {
  panel: Panel;
  onClose: () => void;
  onOpen: (panel: Panel) => void;
} & AppearanceProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element || !panel) return;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    element.scrollTop = 0;
    return () => {
      element.close();
      previous?.focus({ preventScroll: true });
    };
  }, [panel]);
  if (!panel) return null;
  let title: string;
  let content: ReactNode;
  if (panel === "story") {
    title = journey.title;
    content = (
      <>
        <p>{journey.intro}</p>
        <p>{journey.thread}</p>
        <Sections sections={journey.chapters} />
        <section>
          <h3>The route so far</h3>
          <div className="grid gap-3">
            {journey.roles.map((role) => (
              <article key={role.period}>
                <p className="muted">{role.period}</p>
                <h4>{role.title}</h4>
                <p>{role.body}</p>
              </article>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-4">
          <a href={sitePath("/travel/")}>Explore all 29 countries ↗</a>
          <a href={sitePath("/resume.pdf")} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </div>
      </>
    );
  } else if (panel === "notebook") {
    title = engineeringNotebook.title;
    content = (
      <>
        <p className="muted">{engineeringNotebook.status}</p>
        <p>{engineeringNotebook.intro}</p>
        <Sections sections={engineeringNotebook.entries} />
        <Sections sections={[engineeringNotebook.reading]} />
        <button
          className="action primary-action"
          onClick={() => onOpen("roadmap")}
        >
          See what’s next ↗
        </button>
      </>
    );
  } else if (panel === "roadmap") {
    title = "Next up";
    content = <Roadmap />;
  } else if (panel === "settings") {
    title = "Make yourself at home";
    content = (
      <AppearancePanel
        {...{
          atmosphere,
          setAtmosphere,
          motion,
          setMotion,
          look,
          onLook,
          onResetLook,
          onReplay,
        }}
      />
    );
  } else if (panel === "contact") {
    title = interfaceCopy.contactTitle;
    content = (
      <>
        <p>{interfaceCopy.contactIntro}</p>
        <div className="contact-links grid gap-3">
          <a
            className="action"
            href={mailDraft(
              profile.email,
              profile.emailSubject,
              profile.emailBody,
            )}
          >
            Email Abhinav
          </a>
          <a
            className="action"
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="action"
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="action"
            href={sitePath("/resume.pdf")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
        </div>
        <button className="text-link" onClick={() => onOpen("roadmap")}>
          Leave an idea for the next release ↗
        </button>
      </>
    );
  } else {
    title = projects[panel].title;
    content = <ProjectDetail id={panel} onOpen={onOpen} />;
  }
  return (
    <dialog
      ref={dialog}
      className="content-panel"
      aria-labelledby="panel-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="panel-heading">
        <h2 id="panel-title">{title}</h2>
        <button
          className="icon-action"
          aria-label="Close panel"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="panel-body">{content}</div>
    </dialog>
  );
}

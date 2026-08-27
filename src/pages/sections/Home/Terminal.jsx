import { useEffect, useRef, useState } from "react";

import { useLanguage } from "../../../i18n/LanguageContext.jsx";

import "./style/Terminal.scss";

const TYPE_SPEED_MS = 26;
const LINE_PAUSE_MS = 320;

/* Exchange timings — erasing is deliberately faster than typing, the way a
   held backspace outruns typing. */
const Q_TYPE_MS = 16;
const A_TYPE_MS = 18;
const ERASE_MS = 6;
const BEFORE_THINK_MS = 260;
const THINK_MS = 780;

const PROMPT_IDS = ["build", "stack", "focus"];
const ANSWERS_PER_PROMPT = 5;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function Terminal() {
  const { t, locale } = useLanguage();
  const sectionRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [typedLines, setTypedLines] = useState([]);
  const [bootDone, setBootDone] = useState(false);

  /* The exchange below the chips. `request` carries a nonce so clicking the
     same chip twice re-runs the sequence with a freshly drawn answer. */
  const [activePromptId, setActivePromptId] = useState(null);
  const [request, setRequest] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [typedQ, setTypedQ] = useState("");
  const [typedA, setTypedA] = useState("");
  const nonce = useRef(0);
  const qRef = useRef("");
  const aRef = useRef("");

  const setQ = (value) => {
    qRef.current = value;
    setTypedQ(value);
  };
  const setA = (value) => {
    aRef.current = value;
    setTypedA(value);
  };

  const bootLines = [
    { text: t("home.terminal.boot.cmd1"), command: true },
    { text: t("home.terminal.boot.out1"), command: false },
    { text: t("home.terminal.boot.cmd2"), command: true },
    { text: t("home.terminal.boot.out2"), command: false },
  ];

  const prompts = PROMPT_IDS.map((id) => ({
    id,
    label: t(`home.terminal.prompts.${id}.label`),
    answers: Array.from({ length: ANSWERS_PER_PROMPT }, (_, i) =>
      t(`home.terminal.prompts.${id}.answers.${i + 1}`),
    ),
  }));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return undefined;

    if (prefersReducedMotion()) {
      setTypedLines(bootLines.map((line) => line.text));
      setBootDone(true);
      return undefined;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let cancelled = false;
    let timeoutId;
    setTypedLines(bootLines.map(() => ""));
    setBootDone(false);

    function typeNextChar() {
      if (cancelled) return;
      if (lineIndex >= bootLines.length) {
        setBootDone(true);
        return;
      }
      const line = bootLines[lineIndex];
      charIndex += 1;
      // Capture into locals: charIndex/lineIndex are mutated synchronously
      // right after this call queues, so the updater must not close over
      // the live (mutable) variables or it can read a value that already
      // moved on by the time React invokes it.
      const capturedCharIndex = charIndex;
      const capturedLineIndex = lineIndex;
      setTypedLines((prev) => {
        const next = [...prev];
        next[capturedLineIndex] = line.text.slice(0, capturedCharIndex);
        return next;
      });
      if (charIndex >= line.text.length) {
        lineIndex += 1;
        charIndex = 0;
        timeoutId = setTimeout(typeNextChar, LINE_PAUSE_MS);
      } else {
        timeoutId = setTimeout(typeNextChar, TYPE_SPEED_MS);
      }
    }
    typeNextChar();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered, locale]);

  /* Exchange sequence: rub out whatever's on screen a character at a time,
     type the new question, stall on "thinking", then type the answer. Every
     step checks `cancelled` so a mid-sequence click cleanly takes over. */
  useEffect(() => {
    let cancelled = false;
    const timers = [];
    const sleep = (ms) =>
      new Promise((resolve) => timers.push(setTimeout(resolve, ms)));

    async function run() {
      if (prefersReducedMotion()) {
        setQ(request?.label ?? "");
        setA(request?.answer ?? "");
        setPhase(request ? "done" : "idle");
        return;
      }

      const startA = aRef.current;
      const startQ = qRef.current;

      if (startA) {
        setPhase("erasing");
        for (let i = startA.length; i > 0; i -= 1) {
          if (cancelled) return;
          setA(startA.slice(0, i - 1));
          await sleep(ERASE_MS);
        }
      }
      if (startQ) {
        setPhase("erasing");
        for (let i = startQ.length; i > 0; i -= 1) {
          if (cancelled) return;
          setQ(startQ.slice(0, i - 1));
          await sleep(ERASE_MS);
        }
      }

      if (!request) {
        if (!cancelled) setPhase("idle");
        return;
      }

      setPhase("typing-q");
      for (let i = 1; i <= request.label.length; i += 1) {
        if (cancelled) return;
        setQ(request.label.slice(0, i));
        await sleep(Q_TYPE_MS);
      }

      await sleep(BEFORE_THINK_MS);
      if (cancelled) return;
      setPhase("thinking");
      await sleep(THINK_MS);
      if (cancelled) return;

      setPhase("typing-a");
      for (let i = 1; i <= request.answer.length; i += 1) {
        if (cancelled) return;
        setA(request.answer.slice(0, i));
        await sleep(A_TYPE_MS);
      }
      if (!cancelled) setPhase("done");
    }

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [request]);

  /* Wipe the exchange if the reader switches language mid-answer — the text
     on screen belongs to the old dictionary. */
  useEffect(() => {
    setActivePromptId(null);
    setRequest(null);
  }, [locale]);

  const handleChip = (prompt) => {
    nonce.current += 1;
    if (activePromptId === prompt.id) {
      setActivePromptId(null);
      setRequest({ nonce: nonce.current, label: null, answer: null });
      return;
    }
    const answer =
      prompt.answers[Math.floor(Math.random() * prompt.answers.length)];
    setActivePromptId(prompt.id);
    setRequest({ nonce: nonce.current, label: prompt.label, answer });
  };

  const activeLineIndex = bootDone
    ? -1
    : bootLines.findIndex(
        (line, i) => (typedLines[i] ?? "").length < line.text.length,
      );

  const showExchange = phase !== "idle" || typedQ || typedA;

  return (
    <section className="terminal-section" ref={sectionRef}>
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <div className="terminal-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="terminal-titlebar-label">
            {t("home.terminal.titlebar")}
          </span>
          <div className="terminal-titlebar-spacer" aria-hidden="true" />
        </div>

        <div className="terminal-body">
          {bootLines.map((line, i) => (
            <p
              key={i}
              className={`terminal-line${line.command ? " is-command" : " is-output"}`}
            >
              {line.command && (
                <span className="terminal-caret" aria-hidden="true">
                  $
                </span>
              )}
              <span className="terminal-text">
                {typedLines[i]}
                {i === activeLineIndex && (
                  <span className="terminal-cursor" aria-hidden="true" />
                )}
              </span>
            </p>
          ))}

          <div className={`terminal-prompts${bootDone ? " is-visible" : ""}`}>
            <span className="terminal-hint">{t("home.terminal.hint")}</span>
            <div className="terminal-chips">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className={`terminal-chip${activePromptId === prompt.id ? " is-active" : ""}`}
                  aria-pressed={activePromptId === prompt.id}
                  onClick={() => handleChip(prompt)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            {showExchange && (
              <div className="terminal-answer" aria-live="polite">
                <p className="terminal-line is-command">
                  <span className="terminal-caret" aria-hidden="true">
                    $
                  </span>
                  <span className="terminal-text">
                    {typedQ}
                    {(phase === "typing-q" || phase === "erasing") && (
                      <span className="terminal-cursor" aria-hidden="true" />
                    )}
                  </span>
                </p>

                {phase === "thinking" && (
                  <p className="terminal-line is-thinking">
                    <span className="terminal-text">
                      {t("home.terminal.thinking")}
                    </span>
                  </p>
                )}

                {(typedA || phase === "typing-a" || phase === "done") && (
                  <p className="terminal-line is-output">
                    <span className="terminal-caret" aria-hidden="true">
                      &gt;
                    </span>
                    <span className="terminal-text">
                      {typedA}
                      {phase === "typing-a" && (
                        <span className="terminal-cursor" aria-hidden="true" />
                      )}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Terminal;

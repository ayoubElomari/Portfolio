import { useEffect, useState } from "react";

/* Distance from the top of the viewport that counts as "you are here".
   Roughly the fixed header height plus a little breathing room. */
const ACTIVE_LINE = 160;

function slugify(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "") || "section"
  );
}

/**
 * Scans the rendered article for `h1`/`h2` nodes and builds a two-level table
 * of contents, tracking which section the reader is currently in and how far
 * through the article they are.
 *
 * `contentKey` is whatever identifies the article currently rendered inside
 * `containerRef` — pass the MDX component itself. A ref object's identity
 * never changes, so without this the scan would run once on mount and then
 * never again: switching language swaps the article for its translation and
 * the contents rail would keep listing the previous language's headings.
 *
 * Returns `{ tocs, activeToc, progress }` where `progress` is 0..1.
 */
export function useToc(containerRef, contentKey) {
  const [tocs, setTocs] = useState([]);
  const [activeToc, setActiveToc] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const articleElement = containerRef.current;
    if (!articleElement) return;

    const headers = articleElement.querySelectorAll("h1, h2");
    const newTocs = [];
    const used = new Set();

    headers.forEach((header) => {
      const level = parseInt(header.tagName[1], 10);

      /* Prefer the stable id rehype-slug already assigned so that deep links
         survive a reload; only mint one when a heading has none. */
      let id = header.id || slugify(header.textContent);
      if (used.has(id)) {
        let n = 2;
        while (used.has(`${id}-${n}`)) n += 1;
        id = `${id}-${n}`;
      }
      used.add(id);
      header.id = id;

      const entry = { title: header.textContent, id, level };

      if (level === 1) {
        newTocs.push({ ...entry, children: [] });
      } else if (newTocs.length > 0) {
        newTocs[newTocs.length - 1].children.push(entry);
      } else {
        /* An h2 before any h1 still deserves a top-level slot */
        newTocs.push({ ...entry, children: [] });
      }
    });

    setTocs(newTocs);
    setActiveToc(headers[0]?.id || null);
  }, [containerRef, contentKey]);

  useEffect(() => {
    const articleElement = containerRef.current;
    if (!articleElement) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const headers = articleElement.querySelectorAll("h1, h2");
      if (!headers.length) return;

      /* Active = the last heading whose top has crossed the reading line.
         (Picking the first *visible* heading wrongly activates the next
         section the moment its title peeks in at the bottom of the screen.) */
      let current = headers[0].id;
      for (const header of headers) {
        if (header.getBoundingClientRect().top - ACTIVE_LINE <= 0) {
          current = header.id;
        } else break;
      }

      /* The final sections often sit closer to the bottom than ACTIVE_LINE is
         to the top, so they can never cross the line — the page runs out of
         scroll first. Once the reader is at the bottom, activate whichever
         heading is the last one actually on screen. */
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        for (const header of headers) {
          if (header.getBoundingClientRect().top < window.innerHeight) {
            current = header.id;
          }
        }
      }
      setActiveToc(current);

      const rect = articleElement.getBoundingClientRect();
      const scrolled = ACTIVE_LINE - rect.top;
      const travel = rect.height - window.innerHeight * 0.5;
      setProgress(
        travel <= 0 ? 1 : Math.min(1, Math.max(0, scrolled / travel)),
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [containerRef, tocs]);

  return { tocs, activeToc, progress };
}

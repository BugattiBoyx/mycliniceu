"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

/**
 * Fires once when the element first overlaps the viewport.
 *
 * threshold 0: sections taller than the viewport can never reach a meaningful
 * visible ratio, so any overlap has to count. The timeout is a failsafe for the
 * case where the observer never reports an element that is plainly on screen.
 */
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    const failsafe = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setInView(true);
    }, 1200);
    return () => {
      clearTimeout(failsafe);
      io.disconnect();
    };
  }, [rootMargin]);

  return [ref, inView] as const;
}

const EASE_OUT = (t: number) => 1 - (1 - t) ** 3;
// A dot between digits is a Dutch thousands separator ("2.400"), a comma is the
// decimal mark. Both have to survive the count, so they are matched together.
const NUMBER_TOKEN = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g;

function formatLike(template: string, value: number) {
  const [whole, decimals = ""] = template.split(",");
  const grouped = whole.includes(".");
  const fixed = value.toFixed(decimals.length);
  const [head, tail] = fixed.split(".");
  const withGroups = grouped ? Number(head).toLocaleString("nl-NL") : head;
  return tail ? `${withGroups},${tail}` : withGroups;
}

/**
 * Counts every number inside a label up from zero, leaving the surrounding
 * characters untouched so "10-22%" and "2.400+" animate without being reworded.
 */
export function CountUp({
  children,
  duration = 1400,
  className,
}: {
  children: string;
  duration?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(EASE_OUT(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, duration]);

  const text = children.replace(NUMBER_TOKEN, (token) => {
    const target = Number(token.replace(/\./g, "").replace(",", "."));
    return formatLike(token, target * progress);
  });

  return (
    <span ref={ref} className={className}>
      {/* The final string stays in the accessibility tree while digits tick. */}
      <span aria-hidden>{text}</span>
      <span className="mj-sr-only">{children}</span>
    </span>
  );
}

/** Scroll-triggered entrance with directional variants. */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
  variant = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  variant?: RevealVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // threshold 0: sections taller than the viewport can never reach a
      // meaningful visible ratio, so any overlap has to count.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    io.observe(el);
    // Belt and braces: if the observer never reported an element that is
    // plainly on screen, reveal it rather than leaving a blank section.
    const failsafe = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setInView(true);
    }, 1200);
    return () => {
      clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`mj-reveal mj-reveal-${variant}${inView ? " mj-in" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}

/** Subtle parallax on scroll within an element. */
export function Parallax({
  children,
  speed = 0.18,
  className,
  style,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        setY(-mid * speed);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: "hidden" }}>
      <div
        className="mj-parallax-inner"
        style={{ transform: `translate3d(0, ${y}px, 0)` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A rule that draws itself as the reader moves through the block it belongs to,
 * used to tie the steps of a sequence together.
 */
export function ScrollLine({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        // Complete the draw by the time the block sits mid-viewport.
        const span = rect.height + window.innerHeight * 0.35;
        const travelled = window.innerHeight * 0.85 - rect.top;
        setP(Math.max(0, Math.min(1, travelled / span)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={`mj-scrollline mj-scrollline-${orientation}${className ? ` ${className}` : ""}`} aria-hidden>
      <div
        className="mj-scrollline-fill"
        style={{ transform: orientation === "horizontal" ? `scaleX(${p})` : `scaleY(${p})` }}
      />
    </div>
  );
}

/** Thin reading progress bar at the top of the viewport. */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("mj-js");
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mj-scroll-progress" aria-hidden>
      <div className="mj-scroll-progress-bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

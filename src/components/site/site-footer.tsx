"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CONSUMER_APP_URL, DOCS_URL, PRIVACY_URL, TERMS_URL } from "@/lib/site";
import { FOOTER_FEATURES } from "./footer-features";

const PORTAL_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/developers", label: "Developers" },
  { href: "/agents", label: "AI agents" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/pricing", label: "Pricing" },
];

const MORE_LINKS = [
  { href: "/platform", label: "How it works" },
  { href: "/account", label: "Account" },
  { href: DOCS_URL, label: "Documentation", external: true },
  { href: CONSUMER_APP_URL, label: "medialane.io", external: true },
  { href: "https://x.com/medialane_io", label: "X", external: true },
];

const LANE_COLOR = ["225,117,176", "251,140,70", "246,96,143", "137,90,246", "153,178,255"];
const LANE_LIGHT = ["243,200,223", "253,209,181", "251,191,210", "208,189,251", "214,224,255"];

type Streak = { lane: number; t: number; speed: number; len: number };

function useFooterScene(
  scene: React.RefObject<HTMLCanvasElement | null>,
  track: React.RefObject<HTMLUListElement | null>,
  prev: React.RefObject<HTMLButtonElement | null>,
  next: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    const canvas = scene.current;
    const list = track.current;
    const prevBtn = prev.current;
    const nextBtn = next.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !list || !prevBtn || !nextBtn || !ctx) return;

    const cards = Array.from(list.children) as HTMLElement[];
    const n = cards.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let hy = 0;
    let cx = 0;
    let spacing = 0;
    const laneEnd: number[] = [];
    let active = 0;
    let hoverIndex = -1;
    let visible = false;
    let raf = 0;
    let last = 0;
    const streaks: Streak[] = [];
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 4; k++) {
        streaks.push({ lane: i, t: Math.random() * 1.1, speed: 0.1 + Math.random() * 0.14, len: 0.12 + Math.random() * 0.14 });
      }
    }

    const laneX = (i: number, p: number) => cx + (laneEnd[i] - cx) * p;

    const anchor = () => {
      const sr = canvas.getBoundingClientRect();
      const cr = cards[active].getBoundingClientRect();
      return { x: cr.left + cr.width / 2 - sr.left, y: cr.bottom - sr.top };
    };

    const beam = () => {
      const a = anchor();
      if (a.x < -80 || a.x > w + 80) return;
      const col = LANE_COLOR[active % 5];
      const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 80);
      g.addColorStop(0, `rgba(${col},0.5)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(a.x - 80, a.y - 80, 160, 160);
    };

    const retarget = (snap: boolean, dt?: number) => {
      const a = anchor();
      const k = snap ? 1 : 1 - Math.pow(0.0005, dt || 0.016);
      for (let i = 0; i < n; i++) {
        let target = cx + (i - (n - 1) / 2) * spacing;
        if (i === active && a.y > hy + 20) {
          target = cx + ((a.x - cx) * (h - hy)) / (a.y - hy);
          target = Math.max(-w, Math.min(2 * w, target));
        }
        laneEnd[i] = laneEnd[i] === undefined || snap ? target : laneEnd[i] + (target - laneEnd[i]) * k;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let j = 0; j < n; j++) {
        const line = ctx.createLinearGradient(0, hy, 0, h);
        line.addColorStop(0, `rgba(${LANE_COLOR[j % 5]},0)`);
        line.addColorStop(0.3, `rgba(${LANE_COLOR[j % 5]},${j === active ? 0.9 : 0.34})`);
        line.addColorStop(1, `rgba(${LANE_COLOR[j % 5]},0)`);
        ctx.strokeStyle = line;
        ctx.lineWidth = j === active ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(cx, hy);
        ctx.lineTo(laneX(j, 1), h);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const s of streaks) {
        if (s.t <= 0) continue;
        const on = s.lane === active;
        const p1 = Math.pow(s.t, 2.4);
        const p0 = Math.pow(Math.max(0, s.t - s.len), 2.4);
        const x0 = laneX(s.lane, p0);
        const y0 = hy + (h - hy) * p0;
        const x1 = laneX(s.lane, p1);
        const y1 = hy + (h - hy) * p1;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        const alpha = (on ? 1 : 0.35) * Math.min(1, s.t * 3) * (1 - 0.85 * p1);
        g.addColorStop(0, `rgba(${LANE_LIGHT[s.lane % 5]},0)`);
        g.addColorStop(1, `rgba(${LANE_LIGHT[s.lane % 5]},${alpha})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = (on ? 1.6 : 0.9) + p1 * (on ? 5 : 3);
        ctx.shadowColor = on ? `rgba(${LANE_COLOR[s.lane % 5]},0.9)` : "rgba(0,0,0,0)";
        ctx.shadowBlur = on ? 14 : 0;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
      beam();
    };

    const setActive = (i: number) => {
      if (i === active && cards[i].classList.contains("is-lit")) return;
      active = i;
      cards.forEach((card, j) => card.classList.toggle("is-lit", j === i));
      if (reduce) {
        retarget(true);
        draw();
      }
    };

    const step = () => cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 16);

    const litFromScroll = () => {
      if (hoverIndex >= 0) return;
      setActive(Math.max(0, Math.min(n - 1, Math.round(list.scrollLeft / step()))));
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const s of streaks) {
        s.t += s.speed * dt * (s.lane === active ? 1.6 : 1);
        if (s.t - s.len > 1.05) {
          s.t = -Math.random() * 0.6;
          s.speed = 0.1 + Math.random() * 0.14;
        }
      }
      retarget(false, dt);
      draw();
    };

    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !reduce && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      hy = list.getBoundingClientRect().top - r.top;
      spacing = w * 0.125;
      retarget(true);
      draw();
    };

    const syncButtons = () => {
      prevBtn.disabled = list.scrollLeft <= 1;
      nextBtn.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
    };
    const go = (dir: number) => list.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    const onPrev = () => go(-1);
    const onNext = () => go(1);
    const onScroll = () => {
      litFromScroll();
      syncButtons();
      if (reduce) {
        retarget(true);
        draw();
      }
    };
    prevBtn.addEventListener("click", onPrev);
    nextBtn.addEventListener("click", onNext);
    list.addEventListener("scroll", onScroll, { passive: true });
    const hoverHandlers = cards.map((card, idx) => {
      const enter = () => {
        hoverIndex = idx;
        setActive(idx);
      };
      const leave = () => {
        hoverIndex = -1;
        litFromScroll();
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      return { card, enter, leave };
    });

    resize();
    setActive(0);
    syncButtons();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      syncButtons();
    });
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", run);
    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      run();
    });
    visibility.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", run);
      prevBtn.removeEventListener("click", onPrev);
      nextBtn.removeEventListener("click", onNext);
      list.removeEventListener("scroll", onScroll);
      hoverHandlers.forEach(({ card, enter, leave }) => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
      });
    };
  }, [scene, track, prev, next]);
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <li>
      {external ? (
        <a className="ft-link" href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <Link className="ft-link" href={href}>
          {label}
        </Link>
      )}
    </li>
  );
}

const ARROW = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;

export function SiteFooter() {
  const scene = useRef<HTMLCanvasElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const prev = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  useFooterScene(scene, track, prev, next);

  return (
    <footer className="ft">
      <canvas ref={scene} className="ft-scene" aria-hidden="true" />
      <div className="ft-content">
        <div className="ft-carousel">
          <ul ref={track} className="ft-track" tabIndex={0} aria-label="Highlights">
            {FOOTER_FEATURES.map((feature) => (
              <li key={feature.title} className="ft-card">
                <span className="ft-icon">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: feature.icon }}
                  />
                </span>
                <h3>{feature.title}</h3>
              </li>
            ))}
          </ul>
          <div className="ft-controls">
            <button ref={prev} type="button" className="ft-btn" aria-label="Previous">
              <svg {...ARROW}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button ref={next} type="button" className="ft-btn" aria-label="Next">
              <svg {...ARROW}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="ft-body">
          <div className="ft-brand">
            <Link href="/" aria-label="Medialane">
              <Image src="/medialane-light-logo.png" alt="Medialane" width={300} height={52} className="h-[38px] w-auto" />
            </Link>
            <p>Platform for tokenization, Launchpad and marketplace of programmable intellectual property.</p>
            <Link href="/contact" className="ft-contact">
              Contact
            </Link>
          </div>
          <ul className="ft-links">
            {PORTAL_LINKS.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </ul>
          <ul className="ft-links">
            {MORE_LINKS.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-content ft-legal">
        <p>© {new Date().getFullYear()} Medialane DAO</p>
        <div className="flex items-center gap-6">
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">
            Terms
          </a>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

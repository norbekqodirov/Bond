"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/settings";

type BannerItem = {
  id: string;
  title: string | null;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  registrationDeadline?: string | null;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
};

function getCountdown(deadline?: string | null, now?: Date): Countdown | null {
  if (!deadline) {
    return null;
  }
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) {
    return null;
  }
  const current = now ?? new Date();
  const diffMs = target.getTime() - current.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, expired: false };
}

export function OlympiadBannerCarousel({
  items,
  locale
}: {
  items: BannerItem[];
  locale: Locale;
}) {
  const t = useTranslations("promo");
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const trackRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ slideWidth: 0, gap: 0, viewport: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const visibleItems = useMemo(() => items.filter((item) => item.title), [items]);
  const loopedItems = useMemo(() => {
    if (visibleItems.length <= 1) {
      return visibleItems;
    }
    return [
      visibleItems[visibleItems.length - 1],
      ...visibleItems,
      visibleItems[0]
    ];
  }, [visibleItems]);

  useEffect(() => {
    if (visibleItems.length <= 1) {
      setIndex(0);
      return;
    }
    setIsJumping(true);
    setIndex(1);
  }, [visibleItems.length]);

  useEffect(() => {
    if (visibleItems.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibleItems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const recalc = () => {
      const firstSlide = track.querySelector<HTMLElement>("[data-slide]");
      if (!firstSlide) {
        return;
      }
      const styles = window.getComputedStyle(track);
      const gapValue = parseFloat(styles.columnGap || styles.gap || "0");
      setMetrics({
        slideWidth: firstSlide.offsetWidth,
        gap: Number.isNaN(gapValue) ? 0 : gapValue,
        viewport: track.clientWidth
      });
    };

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [loopedItems.length]);

  useEffect(() => {
    if (visibleItems.length <= 1) {
      return;
    }
    const lastIndex = loopedItems.length - 1;
    if (index === lastIndex || index === 0) {
      const timeout = window.setTimeout(() => {
        setIsJumping(true);
        setIndex(index === 0 ? lastIndex - 1 : 1);
      }, 700);
      return () => window.clearTimeout(timeout);
    }
  }, [index, loopedItems.length, visibleItems.length]);

  useEffect(() => {
    if (!isJumping) {
      return;
    }
    const id = window.requestAnimationFrame(() => setIsJumping(false));
    return () => window.cancelAnimationFrame(id);
  }, [isJumping]);

  if (visibleItems.length === 0) {
    return null;
  }

  const activeIndex =
    visibleItems.length <= 1 ? 0 : (index - 1 + visibleItems.length) % visibleItems.length;
  const slideDistance = metrics.slideWidth + metrics.gap;
  const hasMetrics = metrics.slideWidth > 0;
  const translateX = hasMetrics ? -(index * slideDistance) : 0;

  return (
    <section className="bg-white pb-4 pt-24 sm:pb-6 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex pb-1"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: isJumping || !hasMetrics ? "none" : "transform 700ms ease",
              willChange: "transform"
            }}
          >
            {loopedItems.map((item, itemIndex) => {
              const countdown = getCountdown(item.registrationDeadline, now);
              return (
                <div
                  key={`${item.id}-${itemIndex}`}
                  data-slide
                  className="w-full shrink-0"
                >
                  <div className="relative aspect-[8/3] overflow-hidden rounded-[36px] bg-slate-900">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title ?? "Olympiad"}
                        className="absolute inset-0 h-full w-full object-cover object-[center_top]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
                    <div className="relative z-10 grid h-full content-end gap-8 px-6 pb-10 pt-8 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                      <div>
                        <h3 className="text-2xl font-display font-semibold text-white sm:text-3xl lg:text-4xl">
                          {item.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-sm font-medium text-slate-200 sm:text-base">
                          {item.subtitle ?? t("fallback")}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/${locale}/register/${item.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-lift transition-transform hover:-translate-y-0.5"
                          >
                            {t("cta")}
                          </Link>
                          <Link
                            href={`/${locale}/register/${item.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
                          >
                            {t("details")}
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white backdrop-blur-md">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                          {t("endsIn")}
                        </p>
                        {countdown ? (
                          <div className="mt-5 grid grid-cols-3 gap-3">
                            {[
                              { label: t("days"), value: countdown.days },
                              { label: t("hours"), value: countdown.hours },
                              { label: t("minutes"), value: countdown.minutes }
                            ].map((slot) => (
                              <div
                                key={slot.label}
                                className="rounded-2xl bg-white/10 px-4 py-3 text-center"
                              >
                                <div className="text-xl font-semibold sm:text-2xl">
                                  {slot.value}
                                </div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                                  {slot.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-5 text-sm font-medium text-white/80">{t("tbd")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-6 top-6 flex gap-2">
            {visibleItems.map((item, idx) => (
              <span
                key={item.id}
                className={`h-2 w-2 rounded-full ${
                  idx === activeIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

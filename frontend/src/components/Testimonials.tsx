"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { getImageUrl } from "@/lib/api";
import { Testimonial } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const { t } = useLocale();

  if (testimonials.length === 0) return null;

  return (
    <div>
      <SectionHeading
        kicker={t("testimonials.kicker", "Endorsements")}
        title={t("testimonials.title", "What people say")}
        align="center"
        className="mb-14 mx-auto max-w-xl"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item, i) => (
          <motion.figure
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: easeOut }}
            className="bento-card flex h-full flex-col justify-between p-7"
          >
            <div>
              <Quote
                size={26}
                className="mb-4"
                style={{ color: "var(--noir-accent)" }}
                aria-hidden="true"
              />
              <blockquote
                className="text-base leading-relaxed"
                style={{ color: "var(--noir-fg)" }}
              >
                {item.quote}
              </blockquote>
            </div>

            <figcaption className="mt-6 flex items-center gap-3">
              <div
                className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold"
                style={{
                  borderColor: "var(--noir-border)",
                  background: "var(--noir-accent-soft)",
                  color: "var(--noir-accent)",
                }}
              >
                {item.avatarUrl ? (
                  <Image
                    src={getImageUrl(item.avatarUrl)}
                    alt={item.authorName}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  initials(item.authorName)
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="truncate text-sm font-semibold"
                    style={{ color: "var(--noir-fg)" }}
                  >
                    {item.authorName}
                  </span>
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 transition-opacity hover:opacity-70"
                      style={{ color: "var(--noir-accent)" }}
                      aria-label={`${item.authorName} profile`}
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
                {item.authorRole && (
                  <p
                    className="truncate text-xs"
                    style={{ color: "var(--noir-fg-subtle)" }}
                  >
                    {item.authorRole}
                  </p>
                )}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { StudioConfig } from "./studio-config";
import { formatPrice, imgSrcSet, tr } from "./studio-config";
import { allergenLabel } from "@/lib/allergens";

// ─────────────────────────────────────────────────────────────────────────────
// The five menu-item card components, rendering from the published
// StudioConfig. All colour/typography/radius comes in as CSS vars (--sd-*)
// set by StudioMenuView, so cards only deal in layout.
// ─────────────────────────────────────────────────────────────────────────────

export type StudioItem = {
  _id: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  price: number;
  imageUrl: string | null;
  tags: string[];
  /** Canonical allergen keys (lib/allergens.ts) — legal declaration. */
  allergens?: string[];
  isFeatured: boolean;
};

const RATIO: Record<string, string> = {
  square: "1 / 1",
  portrait: "3 / 4",
  landscape: "16 / 10",
};

function CardImage({
  item,
  locale,
  ratio,
  square = false,
  showImage = true,
}: {
  item: StudioItem;
  locale: string;
  ratio: string;
  square?: boolean;
  /** When false, always render the gradient placeholder (no image download). */
  showImage?: boolean;
}) {
  const aspect = square ? "1 / 1" : ratio;
  if (showImage && item.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...imgSrcSet(item.imageUrl)}
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        alt={tr(item.name, locale)}
        loading="lazy"
        className="w-full object-cover"
        style={{ aspectRatio: aspect, borderRadius: square ? "var(--sd-radius)" : 0 }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex w-full items-center justify-center"
      style={{
        aspectRatio: aspect,
        borderRadius: square ? "var(--sd-radius)" : 0,
        background:
          "linear-gradient(135deg, var(--sd-accent-08), var(--sd-ink-06))",
      }}
    >
      <span style={{ color: "var(--sd-accent)", fontSize: 22, opacity: 0.7, fontWeight: 600 }}>
        {tr(item.name, locale).charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function Price({
  value,
  style,
  currency,
}: {
  value: number;
  style: StudioConfig["cards"]["priceStyle"];
  currency: string;
}) {
  if (style === "badge") {
    return (
      <span
        className="inline-block shrink-0 px-2.5 py-1 text-[12px] font-semibold tabular-nums"
        style={{
          background: "var(--sd-accent)",
          color: "var(--sd-accent-ink)",
          borderRadius: "calc(var(--sd-radius) * 0.75)",
        }}
      >
        {formatPrice(value, currency)}
      </span>
    );
  }
  return (
    <span
      className="shrink-0 text-[14px] font-semibold tabular-nums"
      style={{ color: "var(--sd-ink)" }}
    >
      {formatPrice(value, currency)}
    </span>
  );
}

function TitleRow({
  item,
  locale,
  cards,
  currency,
}: {
  item: StudioItem;
  locale: string;
  cards: StudioConfig["cards"];
  currency: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="min-w-0 text-[15px] font-semibold leading-snug"
        style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
      >
        {tr(item.name, locale)}
      </span>
      {cards.priceStyle === "dotted" ? (
        <span
          aria-hidden
          className="mx-1 flex-1 border-b border-dotted"
          style={{ borderColor: "var(--sd-ink-25)", minWidth: 14 }}
        />
      ) : (
        <span className="flex-1" />
      )}
      <Price value={item.price} style={cards.priceStyle} currency={currency} />
    </div>
  );
}

function Description({ item, locale }: { item: StudioItem; locale: string }) {
  const text = tr(item.description, locale);
  if (!text) return null;
  return (
    <p
      className="text-[13px] leading-relaxed"
      style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)" }}
    >
      {text}
    </p>
  );
}

function Tags({ item }: { item: StudioItem }) {
  if (!item.tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.tags.slice(0, 4).map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 text-[10px] uppercase tracking-wide"
          style={{
            color: "var(--sd-ink-60)",
            border: "1px solid var(--sd-ink-14)",
            borderRadius: "calc(var(--sd-radius) * 0.5)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/**
 * Allergen declaration — NOT gated by cards.showTags. Georgian food-info law
 * requires this before purchase, typographically distinct from other text
 * (bolder ink, warning border) so it can't be mistaken for a marketing tag.
 */
function Allergens({
  item,
  locale,
  onDark = false,
}: {
  item: StudioItem;
  locale: string;
  onDark?: boolean;
}) {
  if (!item.allergens?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.allergens.map((key) => (
        <span
          key={key}
          className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            color: onDark ? "#FFD48A" : "var(--sd-ink)",
            border: onDark
              ? "1px solid rgba(255, 212, 138, 0.5)"
              : "1px solid var(--sd-ink-60)",
            borderRadius: "calc(var(--sd-radius) * 0.5)",
          }}
        >
          {allergenLabel(key, locale)}
        </span>
      ))}
    </div>
  );
}

export function StudioItemCard({
  item,
  locale,
  cards,
  currency,
  onOpen,
}: {
  item: StudioItem;
  locale: string;
  cards: StudioConfig["cards"];
  currency: string;
  onOpen?: (item: StudioItem) => void;
}) {
  const ratio = RATIO[cards.imageRatio] ?? RATIO.square;
  const interactive = onOpen
    ? { onClick: () => onOpen(item), role: "button", tabIndex: 0 }
    : {};

  switch (cards.variant) {
    case "minimal":
      return (
        <div
          className="sd-card flex flex-col"
          style={{
            padding: "calc(14px * var(--sd-density)) 2px",
            gap: "calc(6px * var(--sd-density))",
            borderBottom: "1px solid var(--sd-ink-14)",
          }}
          {...interactive}
        >
          <TitleRow item={item} locale={locale} cards={cards} currency={currency} />
          {cards.showDescriptions && <Description item={item} locale={locale} />}
          {cards.showTags && <Tags item={item} />}
          <Allergens item={item} locale={locale} />
        </div>
      );

    case "glass":
      return (
        <div
          className="sd-card relative overflow-hidden"
          style={{ borderRadius: "var(--sd-radius)" }}
          {...interactive}
        >
          <CardImage item={item} locale={locale} ratio={ratio} showImage={cards.showImages} />
          <div
            className="absolute inset-x-2 bottom-2 backdrop-blur-md"
            style={{
              background: "var(--sd-surface-70)",
              borderRadius: "calc(var(--sd-radius) * 0.85)",
              border: "1px solid var(--sd-ink-08)",
              padding: "calc(10px * var(--sd-density))",
            }}
          >
            <TitleRow item={item} locale={locale} cards={cards} currency={currency} />
            {cards.showDescriptions && <Description item={item} locale={locale} />}
            {cards.showTags && <Tags item={item} />}
            <Allergens item={item} locale={locale} />
          </div>
        </div>
      );

    case "editorial":
      return (
        <div
          className="sd-card flex items-center"
          style={{
            gap: "calc(14px * var(--sd-density))",
            padding: "calc(12px * var(--sd-density)) 2px",
            borderBottom: "1px solid var(--sd-ink-14)",
          }}
          {...interactive}
        >
          {cards.showImages && (
            <div className="w-20 shrink-0 sm:w-24">
              <CardImage item={item} locale={locale} ratio="1 / 1" square />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
            <TitleRow item={item} locale={locale} cards={cards} currency={currency} />
            {cards.showDescriptions && <Description item={item} locale={locale} />}
            {cards.showTags && <Tags item={item} />}
            <Allergens item={item} locale={locale} />
          </div>
        </div>
      );

    case "banner":
      return (
        <div
          className="sd-card relative overflow-hidden"
          style={{ borderRadius: "var(--sd-radius)" }}
          {...interactive}
        >
          <CardImage item={item} locale={locale} ratio="16 / 9" showImage={cards.showImages} />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ padding: "calc(14px * var(--sd-density))" }}
          >
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-[17px] font-semibold"
                  style={{ color: "#FFFFFF", fontFamily: "var(--sd-font-heading)" }}
                >
                  {tr(item.name, locale)}
                </p>
                {cards.showDescriptions && (
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                    {tr(item.description, locale)}
                  </p>
                )}
                {cards.showTags && (
                  <div className="mt-1.5">
                    <Tags item={item} />
                  </div>
                )}
                <div className="mt-1.5">
                  <Allergens item={item} locale={locale} onDark />
                </div>
              </div>
              <Price
                value={item.price}
                style={cards.priceStyle === "dotted" ? "plain" : cards.priceStyle}
                currency={currency}
              />
            </div>
          </div>
        </div>
      );

    // "classic" and any future/unknown variant
    default:
      return (
        <div
          className="sd-card flex flex-col overflow-hidden"
          style={{
            background: "var(--sd-surface)",
            borderRadius: "var(--sd-radius)",
            border: "1px solid var(--sd-ink-08)",
          }}
          {...interactive}
        >
          {cards.showImages && <CardImage item={item} locale={locale} ratio={ratio} />}
          <div
            className="flex flex-col"
            style={{
              padding: "calc(14px * var(--sd-density))",
              gap: "calc(7px * var(--sd-density))",
            }}
          >
            <TitleRow item={item} locale={locale} cards={cards} currency={currency} />
            {cards.showDescriptions && <Description item={item} locale={locale} />}
            {cards.showTags && <Tags item={item} />}
            <Allergens item={item} locale={locale} />
          </div>
        </div>
      );
  }
}

/** Compact card for the Featured strip. */
export function StudioFeaturedCard({
  item,
  locale,
  currency,
  onOpen,
}: {
  item: StudioItem;
  locale: string;
  currency: string;
  onOpen?: (item: StudioItem) => void;
}) {
  return (
    <div
      className="sd-card w-40 shrink-0 overflow-hidden sm:w-48"
      style={{
        background: "var(--sd-surface)",
        borderRadius: "var(--sd-radius)",
        border: "1px solid var(--sd-accent-35)",
      }}
      {...(onOpen ? { onClick: () => onOpen(item), role: "button", tabIndex: 0 } : {})}
    >
      <CardImage item={item} locale={locale} ratio="4 / 3" />
      <div style={{ padding: 10 }}>
        <p
          className="truncate text-[13px] font-semibold"
          style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
        >
          {tr(item.name, locale)}
        </p>
        <p
          className="mt-0.5 text-[12px] font-semibold tabular-nums"
          style={{ color: "var(--sd-accent)" }}
        >
          {formatPrice(item.price, currency)}
        </p>
      </div>
    </div>
  );
}

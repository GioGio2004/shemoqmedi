"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import AssembleIntro from "./AssembleIntro";
import DarkTheme from "./theme-components/DarkTheme";
import LightTheme from "./theme-components/LightTheme";
import OrangeTheme from "./theme-components/OrangeTheme";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface TagSnapshot {
  _id: string;
  userId?: string;
  volooTagsUUID: string;
  isActive: boolean;
  activeMode: string;
  showAnimation?: boolean;
  selectedAnimation?: string;
  redirectUrl?: string;
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardCompany?: string;
  vcardTitle?: string;
  vcardNote?: string;
  tapCount?: number;
  tableName?: string; // physical tag: the table/seat identifier
  // Cafe Hub fields
  hubTheme?: "dark" | "light" | "orange";
  hubBusinessName?: string;
  hubMenuUrl?: string;
  hubInstagramUrl?: string;
  hubTiktokUrl?: string;
  hubFacebookUrl?: string;
  hubBackgroundImageUrl?: string;
}

interface Props {
  tag: TagSnapshot;
  isOwner: boolean;
  tagUuid: string;
}

// ─── DEEP LINK HELPER ────────────────────────────────────────────────────────
function smartRedirect(url: string) {
  let finalUrl = url;
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const fallback = () => window.location.assign(finalUrl);

  try {
    const urlObj = new URL(finalUrl);
    const host = urlObj.hostname.replace("www.", "").toLowerCase();
    const segs = urlObj.pathname.split("/").filter(Boolean);
    const user = segs[0];

    if (isIOS || isAndroid) {
      if (host === "instagram.com" && user) {
        if (isAndroid) {
          window.location.replace(
            `intent://instagram.com/_u/${user}/#Intent;package=com.instagram.android;scheme=https;end`
          );
          return;
        }
        window.location.replace(`instagram://user?username=${user}`);
        setTimeout(fallback, 2000);
        return;
      }
      if (host === "facebook.com") {
        if (isAndroid) {
          window.location.replace(
            `intent://facewebmodal/f?href=${finalUrl}#Intent;package=com.facebook.katana;scheme=fb;end`
          );
          return;
        }
        window.location.replace(`fb://facewebmodal/f?href=${finalUrl}`);
        setTimeout(fallback, 2000);
        return;
      }
      if (host === "tiktok.com" && user) {
        const clean = user.startsWith("@") ? user.slice(1) : user;
        window.location.replace(`snssdk1233://user/profile/${clean}`);
        setTimeout(fallback, 2000);
        return;
      }
    }
  } catch {
    // parsing failed — fall through to web fallback
  }

  fallback();
}

// ─── VCARD DOWNLOAD ──────────────────────────────────────────────────────────
function downloadVCard(t: TagSnapshot) {
  const name = t.vcardName || "Voloo Contact";
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    t.vcardPhone ? `TEL;TYPE=CELL:${t.vcardPhone}` : "",
    t.vcardEmail ? `EMAIL:${t.vcardEmail}` : "",
    t.vcardCompany ? `ORG:${t.vcardCompany}` : "",
    t.vcardTitle ? `TITLE:${t.vcardTitle}` : "",
    t.vcardNote ? `NOTE:${t.vcardNote}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── CAFE HUB ROUTER ─────────────────────────────────────────────────────────
function CafeHubUI({ tag, visible }: { tag: TagSnapshot; visible: boolean }) {
  const props = {
    businessName: tag.hubBusinessName,
    menuUrl: tag.hubMenuUrl,
    instagramUrl: tag.hubInstagramUrl,
    tiktokUrl: tag.hubTiktokUrl,
    facebookUrl: tag.hubFacebookUrl,
    backgroundImageUrl: tag.hubBackgroundImageUrl,
    visible,
    onLink: smartRedirect,
  };

  switch (tag.hubTheme) {
    case "light":
      return <LightTheme {...props} />;
    case "orange":
      return <OrangeTheme {...props} />;
    default:
      return <DarkTheme {...props} />;
  }
}

// ─── INACTIVE CARD ───────────────────────────────────────────────────────────
function InactiveCard() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm rounded-[2.5rem] p-8 bg-white/5 backdrop-blur-3xl border border-white/10 text-center">
        <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-white/40" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Tag Inactive</h2>
        <p className="text-white/50 text-sm">
          This Voloo Magic tag hasn&apos;t been activated yet.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ───────────────────────────────────────────────────
export default function TapExperienceClient({ tag, tagUuid: _tagUuid }: Props) {
  const [animDone, setAnimDone] = useState(false);
  const [hubVisible, setHubVisible] = useState(false);
  const [vcardDone, setVcardDone] = useState(false);

  const skipAnim = tag.showAnimation === false;

  // Skip animation immediately if disabled
  useEffect(() => {
    if (skipAnim) setAnimDone(true);
  }, [skipAnim]);

  // Once animation is done, reveal the hub (with a small delay for smoothness)
  useEffect(() => {
    if (!animDone) return;
    const t = setTimeout(() => setHubVisible(true), 150);
    return () => clearTimeout(t);
  }, [animDone]);

  // ── Inactive tag ──────────────────────────────────────────────────────────
  if (!tag.isActive) return <InactiveCard />;

  // ── Cafe Hub mode ─────────────────────────────────────────────────────────
  if (tag.activeMode === "cafe_hub") {
    const themeBg =
      tag.hubTheme === "light" ? "bg-zinc-100" : "bg-zinc-950";

    return (
      <div className={`relative h-[100dvh] w-full overflow-hidden ${themeBg}`}>
        {!skipAnim && !animDone && (
          <AssembleIntro
            onComplete={() => setAnimDone(true)}
            collapsed={animDone}
          />
        )}
        <CafeHubUI tag={tag} visible={hubVisible} />
      </div>
    );
  }

  // ── vCard / Business Card mode ────────────────────────────────────────────
  if (tag.activeMode === "vcard" || tag.activeMode === "business") {
    const handleAnimDone = () => {
      setAnimDone(true);
      downloadVCard(tag);
      setVcardDone(true);
    };

    return (
      <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden relative">
        {!skipAnim && !animDone && (
          <AssembleIntro onComplete={handleAnimDone} collapsed={animDone} />
        )}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 delay-100
            ${hubVisible || (skipAnim && vcardDone) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"}`}
        >
          <div className="w-full max-w-sm rounded-[2.5rem] p-8 bg-white/5 backdrop-blur-3xl border border-white/10 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Contact Saved!</h2>
            <p className="text-white/50 text-sm">
              Open the downloaded .vcf file to add{" "}
              {tag.vcardName || "this contact"} to your contacts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Redirect modes (with optional animation) ──────────────────────────────
  if (tag.redirectUrl) {
    const handleAnimDone = () => {
      setAnimDone(true);
      smartRedirect(tag.redirectUrl!);
    };

    // No animation — redirect immediately
    if (skipAnim) {
      smartRedirect(tag.redirectUrl);
      return <div className="h-[100dvh] bg-black" />;
    }

    return (
      <div className="flex h-[100dvh] w-full bg-black overflow-hidden relative">
        <AssembleIntro onComplete={handleAnimDone} collapsed={animDone} />
      </div>
    );
  }

  // ── Fallback — nothing configured ────────────────────────────────────────
  return <InactiveCard />;
}
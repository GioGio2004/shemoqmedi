"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Listing pages are static and ship no auth code. Clerk's __client_uat cookie
// (readable by scripts, non-zero while signed in; "__client_uat_<suffix>" on
// dev instances) tells us cheaply whether anyone is signed in. Only then is
// the Evaluate tool loaded, with its own Clerk + Convex providers; it shows
// itself only to jury members.
const JuryEvaluate = dynamic(() => import("./JuryEvaluate"), { ssr: false });

function signedIn() {
  return /(?:^|;\s*)__client_uat(?:_[^=;]+)?=([1-9]\d*)/.test(document.cookie);
}

export function JuryLauncher({ slug, title }: { slug: string; title: string }) {
  const [load, setLoad] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cookies exist only in the browser
    if (signedIn()) setLoad(true);
  }, []);
  return load ? <JuryEvaluate slug={slug} title={title} /> : null;
}

// components/auth/auth-css.ts
// ─────────────────────────────────────────────────────────────────────────────
// AUTH_CSS — RULED skin for the consumer auth surfaces (sheet + standalone
// pages), delivered as a mounted <style>{AUTH_CSS}</style> template literal,
// mirroring the ml-css.ts pattern. The sheet is portaled to <body> — outside
// any tweened landing palette — so it consumes the static dark --v-* tokens
// from globals.css directly. z-9999 backdrop contract matches .ml-bd (§12).
// ─────────────────────────────────────────────────────────────────────────────

export const AUTH_CSS = `
/* ═══ Backdrop — bottom-aligned on mobile, centered ≥720px ═══════════════ */
.va-bd{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,10,10,.82);animation:va-fade .3s ease both}
@media(min-width:720px){.va-bd{align-items:center;padding:20px}}
@keyframes va-fade{from{opacity:0}to{opacity:1}}

/* ═══ Panel ══════════════════════════════════════════════════════════════ */
.va-sheet{position:relative;width:100%;max-width:460px;max-height:94svh;overflow-y:auto;scrollbar-width:none;background:var(--v-bg-raise);border:1px solid var(--v-line);border-radius:var(--v-radius);color:var(--v-ink);font-family:var(--v-font-body);animation:va-rise .5s cubic-bezier(.16,1,.3,1) both}
.va-sheet::-webkit-scrollbar{display:none}
@keyframes va-rise{from{transform:translateY(28px)}to{transform:translateY(0)}}
.va-handle{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:38px;height:2px;background:rgba(244,243,240,.4);z-index:2}
@media(min-width:720px){.va-handle{display:none}}

/* ═══ Index header — "01 — SIGN IN" ══════════════════════════════════════ */
.va-head{display:flex;align-items:center;justify-content:space-between;gap:var(--v-s4);padding:var(--v-s5) var(--v-s5) var(--v-s4);border-bottom:1px solid var(--v-line)}
.va-idx{font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-mut)}
.va-idx b{font-weight:400;color:var(--v-accent)}
.va-x{width:34px;height:34px;flex:none;border-radius:999px;background:transparent;border:1px solid var(--v-line);color:var(--v-ink);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .3s ease,color .3s ease}
.va-x:hover{border-color:var(--v-accent);color:var(--v-accent)}

/* ═══ Body ═══════════════════════════════════════════════════════════════ */
.va-body{padding:var(--v-s5) var(--v-s5) calc(var(--v-s5) + env(safe-area-inset-bottom))}
@media(min-width:720px){.va-body{padding:var(--v-s5)}}
.va-sub{margin:0 0 var(--v-s5);font-size:var(--v-t-small);line-height:1.55;color:var(--v-mut)}
.va-sent{margin:0 0 var(--v-s4);font-size:var(--v-t-small);line-height:1.55;color:var(--v-mut);overflow-wrap:anywhere}

/* Google button — outlined CTA, hover → accent (per .ml-cta-o) */
.va-google{display:flex;width:100%;align-items:center;justify-content:center;gap:10px;cursor:pointer;background:transparent;color:var(--v-ink);padding:15px 25px;border:1px solid var(--v-line);border-radius:var(--v-radius);font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;transition:border-color .3s ease,color .3s ease}
.va-google:hover{border-color:var(--v-accent);color:var(--v-accent)}
.va-google:disabled{opacity:.45;cursor:default}

/* OR divider — hairlines either side */
.va-div{display:flex;align-items:center;gap:var(--v-s3);margin-block:var(--v-s5);font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint)}
.va-div::before,.va-div::after{content:"";flex:1;height:1px;background:var(--v-line)}

/* Mono micro-label + hairline input (per .ml-in) */
.va-lab{display:block;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);margin-bottom:var(--v-s2)}
.va-in{width:100%;background:transparent;border:0;border-bottom:1px solid var(--v-line);border-radius:0;color:var(--v-ink);font-family:var(--v-font-body);font-size:1rem;padding:12px 2px;outline:none;transition:border-color .3s ease;-webkit-appearance:none;appearance:none}
.va-in::placeholder{font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--v-faint)}
.va-in:focus{border-bottom-color:var(--v-accent)}

/* 6-digit OTP — mono, tabular-nums */
.va-otp{font-family:var(--v-font-mono);font-variant-numeric:tabular-nums;font-size:1.7rem;letter-spacing:.55em;text-align:center;padding:14px 0 14px .55em}
.va-otp::placeholder{font-size:1.7rem;letter-spacing:.55em;color:var(--v-faint)}

/* Accent submit CTA (per .ml-cta) */
.va-cta{display:flex;width:100%;align-items:center;justify-content:center;gap:10px;cursor:pointer;margin-top:var(--v-s5);background:var(--v-accent);color:var(--v-accent-ink);padding:16px 26px;border:0;border-radius:var(--v-radius);font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;transition:transform .12s ease,background .12s ease,color .12s ease}
.va-cta:active{transform:scale(.97)}
.va-cta:disabled{opacity:.45;cursor:default}

/* Resend / change-email mono links */
.va-meta{display:flex;justify-content:space-between;gap:var(--v-s4);margin-top:var(--v-s4)}
.va-link{background:none;border:0;padding:0;cursor:pointer;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-mut);transition:color .3s ease}
.va-link:hover{color:var(--v-accent)}
.va-link:disabled{opacity:.45;cursor:default}

/* Status lines — waitlist error/success colors */
.va-err{margin:var(--v-s3) 0 0;font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:#f87171}
.va-ok{margin:var(--v-s3) 0 0;font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:#34d399}
.va-note{margin:var(--v-s5) 0 0;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);line-height:1.7}

/* Spinner — hairline ring, accent head */
.va-spin{display:inline-block;width:12px;height:12px;flex:none;border:1px solid currentColor;border-top-color:var(--v-accent);border-radius:999px;animation:va-rot .7s linear infinite}
@keyframes va-rot{to{transform:rotate(360deg)}}

/* ═══ Standalone stage (sign-in / sign-up / sso-callback routes) ═════════ */
.va-page{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--v-s5);background:var(--v-bg);padding:var(--v-pad) var(--v-pad) calc(var(--v-pad) + env(safe-area-inset-bottom))}
.va-page .va-sheet{animation:none;max-height:none}
.va-back{font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);text-decoration:none;transition:color .3s ease}
.va-back:hover{color:var(--v-accent)}
.va-wait{display:flex;align-items:center;gap:10px;font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--v-mut)}

/* ═══ Reduced-motion guards ══════════════════════════════════════════════ */
@media(prefers-reduced-motion:reduce){
  .va-bd,.va-sheet{animation:none}
  .va-cta:active{transform:none}
  .va-spin{animation-duration:1.6s}
}
`;

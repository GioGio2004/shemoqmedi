// "use client";

// import { useRef, useEffect } from "react";
// import Image from "next/image";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { Application, SPEObject } from "@splinetool/runtime";

// gsap.registerPlugin(ScrollTrigger);

// /**
//  * Gallery panel data — retro cafe & hospitality interiors.
//  * Using next/image for automatic optimization (lazy loading, WebP).
//  */
// const GALLERY_PANELS = [
//   {
//     src: "/gallery/01-retro-cafe.png",
//     alt: "Moody retro cafe interior with Edison bulb lighting",
//     width: "w-[85vw] md:w-[55vw]",
//     title: "The Atmosphere.",
//     subtitle: "Where handcrafted hardware meets soulful spaces.",
//     objectPosition: "object-center",
//   },
//   {
//     src: "/gallery/02-espresso-detail.png",
//     alt: "Vintage espresso counter with ceramic cups",
//     width: "w-[75vw] md:w-[35vw]",
//     title: "Every Detail.",
//     subtitle: "Precision in every pour, every tap.",
//     objectPosition: "object-center",
//   },
//   {
//     src: "/gallery/03-hotel-lobby.png",
//     alt: "Luxurious retro hotel lobby with velvet armchairs",
//     width: "w-[90vw] md:w-[65vw]",
//     title: "Grand Hospitality.",
//     subtitle: "Lobbies that leave lasting impressions.",
//     objectPosition: "object-center",
//   },
//   {
//     src: "/gallery/04-retro-bar.png",
//     alt: "Dark retro cocktail bar with Art Deco elements",
//     width: "w-[80vw] md:w-[40vw]",
//     title: "After Hours.",
//     subtitle: "Where conversations begin with a single tap.",
//     objectPosition: "object-center",
//   },
//   {
//     src: "/gallery/05-cafe-terrace.png",
//     alt: "European cafe terrace at golden hour",
//     width: "w-[85vw] md:w-[50vw]",
//     title: "Al Fresco.",
//     subtitle: "Technology that disappears into the experience.",
//     objectPosition: "object-bottom",
//   },
//   {
//     src: "/gallery/06-vintage-restaurant.png",
//     alt: "Upscale vintage restaurant with candlelight",
//     width: "w-[80vw] md:w-[45vw]",
//     title: "Fine Dining.",
//     subtitle: "Seamless service, zero friction.",
//     objectPosition: "object-center",
//   },
//   {
//     src: "/gallery/01-retro-cafe.png",
//     alt: "Retro cafe interior panoramic view",
//     width: "w-[90vw] md:w-[70vw]",
//     title: "The Vision.",
//     subtitle: "Physical craft. Digital soul. The Voloo way.",
//     objectPosition: "object-top",
//   },
// ];

// /**
//  * CHIP_SCALE — the uniform scale multiplier applied to the chip on load.
//  * Exported so NfcScrollyTelling can use the same value.
//  */
// export const CHIP_SCALE = 1.25;

// /**
//  * HorizontalGallery — Client Component
//  *
//  * Layer 4/5 (z-10): Horizontal-scrolling image gallery pinned to the viewport.
//  * The gallery's ScrollTrigger trigger element (#hardware) is the shared anchor
//  * that the 3D chip rotation timeline also binds to — ensuring flawless sync.
//  *
//  * The gallery uses pin: true with a dynamic end based on the slider's total
//  * scroll width, giving the 3D timeline the exact same scroll distance.
//  */

// interface HorizontalGalleryProps {
//   /** Spline app ref — passed down so we can create the 3D rotation timeline
//    *  on the SAME trigger/start/end as the gallery scroll. */
//   splineApp: Application | null;
//   /** The captured chip object ref */
//   chipRef: SPEObject | null;
// }

// export default function HorizontalGallery({
//   splineApp,
//   chipRef,
// }: HorizontalGalleryProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const sliderRef = useRef<HTMLDivElement>(null);

//   /* ── Combined 2D Gallery + 3D Chip Rotation Timeline ── */
//   useEffect(() => {
//     const slider = sliderRef.current;
//     const container = containerRef.current;
//     if (!slider || !container) return;

//     const panels = gsap.utils.toArray<HTMLElement>(".gallery-panel");
//     if (panels.length === 0) return;

//     const getScrollAmount = () => -(slider.scrollWidth - window.innerWidth);
//     const getEndValue = () => `+=${slider.scrollWidth - window.innerWidth}`;

//     const ctx = gsap.context(() => {
//       // ── 2D: Horizontal gallery slide ──
//       gsap.to(panels, {
//         x: getScrollAmount,
//         ease: "none",
//         scrollTrigger: {
//           trigger: container,
//           pin: true,
//           scrub: 2, // Premium heavy easing — matches 3D chip
//           end: getEndValue,
//           invalidateOnRefresh: true,
//         },
//       });

//       // ── 3D: Chip anchored rotation (ONLY if Spline has loaded) ──
//       // Shares the EXACT same trigger, start, end, and scrub as the gallery.
//       if (chipRef && splineApp) {
//         // Snapshot the chip's current rotation as our starting point
//         const startRotY = chipRef.rotation.y;
//         const startRotZ = chipRef.rotation.z;

//         gsap.timeline({
//           scrollTrigger: {
//             trigger: container,          // Same trigger
//             start: "top top",            // Same start
//             end: getEndValue,            // Same end
//             scrub: 2,                    // Same scrub weight
//             invalidateOnRefresh: true,
//           },
//         })
//           // Slow elegant tumble on Y axis — 1.5 full rotations across entire gallery
//           .to(
//             chipRef.rotation,
//             {
//               y: startRotY + Math.PI * 3,
//               duration: 1,
//               ease: "none",
//             },
//             0
//           )
//           // Subtle Z-axis tilt for a premium tumble feel
//           .to(
//             chipRef.rotation,
//             {
//               z: startRotZ + Math.PI * 0.5,
//               duration: 1,
//               ease: "power1.inOut",
//             },
//             0
//           );
//       }
//     });

//     return () => ctx.revert();
//   }, [splineApp, chipRef]);

//   return (
//     <section
//       ref={containerRef}
//       id="hardware"
//       className="relative h-screen w-full overflow-hidden bg-transparent z-10"
//     >
//       {/* Section header */}
//       <div className="absolute top-10 left-12 z-20 pointer-events-none">
//         <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 font-light">
//           Gallery
//         </p>
//       </div>

//       <div
//         ref={sliderRef}
//         className="flex h-full w-max flex-nowrap items-center px-12 gap-6"
//       >
//         {GALLERY_PANELS.map((panel, i) => (
//           <div
//             key={`panel-${i}`}
//             className={`gallery-panel relative h-[70vh] ${panel.width} shrink-0
//                         border border-white/[0.07] rounded-2xl overflow-hidden
//                         group shadow-xl ${i === GALLERY_PANELS.length - 1 ? "mr-12" : ""}`}
//           >
//             <Image
//               src={panel.src}
//               alt={panel.alt}
//               fill
//               sizes="(max-width: 768px) 90vw, 60vw"
//               className={`object-cover ${panel.objectPosition}
//                          grayscale opacity-50
//                          group-hover:grayscale-0 group-hover:opacity-90
//                          transition-all duration-700 ease-out`}
//               priority={i < 2}
//               quality={75}
//             />

//             {/* Gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

//             {/* Text */}
//             <div className="absolute bottom-8 left-8 right-8 z-20 pointer-events-none">
//               <h2 className="text-3xl md:text-4xl font-extralight tracking-tight text-white mb-1.5 leading-[1.15]">
//                 {panel.title}
//               </h2>
//               <p className="text-white/40 font-light text-sm">
//                 {panel.subtitle}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

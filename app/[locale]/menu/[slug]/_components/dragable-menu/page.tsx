// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// const menuData = {
//   coffee: [
//     { id: "c1", name: "Obsidian Espresso", price: "7 ₾", desc: "Darkest, intense single-origin roast." },
//     { id: "c2", name: "Cortado", price: "9 ₾", desc: "Equal parts espresso and steamed milk." },
//     { id: "c3", name: "Pour Over", price: "12 ₾", desc: "Ethiopian Yirgacheffe, floral notes." },
//     { id: "c4", name: "Cold Brew", price: "10 ₾", desc: "Steeped for 18 hours, served over ice." },
//   ],
//   mains: [
//     { id: "m1", name: "Cadillac Burger", price: "28 ₾", desc: "Double smashed patties, secret sauce." },
//     { id: "m2", name: "Spicy Tuna Bao", price: "22 ₾", desc: "Crispy tuna, gochujang mayo, cilantro." },
//     { id: "m3", name: "Truffle Fries", price: "15 ₾", desc: "Parmesan, white truffle oil, parsley." },
//   ],
//   desserts: [
//     { id: "d1", name: "Cherry Diner Pie", price: "16 ₾", desc: "Warm crust, vanilla bean ice cream." },
//     { id: "d2", name: "Matcha Tiramisu", price: "18 ₾", desc: "Kyoto matcha, mascarpone, ladyfingers." },
//   ],
//   cocktails: [
//     { id: "k1", name: "Classic Negroni", price: "25 ₾", desc: "Gin, Campari, Sweet Vermouth." },
//     { id: "k2", name: "Espresso Martini", price: "24 ₾", desc: "Vodka, fresh espresso, coffee liqueur." },
//   ],
// };

// const quadrants = [
//   { id: "q00", title: "Espresso Bar", num: "01", items: menuData.coffee, gridX: 0, gridY: 0 },
//   { id: "q10", title: "Kitchen", num: "02", items: menuData.mains, gridX: 1, gridY: 0 },
//   { id: "q01", title: "Pastries", num: "03", items: menuData.desserts, gridX: 0, gridY: 1 },
//   { id: "q11", title: "Spirits", num: "04", items: menuData.cocktails, gridX: 1, gridY: 1 },
// ];

// export default function SnapGrid({ fontHeader }: { fontHeader?: string }) {
//   const [winSize, setWinSize] = useState({ w: 1000, h: 1000 });
//   const [activeQuad, setActiveQuad] = useState("q00");

//   useEffect(() => {
//     const updateSize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
//     updateSize();
//     window.addEventListener("resize", updateSize);
//     return () => window.removeEventListener("resize", updateSize);
//   }, []);

//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // Parallax transforms for the backgrounds
//   const bgX = useTransform(x, [-winSize.w, 0], ["-10%", "0%"]);
//   const bgY = useTransform(y, [-winSize.h, 0], ["-10%", "0%"]);

//   const handleDragEnd = (event: any, info: any) => {
//     // Determine target snap points based on momentum
//     const targetX = info.offset.x + info.velocity.x * 0.2;
//     const targetY = info.offset.y + info.velocity.y * 0.2;

//     const snapX = Math.round(targetX / winSize.w) * winSize.w;
//     const snapY = Math.round(targetY / winSize.h) * winSize.h;

//     // Clamp to our 2x2 grid (0 or -winSize)
//     const finalX = Math.max(-winSize.w, Math.min(0, snapX));
//     const finalY = Math.max(-winSize.h, Math.min(0, snapY));

//     // Animate smoothly to the snapped position
//     animate(x, finalX, { type: "spring", stiffness: 150, damping: 20, mass: 0.8 });
//     animate(y, finalY, { type: "spring", stiffness: 150, damping: 20, mass: 0.8 });

//     // Update active quadrant for staggered reveals
//     const gridX = Math.abs(finalX / winSize.w);
//     const gridY = Math.abs(finalY / winSize.h);
//     setActiveQuad(`q${gridX}${gridY}`);
//   };

//   return (
//     <div className="w-screen h-screen overflow-hidden bg-[#0F172A] text-[#F5F5DC] relative">

//       {/* Deep Spatial Background Layer */}
//       <motion.div
//         className="absolute inset-0 z-0 pointer-events-none opacity-20"
//         style={{ x: bgX, y: bgY }}
//       >
//         <div className="w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
//       </motion.div>

//       {/* Navigation Overlay */}
//       <div className="fixed top-6 left-6 z-50 pointer-events-none mix-blend-difference text-white">
//         <h1 className={`${fontHeader} text-2xl tracking-[0.2em] uppercase`}>Noir Cafe</h1>
//         <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Drag canvas to navigate</p>
//       </div>

//       {/* Interactive 2D Canvas */}
//       <motion.div
//         className="w-[200vw] h-[200vh] grid grid-cols-2 grid-rows-2 relative z-10"
//         style={{ x, y }}
//         drag
//         dragElastic={0.1}
//         dragMomentum={false}
//         onDragEnd={handleDragEnd}
//         // Constraint boxes to prevent wild dragging outside the 2x2 grid
//         dragConstraints={{
//           top: -winSize.h,
//           bottom: 0,
//           left: -winSize.w,
//           right: 0,
//         }}
//       >
//         {quadrants.map((quad) => (
//           <div
//             key={quad.id}
//             className={`w-screen h-screen flex flex-col p-6 pt-24 pb-12 relative ${
//               quad.gridX === 0 ? "border-r border-white/10" : ""
//             } ${quad.gridY === 0 ? "border-b border-white/10" : ""}`}
//           >
//             {/* Parallax Quadrant Number */}
//             <motion.h2
//               className={`${fontHeader} text-[15vw] text-white/[0.03] absolute top-10 right-10 pointer-events-none select-none`}
//               style={{ x: useTransform(x, v => v * -0.1), y: useTransform(y, v => v * -0.1) }}
//             >
//               {quad.num}
//             </motion.h2>

//             <h3 className={`${fontHeader} text-4xl mb-8 text-[#E8A343] pointer-events-none`}>
//               {quad.title}
//             </h3>

//             {/* Scrollable Items Container - Stops propagation so scrolling works! */}
//             <div
//               className="flex-1 overflow-y-auto hide-scrollbar pr-2 pb-20 cursor-ns-resize md:cursor-auto"
//               onPointerDown={(e) => e.stopPropagation()}
//               onTouchStart={(e) => e.stopPropagation()}
//             >
//               <div className="space-y-6">
//                 {quad.items.map((item, i) => (
//                   <ItemCard
//                     key={item.id}
//                     item={item}
//                     fontHeader={fontHeader}
//                     index={i}
//                     isActive={activeQuad === quad.id}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}
//       </motion.div>
//     </div>
//   );
// }

// function ItemCard({ item, fontHeader, index, isActive }: { item: any; fontHeader?: string; index: number; isActive: boolean }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
//       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
//       className="flex flex-col border-b border-white/10 pb-4"
//     >
//       <div className="flex justify-between items-baseline mb-2">
//         <h4 className={`${fontHeader} text-xl`}>{item.name}</h4>
//         <span className={`${fontHeader} text-[#E8A343] whitespace-nowrap ml-4`}>{item.price}</span>
//       </div>
//       <p className="text-sm opacity-70 mb-4 leading-relaxed">{item.desc}</p>
//       <div className="flex justify-between items-center">
//         <button className="text-xs border-b border-white/50 pb-0.5 hover:text-white transition-colors">
//           ask AI
//         </button>
//         <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-xs font-bold transition-colors active:scale-95">
//           ADD+
//         </button>
//       </div>
//     </motion.div>
//   );
// }

import SpatialSnapGrid from "./_components/SpatialSnapGrid";

// Dynamic import prevents SSR issues with useMotionValue / window measurements

export default function Home() {
  return <SpatialSnapGrid data={undefined} slug={""} />;
}

// "use client";

// interface SplineBackgroundProps {
//   sceneUrl: string;
// }

// export default function SplineBackground({ sceneUrl }: SplineBackgroundProps) {
//   return (
//     <div
//       id="spline-background"
//       className="fixed inset-0 w-full h-dvh -z-10 pointer-events-none bg-black"
//     >
//       {/*
//         Removed <Spline /> to prevent WebGL context loss and ensure strictly
//         only ONE <Spline /> component renders in the app.
//         The interactive Spline scene is now solely handled by NfcScrollyTelling.
//       */}
//       <div
//         className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"
//         aria-hidden="true"
//       />
//     </div>
//   );
// }

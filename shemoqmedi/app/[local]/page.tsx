import Link from "next/link";
import { Hammer, Sparkles, ArrowRight } from "lucide-react";

// NOTE: Since your folder structure is [local]/(temlates)/beauty
// You need to pass the current locale to links. 
// If this page is inside app/[local]/page.tsx, you can get params.
export default function HomePage({ params }: { params: { local: string } }) {
  // Fallback if params.local isn't available (e.g. if placed in root)
  const currentLang = params?.local || "en"; 

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#f0f4f8]">
      
      {/* --- BACKGROUND BLOBS (The "Cool BG") --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-300/40 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />

      {/* --- CONTENT WRAPPER --- */}
      <div className="z-10 w-full max-w-5xl px-6 flex flex-col items-center gap-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Path</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto bg-white/30 backdrop-blur-md py-2 px-6 rounded-full border border-white/40 shadow-sm">
            Select a template to begin building your website.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* BEAUTY CARD */}
          <Link 
            href={`/${currentLang}/beauty`}
            className="group relative h-[400px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-3xl transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1" />
            
            <div className="relative h-full w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group-hover:bg-white/60 group-hover:shadow-2xl group-hover:shadow-pink-200/50">
              
              {/* Icon & Title */}
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-300/50 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Beauty</h2>
                <p className="text-slate-600 font-medium">Salons, Spas & Cosmetics</p>
              </div>

              {/* Description & Action */}
              <div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Elegant aesthetics designed to showcase portfolios, services, and booking options with style.
                </p>
                <div className="flex items-center gap-2 text-pink-600 font-bold group-hover:gap-4 transition-all">
                  View Template <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* CONSTRUCTION CARD */}
          <Link 
            href={`/${currentLang}/construction`}
            className="group relative h-[400px] w-full"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-3xl transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:-rotate-1" />
            
            <div className="relative h-full w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group-hover:bg-white/60 group-hover:shadow-2xl group-hover:shadow-blue-200/50">
              
              {/* Icon & Title */}
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-300/50 group-hover:scale-110 transition-transform duration-300">
                  <Hammer className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Construction</h2>
                <p className="text-slate-600 font-medium">Builders, Architects & Trades</p>
              </div>

              {/* Description & Action */}
              <div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Robust and reliable layouts focused on project galleries, service listings, and client trust.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                  View Template <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
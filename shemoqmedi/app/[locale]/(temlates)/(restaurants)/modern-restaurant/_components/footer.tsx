"use client";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-white tracking-widest mb-2">NEBULA</h3>
            <p className="text-zinc-600 text-xs uppercase tracking-widest">
                Molecular Gastronomy • Est. 2077
            </p>
        </div>

        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Neural Net</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">System Status</a>
        </div>

        <div className="text-zinc-700 text-[10px] font-mono">
            V 2.0.4 • BUILD 8839
        </div>

      </div>
    </footer>
  );
}

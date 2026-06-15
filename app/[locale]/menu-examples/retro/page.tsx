import { Fraunces, DM_Sans } from "next/font/google";
import MenuItems, { menuItems } from "./_components/MenuItems";
import CategorieSlider from "./_components/CategorieSlider";
import CafeHero from "./_components/CafeHero";
import Navbar from "./_components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RetroMenuPage() {
  const firstRow = menuItems.slice(0, 4);
  const secondRow = menuItems.slice(4, 8);

  return (
    <main
      className={`min-h-screen bg-black text-[#F5F5DC] pb-24 ${dmSans.className}`}
    >
      <Navbar fontHeader={fraunces.className} />
      {/* Cafe photo + Welcome banner */}
      <CafeHero fontHeader={fraunces.className} />

      {/* Menu Section */}
      <section 
        className="relative overflow-hidden bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/retro-backgrounds/retro-main-bg.jpg')" }}
      >
        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10 px-4 pt-8 space-y-6">
          <header>
            <h2
              className={`${dmSans.className} text-xl tracking-widest text-[#F5F5DC] uppercase`}
            >
              Recomendations
            </h2>
          </header>

          {/* First row of the menu grid */}
          <section>
            <MenuItems items={firstRow} fontHeader={fraunces.className} />
          </section>

          {/* Category pills sit between the rows */}
          <CategorieSlider fontHeader={fraunces.className} />

          {/* Second row of the menu grid */}
          <section className="pb-6">
            <MenuItems items={secondRow} fontHeader={fraunces.className} />
          </section>
        </div>
      </section>
    </main>
  );
}

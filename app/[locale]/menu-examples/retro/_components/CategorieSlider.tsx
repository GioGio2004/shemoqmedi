import React from "react";

const categories = [
  {
    id: "coffee",
    name: "coffee",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "dessert",
    name: "dessert",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "cocktail",
    name: "cocktail",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "mains",
    name: "Mains",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200&auto=format&fit=crop",
  },
];

export default function CategorieSlider({
  fontHeader,
}: {
  fontHeader?: string;
}) {
  return (
    <div className="w-full overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-3 w-max px-2 mx-auto md:w-full md:justify-center">
        {categories.map((cat) => {
          const isMains = cat.id === "mains";
          return (
            <button
              key={cat.id}
              className="relative w-28 h-12 md:w-32 md:h-14 rounded-full overflow-hidden border-2 border-white/60 shadow-lg shrink-0 group active:scale-95 transition-transform flex items-center justify-center"
            >
              {/* Background Image filling the pill */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500"
              />

              {/* Dark overlay to ensure text contrast */}
              <div className="absolute inset-0 bg-black/20 z-10"></div>

              {/* Centered Text Overlay */}
              <span
                className={`relative z-20 ${fontHeader} text-2xl md:text-3xl tracking-wide ${
                  isMains
                    ? "text-white drop-shadow-md"
                    : "text-transparent [-webkit-text-stroke:1.5px_#5c4033]"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

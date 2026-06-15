import React from "react";

// Full menu list — swap images/text for the real cafe data later.
// NOTE: items 5-8 are placeholder Unsplash photos, double check before shipping.
export const menuItems = [
  {
    id: "1",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1574315042788-75782c5f0a35?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1519984388953-d24061a8ebec?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "7",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "8",
    name: "Cadillac Cheeseburger",
    description:
      "A towering classic. Two smashed beef patties, melty American cheese, house pickles, and our secret...",
    price: "28 ₾",
    image:
      "https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=800&auto=format&fit=crop",
  },
];

export default function MenuItems({
  items = menuItems,
  fontHeader,
}: {
  items?: typeof menuItems;
  fontHeader: string;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => {
        // Cycle through the 3 background images
        const bgIndex = (index % 3) + 1;

        return (
          <article
            key={item.id}
            className="relative flex flex-col rounded-[25px] overflow-hidden shadow-xl aspect-[283/312]"
          >
            {/* The full card background image */}
            <img
              src={`/retro-backgrounds/retrobg-${bgIndex}.jpg`}
              alt="Retro Background"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Top: The Food Image */}
            <div className="relative z-10 w-full h-[62%]">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom: Text Content */}
            <div className="relative z-10 px-3 pt-3 flex flex-col flex-1 justify-start">
              <div className="flex justify-between items-start gap-1 mb-1">
                <h3 className="text-sm md:text-[15px] font-bold text-white leading-tight">
                  {item.name}
                </h3>
                <span className="text-base md:text-lg font-medium text-white whitespace-nowrap">
                  {item.price}
                </span>
              </div>

              <p className="text-[10px] md:text-[11px] font-medium text-white/90 leading-tight line-clamp-3 pr-10">
                {item.description}
              </p>
            </div>

            {/* Absolute ADD+ Button */}
            <button className="absolute bottom-0 right-0 z-20 w-[86px] h-[37px] bg-[#E8CE91] text-[#6A2B2B] font-bold text-sm rounded-tl-[18.5px] rounded-br-[25px] hover:bg-[#d8be81] transition-colors flex items-center justify-center">
              ADD+
            </button>
          </article>
        );
      })}
    </div>
  );
}

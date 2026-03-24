
export interface Creation {
  id: string;
  image: string;
  href: string; // link to case study or external site if needed
  color: string; // accent color like in portfolio-gallery
}

export const creations: Creation[] = [
  {
    id: "project-1",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", // Business/Tech
    href: "#",
    color: "text-blue-500",
  },
  {
    id: "project-2",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop", // Meeting/Collab
    href: "#",
    color: "text-purple-500",
  },
  {
    id: "project-3",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2670&auto=format&fit=crop", // Design/Creative
    href: "#",
    color: "text-pink-500",
  },
   {
    id: "project-4",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop", // Team
    href: "#",
    color: "text-orange-500",
  },
];

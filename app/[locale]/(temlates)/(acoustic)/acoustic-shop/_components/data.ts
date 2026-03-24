export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "guitar" | "flute" | "piano" | "drums";
  rating: number;
}

export const CATEGORIES = [
  { id: "all", label: "All Instruments", icon: "🎵" },
  { id: "guitar", label: "Acoustic Guitars", icon: "🎸" },
  { id: "flute", label: "Flutes & Winds", icon: "🥢" },
  { id: "piano", label: "Pianos & Keys", icon: "🎹" },
  { id: "drums", label: "Drum Sets", icon: "🥁" },
];

export const PRODUCTS: Product[] = [
  // --- 15 GUITARS ---
  {
    id: 1,
    name: "Martin D-28",
    description: "The dreadnought by which all others are judged.",
    price: 3199,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=800",
  },
  {
    id: 2,
    name: "Taylor 814ce",
    description: "Grand Auditorium balance and warmth.",
    price: 3499,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800",
  },
  {
    id: 3,
    name: "Gibson Hummingbird",
    description: "Vintage cherry sunburst classic.",
    price: 3899,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?q=80&w=800",
  },
  {
    id: 4,
    name: "Yamaha FG800",
    description: "Solid top value acoustic.",
    price: 1099,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800",
  },
  {
    id: 5,
    name: "Fender CD-60S",
    description: "Entry-level dreadnought.",
    price: 229,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?q=80&w=800",
  },
  {
    id: 6,
    name: "Seagull S6 Original",
    description: "Handcrafted Canadian beauty.",
    price: 549,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1485278537138-4e8911a13c02?q=80&w=800",
  },
  {
    id: 7,
    name: "Takamine GD20",
    description: "Cedar top warmth.",
    price: 349,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1605020420620-20c943cc4669?q=80&w=800",
  },
  {
    id: 8,
    name: "Epiphone Dove",
    description: "Studio ready with Fishman electronics.",
    price: 459,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800",
  },
  {
    id: 9,
    name: "Guild D-55",
    description: "Antique burst flagship.",
    price: 3899,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1558098329-a11cff621064?q=80&w=800",
  },
  {
    id: 10,
    name: "Ibanez Artwood",
    description: "Modern playability meets tradition.",
    price: 429,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1696245843980-79b69e076ffa?q=80&w=800",
  },
  {
    id: 11,
    name: "Cordoba C7",
    description: "Nylon string classical.",
    price: 549,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1697822529360-fe3699da8dfe?q=80&w=800",
  },
  {
    id: 12,
    name: "Gretsch Rancher",
    description: "Triangular soundhole uniqueness.",
    price: 499,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=800",
  },
  {
    id: 13,
    name: "Breedlove Pursuit",
    description: "Eco-friendly distinctive sound.",
    price: 649,
    category: "guitar",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1565551671227-cf98405a8065?q=80&w=800",
  },
  {
    id: 14,
    name: "Ovation Applause",
    description: "Composite roundback projection.",
    price: 299,
    category: "guitar",
    rating: 3,
    image:
      "https://images.unsplash.com/photo-1736363375585-3589a77343ad?q=80&w=800",
  },
  {
    id: 15,
    name: "Collings D2H",
    description: "Boutique craftsmanship perfected.",
    price: 5400,
    category: "guitar",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1650029906594-f2d782bc4e03?q=80&w=800",
  },

  // --- 10 FLUTES ---
  {
    id: 16,
    name: "Yamaha YFL-222",
    description: "Student standard flute.",
    price: 599,
    category: "flute",
    rating: 5,
    // Woman playing flute - Nate C (was wrongly pointing to drum set)
    image:
      "data:image/jpeg;base64,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",
  },
  {
    id: 17,
    name: "Pearl Quantz",
    description: "French pointed arms.",
    price: 999,
    category: "flute",
    rating: 4,
    // Flute player at live concert - Markus Spiske (was wrongly pointing to drum set)
    image:
      "https://kesslerandsons.com/wp-content/uploads/2018/02/pearl-pfb665rbecd-18khj-package.jpg",
  },
  {
    id: 18,
    name: "Azumi AZ2",
    description: "Professional silver headjoint.",
    price: 1499,
    category: "flute",
    rating: 5,
    image:
      "https://kesslerandsons.com/wp-content/uploads/2015/11/azumi-az2-rbeo-flute.jpg",
  },
  {
    id: 19,
    name: "Gemeinhardt 2SP",
    description: "Classic student model.",
    price: 449,
    category: "flute",
    rating: 4,
    image:
      "https://www.falcettimusic.com/band-instruments/flutes/images/gemeinhardt-2sp/2sp_flute_Gemeinhardt_stu_2.jpg",
  },
  {
    id: 20,
    name: "Trevor James 10X",
    description: "Award winning starter.",
    price: 550,
    category: "flute",
    rating: 4,
    image: "https://www.howarthlondon.com/content/uploads/2023/09/TJ%2010X.jpg",
  },
  {
    id: 21,
    name: "Di Zhao DZ-200",
    description: "Hand-cut headjoint.",
    price: 750,
    category: "flute",
    rating: 5,
    image:
      "https://res.cloudinary.com/flute-specialists-inc/images/f_auto,q_auto/v1683218128/di_zhao_alto_straight-1/di_zhao_alto_straight-1.jpg?_i=AA",
  },
  {
    id: 22,
    name: "Jupiter JFL710",
    description: "Plateau keys for beginners.",
    price: 620,
    category: "flute",
    rating: 4,
    image:
      "https://cdn11.bigcommerce.com/s-k2zti3v21f/images/stencil/original/products/19024/38920/LOW_0176_copy__22521.1714505831.jpg?c=1",
  },
  {
    id: 23,
    name: "Powell Sonaré",
    description: "Deep, rich tone.",
    price: 2100,
    category: "flute",
    rating: 5,
    image:
      "https://www.schmittmusic.com/cdn/shop/files/powell-sonare-505-flute.jpg?v=1718816995&width=1214",
  },
  {
    id: 24,
    name: "Altus 807",
    description: "Sterling silver lip plate.",
    price: 1800,
    category: "flute",
    rating: 5,
    image:
      "https://www.thewindsection.com/cdn/shop/files/SH02203_6_700x700.jpg?v=1761747970",
  },
  {
    id: 25,
    name: "Miyazawa PB-202",
    description: "The professional's choice.",
    price: 3500,
    category: "flute",
    rating: 5,
    image:
      "https://res.cloudinary.com/flute-specialists-inc/images/f_auto,q_auto/v1662155227/miyazawa_flutes/opt/miyazawa_202_u3gdiq_lujwmv/miyazawa_202_u3gdiq_lujwmv.jpg?_i=AA",
  },

  // --- 5 PIANOS ---
  {
    id: 26,
    name: "Steinway Model D",
    description: "The concert grand standard.",
    price: 150000,
    category: "piano",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800",
  },
  {
    id: 27,
    name: "Yamaha U1",
    description: "The world's most popular upright.",
    price: 11000,
    category: "piano",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=800",
  },
  {
    id: 28,
    name: "Kawai K-300",
    description: "Outstanding tone and touch.",
    price: 9500,
    category: "piano",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=800",
  },
  {
    id: 29,
    name: "Bösendorfer 225",
    description: "Rich, singing Viennese tone.",
    price: 110000,
    category: "piano",
    rating: 5,
    image:
      "https://www.klaviano.com/files/02-2023/ad430377/28101217-737573692_large.webp",
  },
  {
    id: 30,
    name: "Fazioli F308",
    description: "Italian masterpiece.",
    price: 180000,
    category: "piano",
    rating: 5,
    image:
      "https://www.fazioli.com/wp-content/uploads/2018/02/piano-f308-piumamogano.jpg",
  },

  // --- 10 DRUMS ---
  {
    id: 31,
    name: "Pearl Export",
    description: "Best selling drum set of all time.",
    price: 799,
    category: "drums",
    rating: 5,
    image:
      "https://sc1.musik-produktiv.com/pic-010159909l/pearl-export-20-slipstream-white-complete-drumset.jpg",
  },
  {
    id: 32,
    name: "Tama Starclassic",
    description: "Pro-level maple shells.",
    price: 2499,
    category: "drums",
    rating: 5,
    image:
      "https://www.sweelee.com.sg/cdn/shop/files/products_2FT03-ME42TZSV-MMF_2FT03-ME42TZSV-MMF_1738662341580.jpg?v=1738662350&width=2048",
  },
  {
    id: 33,
    name: "Ludwig Vistalite",
    description: "Acrylic power and projection.",
    price: 2999,
    category: "drums",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1524230659092-07f99a75c013?q=80&w=800",
  },
  {
    id: 34,
    name: "DW Collector's",
    description: "Custom California craftsmanship.",
    price: 4500,
    category: "drums",
    rating: 5,
    image:
      "https://cdn11.bigcommerce.com/s-gs0pdv/images/stencil/original/products/19902/103457/BD1465__44098.1757522172.jpg?c=2",
  },
  {
    id: 35,
    name: "Gretsch Renown",
    description: "That great Gretsch sound.",
    price: 1600,
    category: "drums",
    rating: 4,
    image:
      "https://drumcenternh.com/cdn/shop/files/IMG_7595copy-min.jpg?v=1748809995",
  },
  {
    id: 36,
    name: "Mapex Armory",
    description: "Hybrid shell innovation.",
    price: 899,
    category: "drums",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1571327073757-71d13c24de30?q=80&w=800",
  },
  {
    id: 37,
    name: "Sonor SQ1",
    description: "German engineering beech shells.",
    price: 2200,
    category: "drums",
    rating: 5,
    image:
      "https://www.sonor.com/fileadmin/_processed_/8/b/csm_SQ1-SPW_Detail1_7ceb0e92fa.jpg",
  },
  {
    id: 38,
    name: "Yamaha Stage Custom",
    description: "Birch shells at great value.",
    price: 749,
    category: "drums",
    rating: 4,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmmGCNA2fUnIiLOGMiUINLbP7oFjpUrt-VsA&s",
  },
  {
    id: 39,
    name: "Roland TD-17KVX",
    description: "Electronic V-Drums realism.",
    price: 1799,
    category: "drums",
    rating: 5,
    image:
      "https://thedrumshopmaine.com/cdn/shop/files/17KVX3_1495x.jpg?v=1693418965",
  },
  {
    id: 40,
    name: "Alesis Nitro Mesh",
    description: "Affordable electronic kit.",
    price: 379,
    category: "drums",
    rating: 4,
    image:
      "https://preview.redd.it/alesis-nitro-mesh-setup-help-v0-4eovx271awfb1.jpg?width=640&crop=smart&auto=webp&s=72c89b021ad102e3a55190eebda217c47f25c6c9",
  },
];

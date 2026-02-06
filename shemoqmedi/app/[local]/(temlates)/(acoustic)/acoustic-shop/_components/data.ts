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
    { id: 1, name: "Martin D-28", description: "The dreadnought by which all others are judged.", price: 3199, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=800" },
    { id: 2, name: "Taylor 814ce", description: "Grand Auditorium balance and warmth.", price: 3499, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800" },
    { id: 3, name: "Gibson Hummingbird", description: "Vintage cherry sunburst classic.", price: 3899, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?q=80&w=800" },
    { id: 4, name: "Yamaha FG800", description: "Solid top value acoustic.", price: 1099, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800" },
    { id: 5, name: "Fender CD-60S", description: "Entry-level dreadnought.", price: 229, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?q=80&w=800" },
    { id: 6, name: "Seagull S6 Original", description: "Handcrafted Canadian beauty.", price: 549, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1485278537138-4e8911a13c02?q=80&w=800" },
    { id: 7, name: "Takamine GD20", description: "Cedar top warmth.", price: 349, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1605020420620-20c943cc4669?q=80&w=800" },
    { id: 8, name: "Epiphone Dove", description: "Studio ready with Fishman electronics.", price: 459, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800" },
    { id: 9, name: "Guild D-55", description: "Antique burst flagship.", price: 3899, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1558098329-a11cff621064?q=80&w=800" },
    { id: 10, name: "Ibanez Artwood", description: "Modern playability meets tradition.", price: 429, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1696245843980-79b69e076ffa?q=80&w=800" },
    { id: 11, name: "Cordoba C7", description: "Nylon string classical.", price: 549, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1697822529360-fe3699da8dfe?q=80&w=800" },
    { id: 12, name: "Gretsch Rancher", description: "Triangular soundhole uniqueness.", price: 499, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=800" },
    { id: 13, name: "Breedlove Pursuit", description: "Eco-friendly distinctive sound.", price: 649, category: "guitar", rating: 4, image: "https://images.unsplash.com/photo-1565551671227-cf98405a8065?q=80&w=800" },
    { id: 14, name: "Ovation Applause", description: "Composite roundback projection.", price: 299, category: "guitar", rating: 3, image: "https://images.unsplash.com/photo-1736363375585-3589a77343ad?q=80&w=800" },
    { id: 15, name: "Collings D2H", description: "Boutique craftsmanship perfected.", price: 5400, category: "guitar", rating: 5, image: "https://images.unsplash.com/photo-1650029906594-f2d782bc4e03?q=80&w=800" },

    // --- 10 FLUTES ---
    { id: 16, name: "Yamaha YFL-222", description: "Student standard flute.", price: 599, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1557431177-36141475c676?q=80&w=800" },
    { id: 17, name: "Pearl Quantz", description: "French pointed arms.", price: 999, category: "flute", rating: 4, image: "https://images.unsplash.com/photo-1533033519567-f640ee958427?q=80&w=800" },
    { id: 18, name: "Azumi AZ2", description: "Professional silver headjoint.", price: 1499, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1515516744825-998f80693a73?q=80&w=800" },
    { id: 19, name: "Gemeinhardt 2SP", description: "Classic student model.", price: 449, category: "flute", rating: 4, image: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=800" },
    { id: 20, name: "Trevor James 10X", description: "Award winning starter.", price: 550, category: "flute", rating: 4, image: "https://images.unsplash.com/photo-1534066060010-3367f0851214?q=80&w=800" },
    { id: 21, name: "Di Zhao DZ-200", description: "Hand-cut headjoint.", price: 750, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1579976451624-9dfc12089d31?q=80&w=800" },
    { id: 22, name: "Jupiter JFL710", description: "Plateau keys for beginners.", price: 620, category: "flute", rating: 4, image: "https://images.unsplash.com/photo-1521424159246-e4a66f267e4b?q=80&w=800" },
    { id: 23, name: "Powell Sonaré", description: "Deep, rich tone.", price: 2100, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800" },
    { id: 24, name: "Altus 807", description: "Sterling silver lip plate.", price: 1800, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1542628682-88321d2a4828?q=80&w=800" },
    { id: 25, name: "Miyazawa PB-202", description: "The professional's choice.", price: 3500, category: "flute", rating: 5, image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800" },

    // --- 5 PIANOS ---
    { id: 26, name: "Steinway Model D", description: "The concert grand standard.", price: 150000, category: "piano", rating: 5, image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800" },
    { id: 27, name: "Yamaha U1", description: "The world's most popular upright.", price: 11000, category: "piano", rating: 5, image: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=800" },
    { id: 28, name: "Kawai K-300", description: "Outstanding tone and touch.", price: 9500, category: "piano", rating: 4, image: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=800" },
    { id: 29, name: "Bösendorfer 225", description: "Rich, singing Viennese tone.", price: 110000, category: "piano", rating: 5, image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800" },
    { id: 30, name: "Fazioli F308", description: "Italian masterpiece.", price: 180000, category: "piano", rating: 5, image: "https://images.unsplash.com/photo-1499946981954-e7f4b234d7fa?q=80&w=800" },

    // --- 10 DRUMS ---
    { id: 31, name: "Pearl Export", description: "Best selling drum set of all time.", price: 799, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1519892300165-cb5542fb67c7?q=80&w=800" },
    { id: 32, name: "Tama Starclassic", description: "Pro-level maple shells.", price: 2499, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1547744037-b80bdba1b6f0?q=80&w=800" },
    { id: 33, name: "Ludwig Vistalite", description: "Acrylic power and projection.", price: 2999, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1524230659092-07f99a75c013?q=80&w=800" },
    { id: 34, name: "DW Collector's", description: "Custom California craftsmanship.", price: 4500, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800" },
    { id: 35, name: "Gretsch Renown", description: "That great Gretsch sound.", price: 1600, category: "drums", rating: 4, image: "https://images.unsplash.com/photo-1543443374-b6fe10a62329?q=80&w=800" },
    { id: 36, name: "Mapex Armory", description: "Hybrid shell innovation.", price: 899, category: "drums", rating: 4, image: "https://images.unsplash.com/photo-1571327073757-71d13c24de30?q=80&w=800" },
    { id: 37, name: "Sonor SQ1", description: "German engineering beech shells.", price: 2200, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800" },
    { id: 38, name: "Yamaha Stage Custom", description: "Birch shells at great value.", price: 749, category: "drums", rating: 4, image: "https://images.unsplash.com/photo-1498489155640-023a67484407?q=80&w=800" },
    { id: 39, name: "Roland TD-17KVX", description: "Electronic V-Drums realism.", price: 1799, category: "drums", rating: 5, image: "https://images.unsplash.com/photo-1571333144161-07374661875e?q=80&w=800" },
    { id: 40, name: "Alesis Nitro Mesh", description: "Affordable electronic kit.", price: 379, category: "drums", rating: 4, image: "https://images.unsplash.com/photo-1563539864230-010534be8df0?q=80&w=800" }
];  
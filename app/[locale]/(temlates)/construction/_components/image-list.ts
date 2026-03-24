export const PRODUCTS = [
  {
    id: 1,
    name: "Baltic Birch Plywood",
    category: "Plywood",
    price: 62,
    image:
      "https://images.unsplash.com/photo-1591709990007-25dd40fa4b63?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGx5d29vZHxlbnwwfHwwfHx8MA%3D%3D",
    description:
      "Premium multi-ply birch from the Baltic region. Void-free core with superior strength-to-weight ratio. Ideal for cabinetry, furniture, and CNC projects. Each sheet is sanded on both faces for a smooth, clean finish.",
    specs: [
      { label: "Thickness", value: '3/4" (18mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Core", value: "Void-free birch" },
      { label: "Grade", value: "B/BB" },
      { label: "Plies", value: "13-ply" },
    ],
    tags: ["Furniture Grade", "CNC Ready", "Interior"],
  },
  {
    id: 2,
    name: "Marine Grade Plywood",
    category: "Plywood",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=800",
    description:
      "BS 1088 certified marine plywood built for permanent moisture exposure. Waterproof WBP phenolic glue, select face veneers, and zero voids make this the gold standard for boat building and outdoor structures.",
    specs: [
      { label: "Thickness", value: '1/2" (12mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Core", value: "Okoume / Meranti" },
      { label: "Grade", value: "BS 1088" },
      { label: "Glue", value: "WBP Phenolic" },
    ],
    tags: ["Waterproof", "Exterior", "Marine"],
  },
  {
    id: 3,
    name: "Structural MDF Board",
    category: "MDF",
    price: 38,
    image:
      "https://www.plasticsheets.com/media/catalog/product/m/d/mdf-sheet.jpg",

    description:
      "High-density medium-density fiberboard with a smooth, uniform surface on both sides. Perfect for interior millwork, shelving, and decorative paneling. Easy to paint and machine with clean edges.",
    specs: [
      { label: "Thickness", value: '3/4" (18mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Density", value: "750 kg/m\u00B3" },
      { label: "Grade", value: "Standard" },
      { label: "Surface", value: "Sanded both sides" },
    ],
    tags: ["Interior", "Paintable", "Smooth"],
  },
  {
    id: 4,
    name: "OSB/3 Structural Panel",
    category: "OSB",
    price: 28,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800",
    description:
      "Oriented strand board engineered for structural load-bearing applications. Moisture-resistant resin binder, suitable for roofing, wall sheathing, and subfloor installations. A cost-effective structural solution.",
    specs: [
      { label: "Thickness", value: '7/16" (11mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Rating", value: "Exposure 1" },
      { label: "Grade", value: "OSB/3" },
      { label: "Use", value: "Structural" },
    ],
    tags: ["Structural", "Load-bearing", "Budget"],
  },
  {
    id: 5,
    name: "Hardwood Faced Ply",
    category: "Plywood",
    price: 78,
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    description:
      "Walnut-faced decorative plywood with a stable multi-ply core. A-grade veneer face provides a rich, natural grain suitable for visible furniture surfaces, wall paneling, and architectural features.",
    specs: [
      { label: "Thickness", value: '3/4" (18mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Face", value: "American Walnut" },
      { label: "Grade", value: "A/B" },
      { label: "Core", value: "Poplar" },
    ],
    tags: ["Decorative", "Premium", "Walnut"],
  },
  {
    id: 6,
    name: "Fire Retardant Board",
    category: "Specialty",
    price: 110,
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    description:
      "Class A fire-rated plywood treated with pressure-impregnated fire retardant chemicals. Meets building code requirements for commercial and public spaces. Structural integrity maintained under fire conditions.",
    specs: [
      { label: "Thickness", value: '5/8" (15mm)' },
      { label: "Sheet Size", value: "4\' x 8\'" },
      { label: "Rating", value: "Class A" },
      { label: "Treatment", value: "Pressure treated" },
      { label: "Standard", value: "ASTM E84" },
    ],
    tags: ["Fire-rated", "Commercial", "Code-compliant"],
  },
];

export const MATERIAL_TYPES = [
  {
    id: "plywood",
    label: "MATERIAL 01",
    title: "Plywood",
    description:
      "Engineered wood made from thin layers of wood veneer glued together. Exceptional strength, stability, and versatility for construction and furniture making.",
    tags: ["Structural", "Versatile"],
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    bgColor: "bg-[#3D2B1F]",
    borderColor: "border-[#5C4A3A]",
  },
  {
    id: "mdf",
    label: "MATERIAL 02",
    title: "MDF Boards",
    description:
      "Medium-density fiberboard with a smooth, uniform surface. Perfect for interior applications where a flawless painted finish is required.",
    tags: ["Smooth", "Interior"],
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    bgColor: "bg-[#4A3728]",
    borderColor: "border-[#6B5442]",
  },
  {
    id: "osb",
    label: "MATERIAL 03",
    title: "OSB Panels",
    description:
      "Oriented strand board engineered for maximum structural performance. Cost-effective solution for sheathing, flooring, and load-bearing applications.",
    tags: ["Structural", "Economical"],
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    bgColor: "bg-[#5C4A3A]",
    borderColor: "border-[#7A6452]",
  },
  {
    id: "hardwood",
    label: "MATERIAL 04",
    title: "Hardwood Timber",
    description:
      "Select-grade hardwood lumber sourced from responsibly managed forests. Oak, walnut, maple and cherry available in various dimensions.",
    tags: ["Premium", "Solid Wood"],
    image:
      "https://wigwamply.com/wp-content/uploads/2024/10/Adding-Aesthetic-Appeal-Exploring-Plywood-Texture-Options.jpg",
    bgColor: "bg-[#2C1A0E]",
    borderColor: "border-[#4A3728]",
  },
];

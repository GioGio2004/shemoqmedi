export const INGREDIENTS = [
  // Keeping these for potential usage in other sections
  {
    id: "arabica",
    label: "SOURCE 01",
    title: "100% Arabica",
    description: "Premium beans sourced from high-altitude Ethiopian farms.",
    tags: ["Single Origin", "High Altitude"],
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1000",
    bgColor: "bg-amber-900",
    borderColor: "border-amber-800",
  },
];

export const PRODUCTS = [
  // ════════ COFFEE ════════
  {
    id: 1,
    category: "Coffee",
    name: "Obsidian Espresso",
    price: 4.5,
    image:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=1000",
    color: "bg-zinc-800",
    description:
      "A bold, intense double shot of single-origin Arabica. Features tasting notes of dark smoke, molasses, and toasted hazelnut.",
    ingredients:
      "Double shot of house-blend espresso pulled over filtered water.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 5,
      carbs: "1g",
      sugar: "0g",
      fat: "0g",
      sodium: "5mg",
      caffeine: "130mg",
      isGlutenFree: true,
    },
  },
  {
    id: 2,
    category: "Coffee",
    name: "Flat White Noise",
    price: 5.5,
    image:
      "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=1000",
    color: "bg-stone-600",
    description:
      "Micro-foam velvet poured over a dense ristretto shot. Perfectly balances the robustness of espresso with the natural sweetness of milk.",
    ingredients: "Ristretto espresso shot, heavily aerated steamed whole milk.",
    allergens: ["Lactose/Dairy"],
    nutrition: {
      calories: 120,
      carbs: "11g",
      sugar: "9g",
      fat: "6g",
      sodium: "65mg",
      caffeine: "130mg",
      isGlutenFree: true,
    },
  },
  {
    id: 3,
    category: "Coffee",
    name: "Noir Mocha",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000",
    color: "bg-orange-900",
    description:
      "A decadent, comforting blend. The richness of dark chocolate masks the harshness of the espresso.",
    ingredients:
      "Espresso, steamed milk, and 70% dark chocolate ganache topped with cocoa dust.",
    allergens: ["Lactose/Dairy", "Soy"],
    nutrition: {
      calories: 280,
      carbs: "35g",
      sugar: "25g",
      fat: "14g",
      sodium: "85mg",
      caffeine: "140mg",
      isGlutenFree: true,
    },
  },
  {
    id: 4,
    category: "Coffee",
    name: "Cold Brew Void",
    price: 6.0,
    image:
      "https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=749",
    color: "bg-blue-900",
    description:
      "Steeped in total darkness for 24 hours. Strips away acidity, leaving a phenomenally smooth, highly caffeinated cold beverage.",
    ingredients:
      "24-hour slow-steeped cold brew using single-origin beans, artisanal ice.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 10,
      carbs: "2g",
      sugar: "0g",
      fat: "0g",
      sodium: "15mg",
      caffeine: "200mg",
      isGlutenFree: true,
    },
  },
  {
    id: 13,
    category: "Coffee",
    name: "Classic Macchiato",
    price: 5.0,
    image:
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=1000",
    color: "bg-amber-800",
    description:
      "For purists who want the punch of an espresso but need just a touch of milk to soften the bite.",
    ingredients:
      "Double espresso 'marked' with a dollop of textured milk foam.",
    allergens: ["Lactose/Dairy"],
    nutrition: {
      calories: 25,
      carbs: "2g",
      sugar: "1g",
      fat: "1g",
      sodium: "10mg",
      caffeine: "130mg",
      isGlutenFree: true,
    },
  },
  {
    id: 14,
    category: "Coffee",
    name: "V60 Slow Drip",
    price: 7.0,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000",
    color: "bg-neutral-900",
    description:
      "A manual, pour-over method that creates a clean, tea-like body. Highlights the bright, fruity notes of the bean.",
    ingredients: "Hand-poured V60 filter coffee. No milk or sugar.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 5,
      carbs: "1g",
      sugar: "0g",
      fat: "0g",
      sodium: "5mg",
      caffeine: "150mg",
      isGlutenFree: true,
    },
  },

  // ════════ DRINKS ════════
  {
    id: 5,
    category: "Drinks",
    name: "Midnight Matcha",
    price: 6.75,
    image: "https://images.unsplash.com/photo-1732029543356-44fadaeeca51?w=600",
    color: "bg-emerald-900",
    description:
      "Provides a slow-release, calm energy. Earthy, slightly sweet, and incredibly rich in antioxidants.",
    ingredients:
      "Ceremonial grade Uji matcha whisked with oat milk and a touch of agave syrup.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 150,
      carbs: "18g",
      sugar: "12g",
      fat: "7g",
      sodium: "70mg",
      caffeine: "70mg",
      isGlutenFree: true,
    },
  },
  {
    id: 6,
    category: "Drinks",
    name: "Charcoal Latte",
    price: 7.0,
    image: "https://images.unsplash.com/photo-1649301846563-af560c734604?w=600",
    color: "bg-zinc-700",
    description:
      "A visually striking, gothic black drink. Tastes like a warm, comforting vanilla hug. Great for digestion.",
    ingredients:
      "Activated charcoal powder, vanilla bean syrup, and steamed almond milk.",
    allergens: ["Nuts", "Vegan"],
    nutrition: {
      calories: 130,
      carbs: "15g",
      sugar: "10g",
      fat: "5g",
      sodium: "90mg",
      caffeine: "0mg",
      isGlutenFree: true,
    },
  },
  {
    id: 7,
    category: "Drinks",
    name: "Golden Tonic",
    price: 6.0,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000",
    color: "bg-yellow-700",
    description:
      "Highly refreshing and tart. The perfect palate cleanser. Sharp citrus balanced with cooling mint.",
    ingredients:
      "Freshly squeezed lemons, sparkling mineral water, and bruised mint leaves.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 70,
      carbs: "18g",
      sugar: "15g",
      fat: "0g",
      sodium: "20mg",
      caffeine: "0mg",
      isGlutenFree: true,
    },
  },
  {
    id: 8,
    category: "Drinks",
    name: "Shadow Bramble",
    price: 6.5,
    image:
      "https://plus.unsplash.com/premium_photo-1663853489900-3f24ea776dea?w=600",
    color: "bg-purple-800",
    description:
      "A sophisticated, slightly savory mocktail. The herbal notes of sage cut through the sweet berry profile.",
    ingredients:
      "House-made blackberry shrub infused with sage, topped with tonic water.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 90,
      carbs: "22g",
      sugar: "19g",
      fat: "0g",
      sodium: "15mg",
      caffeine: "0mg",
      isGlutenFree: true,
    },
  },
  {
    id: 15,
    category: "Drinks",
    name: "Spiced Chai Fog",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?q=80&w=1000",
    color: "bg-orange-800",
    description:
      "A warming, aromatic blend of Indian spices. Sweet, spicy, and deeply comforting.",
    ingredients:
      "Spiced black tea concentrate (cinnamon, cardamom, ginger) with steamed whole milk.",
    allergens: ["Lactose/Dairy"],
    nutrition: {
      calories: 210,
      carbs: "32g",
      sugar: "28g",
      fat: "7g",
      sodium: "110mg",
      caffeine: "50mg",
      isGlutenFree: true,
    },
  },
  {
    id: 16,
    category: "Drinks",
    name: "Crimson Cooler",
    price: 8.0,
    image:
      "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1000",
    color: "bg-pink-900",
    description:
      "Vibrant, floral, and iced. The tartness of the hibiscus is perfectly balanced by the sweetness of muddled summer berries.",
    ingredients:
      "Hibiscus tea cold-shaken with fresh berries, lime juice, and botanical extracts.",
    allergens: ["Vegan"],
    nutrition: {
      calories: 60,
      carbs: "15g",
      sugar: "12g",
      fat: "0g",
      sodium: "10mg",
      caffeine: "0mg",
      isGlutenFree: true,
    },
  },

  // ════════ BAKERY ════════
  {
    id: 9,
    category: "Bakery",
    name: "Eclipse Croissant",
    price: 5.0,
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000",
    color: "bg-amber-700",
    description:
      "Crispy on the outside, impossibly airy and buttery on the inside.",
    ingredients:
      "Classic butter croissant, laminated for 72 hours. Contains wheat flour, butter, yeast, sugar, salt.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs"],
    nutrition: {
      calories: 350,
      carbs: "38g",
      sugar: "5g",
      fat: "20g",
      sodium: "320mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 11,
    category: "Bakery",
    name: "Shadow Toast",
    price: 12.0,
    image:
      "https://plus.unsplash.com/premium_photo-1677528816821-2e373e2602cb?w=600",
    color: "bg-stone-800",
    description:
      "A savory, filling breakfast option. The tang of the sourdough complements the rich avocado.",
    ingredients:
      "Thick slice of sourdough toast topped with smashed avocado, heirloom tomatoes, and microgreens.",
    allergens: ["Gluten", "Vegan"],
    nutrition: {
      calories: 420,
      carbs: "45g",
      sugar: "3g",
      fat: "22g",
      sodium: "450mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 17,
    category: "Bakery",
    name: "Almond Crescent",
    price: 6.5,
    image:
      "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?q=80&w=1000",
    color: "bg-yellow-800",
    description:
      "Sweeter and denser than a traditional croissant. The almond paste inside stays soft and warm.",
    ingredients:
      "Twice-baked almond croissant filled with frangipane, topped with sliced toasted almonds.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs", "Nuts"],
    nutrition: {
      calories: 450,
      carbs: "48g",
      sugar: "22g",
      fat: "25g",
      sodium: "280mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 18,
    category: "Bakery",
    name: "Blueberry Streusel",
    price: 4.5,
    image:
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=1000",
    color: "bg-indigo-900",
    description:
      "A soft, cake-like muffin bursting with tart berries. The crunchy cinnamon sugar top adds texture.",
    ingredients: "Spiced blueberry muffin baked with a crumbly streusel top.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs"],
    nutrition: {
      calories: 380,
      carbs: "55g",
      sugar: "30g",
      fat: "16g",
      sodium: "310mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 19,
    category: "Bakery",
    name: "Everything Bagel",
    price: 5.5,
    image:
      "https://images.unsplash.com/photo-1584913855963-e0b0229af61d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-neutral-800",
    description:
      "Dense, chewy, and loaded with savory garlic and onion flavors. A reliable breakfast staple.",
    ingredients:
      "New York style everything bagel served toasted with a generous smear of cream cheese.",
    allergens: ["Gluten", "Lactose/Dairy", "Sesame"],
    nutrition: {
      calories: 320,
      carbs: "50g",
      sugar: "4g",
      fat: "8g",
      sodium: "550mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 20,
    category: "Bakery",
    name: "Vegan Cinnamon Roll",
    price: 6.0,
    image:
      "https://images.unsplash.com/photo-1601000938259-9e92002320b2?q=80&w=1000",
    color: "bg-rose-900",
    description:
      "Gooey, warm, and highly spiced. You won't believe it has absolutely no dairy.",
    ingredients:
      "Vegan cinnamon roll baked with coconut oil, brown sugar, and a cashew-based vanilla icing.",
    allergens: ["Gluten", "Nuts", "Vegan"],
    nutrition: {
      calories: 410,
      carbs: "60g",
      sugar: "35g",
      fat: "18g",
      sodium: "290mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },

  // ════════ CAKES ════════
  {
    id: 10,
    category: "Cakes",
    name: "Basque Burnt Cake",
    price: 8.5,
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000",
    color: "bg-orange-600",
    description:
      "Intentionally scorched on top to create a slightly bitter caramel note that perfectly balances the sweet, custardy center.",
    ingredients:
      "Traditional Basque burnt cheesecake made with heavy cream, cream cheese, and sugar.",
    allergens: ["Lactose/Dairy", "Eggs", "Gluten"],
    nutrition: {
      calories: 480,
      carbs: "40g",
      sugar: "32g",
      fat: "34g",
      sodium: "380mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 12,
    category: "Cakes",
    name: "Noir Brownie",
    price: 4.75,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600",
    color: "bg-red-900",
    description:
      "Extremely dense and fudgy, not cakey. The flaky sea salt cuts through the intense dark chocolate.",
    ingredients:
      "Fudgy dark chocolate brownie made with 70% cacao and chunks of sea salt caramel.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs", "Soy"],
    nutrition: {
      calories: 390,
      carbs: "42g",
      sugar: "30g",
      fat: "22g",
      sodium: "210mg",
      caffeine: "15mg",
      isGlutenFree: false,
    },
  },
  {
    id: 21,
    category: "Cakes",
    name: "Midnight Fudge Cake",
    price: 9.0,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000",
    color: "bg-stone-900",
    description:
      "The ultimate indulgence. Three tall layers of rich, moist chocolate cake glued together by thick buttercream.",
    ingredients:
      "Decadent multi-layer chocolate fudge cake with dark chocolate buttercream frosting.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs", "Soy"],
    nutrition: {
      calories: 550,
      carbs: "65g",
      sugar: "48g",
      fat: "30g",
      sodium: "340mg",
      caffeine: "20mg",
      isGlutenFree: false,
    },
  },
  {
    id: 22,
    category: "Cakes",
    name: "Spiced Carrot Cake",
    price: 8.5,
    image:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1000",
    color: "bg-orange-700",
    description:
      "A textured, slightly savory cake featuring warm baking spices and an incredibly rich, tangy cream cheese frosting.",
    ingredients:
      "Moist carrot cake spiced with nutmeg and cinnamon, filled with walnuts, and frosted with cream cheese icing.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs", "Nuts"],
    nutrition: {
      calories: 520,
      carbs: "58g",
      sugar: "42g",
      fat: "32g",
      sodium: "410mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
  {
    id: 23,
    category: "Cakes",
    name: "Classic Tiramisu",
    price: 9.5,
    image:
      "https://images.unsplash.com/photo-1763585055859-a1fffe9cb8f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2xhc3NpYyUyMFRpcmFtaXN1fGVufDB8fDB8fHww",
    color: "bg-yellow-900",
    description:
      "An elegant, airy Italian dessert. The strong coffee flavor is softened by the lightly sweetened mascarpone cheese.",
    ingredients:
      "Espresso-soaked ladyfingers layered with rich mascarpone cream and dusted with cocoa.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs"],
    nutrition: {
      calories: 460,
      carbs: "45g",
      sugar: "28g",
      fat: "32g",
      sodium: "150mg",
      caffeine: "60mg",
      isGlutenFree: false,
    },
  },
  {
    id: 24,
    category: "Cakes",
    name: "Zesty Lemon Loaf",
    price: 7.5,
    image:
      "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?q=80&w=1000",
    color: "bg-lime-900",
    description:
      "Bright, sour, and palate-cleansing. The cake is dense and buttery, perfectly contrasting the sharp, sugary glaze.",
    ingredients:
      "Zesty lemon loaf cake topped with a sweet, tart lemon glaze and garnished with candied lemon peel.",
    allergens: ["Gluten", "Lactose/Dairy", "Eggs"],
    nutrition: {
      calories: 360,
      carbs: "52g",
      sugar: "33g",
      fat: "16g",
      sodium: "240mg",
      caffeine: "0mg",
      isGlutenFree: false,
    },
  },
];

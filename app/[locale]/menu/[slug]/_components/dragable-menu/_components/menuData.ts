export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

export interface Zone {
  id: string;
  index: number;
  col: number;
  row: number;
  title: string;
  subtitle: string;
  accentColor: string;
  items: MenuItem[];
}

export const ZONES: Zone[] = [
  {
    id: "zone-coffee",
    index: 0,
    col: 0,
    row: 0,
    title: "Espresso Bar",
    subtitle: "Roasts & Brews",
    accentColor: "#E8A343", // Mustard Gold
    items: [
      {
        id: "c1",
        name: "Obsidian Espresso",
        price: "7 ₾",
        description:
          "Our darkest, most intense single-origin roast with notes of dark chocolate.",
        image: "/menu-images/c1.jpg",
      },
      {
        id: "c2",
        name: "Velvet Cortado",
        price: "9 ₾",
        description: "Equal parts bold espresso and silky micro-foamed milk.",
        image: "/menu-images/c2.jpg",
      },
      {
        id: "c3",
        name: "Kyoto Cold Brew",
        price: "12 ₾",
        description:
          "Slow-dripped over 18 hours for a remarkably smooth, low-acid finish.",
        image: "/menu-images/c3.jpg",
      },
      {
        id: "c4",
        name: "Oat Flat White",
        price: "11 ₾",
        description: "Double ristretto poured over textured organic oat milk.",
        image: "/menu-images/c4.jpg",
      },
      {
        id: "c5",
        name: "Yirgacheffe Pour Over",
        price: "14 ₾",
        description:
          "Ethiopian light roast brewed manually. Floral, bright, and tea-like.",
        image: "/menu-images/c5.jpg",
      },
      {
        id: "c6",
        name: "Cardamom Macchiato",
        price: "10 ₾",
        description:
          "Espresso marked with a dollop of foam, dusted with fresh cardamom.",
        image: "/menu-images/c6.jpg",
      },
      {
        id: "c7",
        name: "Madagascar Mocha",
        price: "13 ₾",
        description:
          "Espresso, steamed milk, and 70% dark Madagascar chocolate.",
        image: "/menu-images/c7.jpg",
      },
      {
        id: "c8",
        name: "Iced Caramel Latte",
        price: "12 ₾",
        description:
          "Chilled espresso and milk with house-made salted caramel syrup.",
        image: "/menu-images/c8.jpg",
      },
      {
        id: "c9",
        name: "Affogato al Caffè",
        price: "15 ₾",
        description: "A scoop of vanilla bean gelato drowned in hot espresso.",
        image: "/menu-images/c9.jpg",
      },
      {
        id: "c10",
        name: "Nitro Draft Brew",
        price: "14 ₾",
        description:
          "Cold brew infused with nitrogen for a creamy, stout-like texture.",
        image: "/menu-images/c10.jpg",
      },
    ],
  },
  {
    id: "zone-mains",
    index: 1,
    col: 1,
    row: 0,
    title: "Kitchen",
    subtitle: "Savory & Mains",
    accentColor: "#4A5D23", // Olive Green
    items: [
      {
        id: "m1",
        name: "Cadillac Cheeseburger",
        price: "28 ₾",
        description:
          "Two smashed beef patties, melty American cheese, house pickles, and our secret sauce.",
        image: "/menu-images/m1.jpg",
      },
      {
        id: "m2",
        name: "Spicy Tuna Bao",
        price: "24 ₾",
        description:
          "Crispy ahi tuna, gochujang mayo, and fresh cilantro in a steamed bun.",
        image: "/menu-images/m2.jpg",
      },
      {
        id: "m3",
        name: "Truffle Parmesan Fries",
        price: "16 ₾",
        description:
          "Hand-cut fries tossed in white truffle oil and aged parmesan.",
        image: "/menu-images/m3.jpg",
      },
      {
        id: "m4",
        name: "Heirloom Avocado Toast",
        price: "22 ₾",
        description:
          "Sourdough, smashed avocado, heirloom tomatoes, and microgreens.",
        image: "/menu-images/m4.jpg",
      },
      {
        id: "m5",
        name: "Miso Glazed Salmon",
        price: "38 ₾",
        description:
          "Pan-seared salmon fillet with a sweet miso glaze and bok choy.",
        image: "/menu-images/m5.jpg",
      },
      {
        id: "m6",
        name: "Wagyu Steak Frites",
        price: "55 ₾",
        description:
          "8oz Wagyu flank steak, garlic herb butter, and crispy shoestring fries.",
        image: "/menu-images/m6.jpg",
      },
      {
        id: "m7",
        name: "Burrata & Fig Salad",
        price: "26 ₾",
        description:
          "Fresh Italian burrata, roasted figs, prosciutto, and balsamic glaze.",
        image: "/menu-images/m7.jpg",
      },
      {
        id: "m8",
        name: "Hot Honey Chicken",
        price: "29 ₾",
        description:
          "Buttermilk fried chicken sandwich drenched in chili-infused honey.",
        image: "/menu-images/m8.jpg",
      },
      {
        id: "m9",
        name: "Wild Mushroom Risotto",
        price: "32 ₾",
        description:
          "Creamy arborio rice with porcini mushrooms and a hint of thyme.",
        image: "/menu-images/m9.jpg",
      },
      {
        id: "m10",
        name: "Crispy Calamari",
        price: "20 ₾",
        description:
          "Lightly dusted calamari rings served with house-made lemon aioli.",
        image: "/menu-images/m10.jpg",
      },
    ],
  },
  {
    id: "zone-pastries",
    index: 2,
    col: 0,
    row: 1,
    title: "Pastries",
    subtitle: "Sweets & Bakes",
    accentColor: "#8B3A3A", // Rust Red
    items: [
      {
        id: "p1",
        name: "Cherry Diner Pie",
        price: "16 ₾",
        description:
          "Warm, buttery crust filled with tart cherries. Served with vanilla bean ice cream.",
        image: "/menu-images/p1.jpg",
      },
      {
        id: "p2",
        name: "Kyoto Matcha Tiramisu",
        price: "18 ₾",
        description:
          "A Japanese twist on the classic, layered with mascarpone and matcha powder.",
        image: "/menu-images/p2.jpg",
      },
      {
        id: "p3",
        name: "Classic French Croissant",
        price: "8 ₾",
        description: "Flaky, buttery, and baked fresh every morning at 6 AM.",
        image: "/menu-images/p3.jpg",
      },
      {
        id: "p4",
        name: "Basque Cheesecake",
        price: "15 ₾",
        description:
          "Caramelized, 'burnt' top with a rich, molten cream cheese center.",
        image: "/menu-images/p4.jpg",
      },
      {
        id: "p5",
        name: "Dark Chocolate Brownie",
        price: "10 ₾",
        description:
          "Fudgy, dense chocolate brownie topped with flaky sea salt.",
        image: "/menu-images/p5.jpg",
      },
      {
        id: "p6",
        name: "Pistachio Eclair",
        price: "12 ₾",
        description:
          "Choux pastry filled with Sicilian pistachio cream and glazed.",
        image: "/menu-images/p6.jpg",
      },
      {
        id: "p7",
        name: "Lemon Meringue Tart",
        price: "14 ₾",
        description:
          "Zesty lemon curd topped with toasted, marshmallow-like meringue.",
        image: "/menu-images/p7.jpg",
      },
      {
        id: "p8",
        name: "Cinnamon Babka",
        price: "11 ₾",
        description:
          "Twisted sweet bread loaded with cinnamon and brown sugar.",
        image: "/menu-images/p8.jpg",
      },
      {
        id: "p9",
        name: "Raspberry Macarons (3)",
        price: "12 ₾",
        description:
          "Delicate almond meringue shells filled with fresh raspberry ganache.",
        image: "/menu-images/p9.jpg",
      },
      {
        id: "p10",
        name: "Vanilla Bean Panna Cotta",
        price: "15 ₾",
        description:
          "Silky Italian cream dessert topped with a seasonal berry compote.",
        image: "/menu-images/p10.jpg",
      },
    ],
  },
  {
    id: "zone-cocktails",
    index: 3,
    col: 1,
    row: 1,
    title: "Spirits",
    subtitle: "Cocktails & Wine",
    accentColor: "#008080", // Deep Teal
    items: [
      {
        id: "k1",
        name: "Classic Negroni",
        price: "25 ₾",
        description:
          "London Dry Gin, Campari, Sweet Vermouth. Stirred over a large ice block.",
        image: "/menu-images/k1.jpg",
      },
      {
        id: "k2",
        name: "Espresso Martini",
        price: "28 ₾",
        description:
          "Vodka, fresh pulled espresso, and coffee liqueur. Garnished with three beans.",
        image: "/menu-images/k2.jpg",
      },
      {
        id: "k3",
        name: "Smoked Old Fashioned",
        price: "30 ₾",
        description:
          "Bourbon, Angostura bitters, sugar. Smoked table-side with oak wood.",
        image: "/menu-images/k3.jpg",
      },
      {
        id: "k4",
        name: "Spicy Mezcal Margarita",
        price: "26 ₾",
        description:
          "Oaxaca Mezcal, fresh lime, agave, and muddled jalapeños with a Tajín rim.",
        image: "/menu-images/k4.jpg",
      },
      {
        id: "k5",
        name: "Aperol Spritz",
        price: "22 ₾",
        description:
          "Aperol, Prosecco, and soda water. The perfect afternoon refreshment.",
        image: "/menu-images/k5.jpg",
      },
      {
        id: "k6",
        name: "Gin & Basil Smash",
        price: "24 ₾",
        description:
          "Gin, fresh lemon juice, sugar syrup, and heavily muddled basil leaves.",
        image: "/menu-images/k6.jpg",
      },
      {
        id: "k7",
        name: "French 75",
        price: "27 ₾",
        description:
          "Gin, Champagne, lemon juice, and sugar. Elegant and effervescent.",
        image: "/menu-images/k7.jpg",
      },
      {
        id: "k8",
        name: "Whiskey Sour",
        price: "25 ₾",
        description:
          "Rye whiskey, lemon juice, simple syrup, and a velvety egg white foam.",
        image: "/menu-images/k8.jpg",
      },
      {
        id: "k9",
        name: "Oaxacan Paloma",
        price: "26 ₾",
        description:
          "Tequila, fresh grapefruit juice, lime, and a splash of sparkling soda.",
        image: "/menu-images/k9.jpg",
      },
      {
        id: "k10",
        name: "Natural Orange Wine",
        price: "22 ₾",
        description:
          "Skin-contact white wine from Kakheti. Complex, dry, and slightly tannic.",
        image: "/menu-images/k10.jpg",
      },
    ],
  },
];

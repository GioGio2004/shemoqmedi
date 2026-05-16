"use client";

import React, { useState } from 'react';
import { MenuHeader } from './components/MenuHeader';
import { MenuSection } from './components/MenuSection';
import { MenuFooter } from './components/MenuFooter';
import { MenuAbout } from './components/MenuAbout';

const MENU_DATA = {
    breakfast: [
        {
            name: "Menemen",
            description: "Traditional Turkish scrambled eggs with tomatoes, green peppers, and warm spices.",
            price: "18₾",
            imageUrl: "https://cookingorgeous.com/wp-content/uploads/2022/03/menemen-turkish-scrambled-eggs-31.jpg"
        },
        {
            name: "Imeretian Khachapuri",
            description: "Classic Georgian cheese bread, baked to order in a wood-fired oven.",
            price: "22₾",
            imageUrl: "https://storage.georgia.travel/images/khachapuri-gnta.webp"
        },
        {
            name: "Simit & Kaymak",
            description: "Freshly baked sesame bread ring with rich clotted cream and local honeycomb.",
            price: "15₾",
            imageUrl: "https://img.freepik.com/premium-photo/traditional-turkish-breakfast-with-bagel-simit-kaymak-honey-wooden-background-top-view-copy-space_89816-35348.jpg"
        },
        {
            name: "Turkish Breakfast Plate",
            description: "Olives, feta cheese, cucumbers, tomatoes, boiled egg, butter, jam, and fresh bread.",
            price: "35₾",
            imageUrl: "https://www.foodandwine.com/thmb/oZKGEElUBJoLUpcZRlPI_daMAzc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/kahvalti-turkish-breakfast-2-FT-BLOG0817-cb6fb273a0d342a5922c27f5d9dd2f52.jpg"
        },
        {
            name: "Kikliko",
            description: "Georgian-style savory french toast, pan-fried and served with a side of fresh matsoni.",
            price: "12₾",
            imageUrl: "https://georgianjournal.ge/media/images/georgianews/2015/September/Cuisine/step-4.jpg"
        },
        {
            name: "Chvishtari",
            description: "Traditional Svanetian cornbread stuffed with melted sulguni cheese, served crispy and hot.",
            price: "14₾",
            imageUrl: "https://letscook.ge/wp-content/uploads/2024/10/IMG_20180802_181835527.jpg"
        },
        {
            name: "Nadugi",
            description: "Delicate mint-infused ricotta cheese wrapped in thin slices of fresh sulguni.",
            price: "16₾",
            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Nadugi_with_mint_wrapped_in_sulguni.jpg"
        }
    ],
    lunch: [
        {
            name: "Lahmacun",
            description: "Crispy thin crust topped with minced meat, vegetables, and herbs. Served with lemon and parsley.",
            price: "12₾",
            imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&q=80"
        },
        {
            name: "Lentil Soup",
            description: "Traditional pureed red lentil soup infused with warm spices, served with a lemon wedge.",
            price: "14₾",
            imageUrl: "https://i0.wp.com/www.thedishonhealthy.com/wp-content/uploads/2020/08/Best-Lentil-Stew-Recipe.jpg?resize=663%2C884&ssl=1"
        },
        {
            name: "Chicken Shish Kebab",
            description: "Marinated grilled chicken skewers served with buttery rice pilaf and charred vegetables.",
            price: "28₾",
            imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80"
        },
        {
            name: "Khinkali (5 pcs)",
            description: "Traditional Georgian dumplings filled with spiced meat and rich, savory broth.",
            price: "15₾",
            imageUrl: "https://tamada.ca/wp-content/uploads/2025/02/3.-khinkali-with-mushrooms.jpg"
        },
        {
            name: "Chikhirtma",
            description: "Silky Georgian chicken soup thickened with eggs and flavored with coriander and vinegar.",
            price: "16₾",
            imageUrl: "https://nofrillskitchen.com/wp-content/uploads/2021/02/DSC00081.jpg"
        },
        {
            name: "Pkhali Assortment",
            description: "Finely minced spinach and beetroot mixed with a rich walnut paste and pomegranate seeds.",
            price: "18₾",
            imageUrl: "https://eurasia.travel/wp-content/uploads/2025/04/21.-Pkhali.jpg"
        },
        {
            name: "Badrijani Nigvzit",
            description: "Fried eggplant slices rolled with a savory garlic and walnut paste, garnished with pomegranate.",
            price: "17₾",
            imageUrl: "https://images.getrecipekit.com/20240401134723-badrijani-for-recipe-card.jpg?aspect_ratio=16:9&quality=90&"
        },
        {
            name: "Lobio",
            description: "Slow-cooked red bean stew served in a traditional clay pot with Georgian pickles and mchadi.",
            price: "16₾",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJtuNu6Dy4QuCk1boH-xKRGhlWtYxQDe_qbXPXHisrPOApvE23onkjmzcOTPzlP9l4FIJSSWvZNgzlarxW5cXf2bbSQNCVDIxH1L3fEw&s=10"
        }
    ],
    dinner: [
        {
            name: "Adana Kebab",
            description: "Hand-minced spicy lamb kebab grilled on wide skewers, served with bulgur and sumac onions.",
            price: "32₾",
            imageUrl: "https://nutriscan.app/calories-nutrition/images/adana-kebab-b8ec4.webp"
        },
        {
            name: "Megrelian Khachapuri",
            description: "Decadent cheese-filled bread topped with an extra layer of melted golden cheese.",
            price: "26₾",
            imageUrl: "https://storage.georgia.travel/images/megruli-khachapuri-gnta.webp"
        },
        {
            name: "Mixed Grill Platter",
            description: "A lavish selection of Adana, Urfa, chicken shish, and tender lamb chops. Perfect for sharing.",
            price: "85₾",
            imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80"
        },
        {
            name: "Mtsvadi",
            description: "Georgian style premium pork barbecue grilled on vine woods, served with tart tkemali sauce.",
            price: "30₾",
            imageUrl: "https://breadandwine.ge/wp-content/uploads/2021/08/skewered-chicken%E2%80%8B.jpg"
        },
        {
            name: "Shkmeruli",
            description: "Crispy roasted chicken submerged in a rich, sizzling garlic and cream sauce.",
            price: "35₾",
            imageUrl: "https://images.getrecipekit.com/20240403063959-shkmeruli-for-card.jpg?aspect_ratio=16:9&quality=90&"
        },
        {
            name: "Ojakhuri",
            description: "A hearty family-style roast of pork, potatoes, and onions served sizzling in a ketsi pan.",
            price: "28₾",
            imageUrl: "https://breadandwine.ge/wp-content/uploads/2021/08/ojakhuri.jpg"
        },
        {
            name: "Chashushuli",
            description: "Spicy Georgian beef stew cooked slowly in a rich tomato sauce with fresh herbs.",
            price: "32₾",
            imageUrl: "https://modernfamilycook.com/wp-content/uploads/2020/03/Chashushuli-1-1300x867.jpg"
        },
        {
            name: "Chakapuli",
            description: "Tender lamb stew flavored with fresh tarragon, tkemali (sour plum), and white wine.",
            price: "36₾",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV3BNPMRjGfj2psLEq8CLI_69_ULP4deoPHRLasnuEumCQX8A1CmgyEuGLsIFozMjmTEBLwMnnKx9QZ8yeD9Zlsgt_UhgMhEKOeFe6dkc&s=10"
        },
        {
            name: "Ajarian Khachapuri",
            description: "Iconic boat-shaped bread filled with cheese and topped with a raw egg yolk and butter.",
            price: "24₾",
            imageUrl: "https://www.advantour.com/img/georgia/dishes/adjarian-khachapuri.jpg"
        }
    ],
    desserts: [
        {
            name: "Pistachio Baklava",
            description: "Delicate layers of thin pastry filled with crushed pistachios and sweetened with fragrant syrup.",
            price: "16₾",
            imageUrl: "https://houseandhome.com/wp-content/uploads/2025/01/Feature_Turkish-Pistachio-Baklava.jpg"
        },
        {
            name: "Kunefe",
            description: "Sweet cheese pastry soaked in syrup, served warm with a generous sprinkle of pistachio.",
            price: "20₾",
            imageUrl: "https://img.sndimg.com/food/image/upload/f_auto,c_thumb,q_55,w_iw/v1/img/recipes/74/79/2/ZAVZFSY2Q4WQnvJliJr2_maxresdefault.jpg"
        },
        {
            name: "Turkish Coffee",
            description: "Unfiltered coffee roasted and finely ground, slow-brewed in a traditional copper cezve.",
            price: "7₾",
            imageUrl: "https://www.giverecipe.com/wp-content/uploads/2019/04/Turkish-coffee-making.jpg"
        },
        {
            name: "Pelamushi",
            description: "A traditional Georgian dessert pudding made from concentrated grape juice and cornflour.",
            price: "12₾",
            imageUrl: "https://culinarybackstreets.s3.us-east-2.amazonaws.com/culinarybackstreets/uploads/cb_tbilisi_pelamushi_recipe_pr_final.jpeg"
        },
        {
            name: "Churchkhela",
            description: "Classic Georgian sweet made by repeatedly dipping walnut halves into thickened grape juice.",
            price: "8₾",
            imageUrl: "https://www.tasteatlas.com/Images/Dishes/b61a25ada4af42b99f883d0ea5a156a5.jpg"
        },
        {
            name: "Medok",
            description: "Georgian-style layered honey cake with light sour cream frosting.",
            price: "14₾",
            imageUrl: "https://georgianjournal.ge/media/_thumb/images/georgianews/2016/November/Cuisine/image52b.jpg"
        }
    ]
};

export interface CartItem {
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export default function LightMenuPage() {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (item: { name: string; price: string; imageUrl?: string }) => {
        const numericPrice = parseFloat(item.price.replace(/[^\d.-]/g, ''));
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { name: item.name, price: numericPrice, quantity: 1, imageUrl: item.imageUrl }];
        });
    };

    const updateQuantity = (name: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.name === name) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const sections = Object.keys(MENU_DATA);

    return (
        <main className="min-h-screen bg-[#FCFCFC] text-[#111111] font-sans selection:bg-[#111111] selection:text-white">
            <MenuHeader 
                scrollToSection={scrollToSection} 
                sections={sections} 
                cart={cart}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                updateQuantity={updateQuantity}
            />

            <div className="max-w-7xl mx-auto relative z-10 px-6 pt-12 pb-24">
                <MenuAbout />

                <div className="text-center text-xs text-[#555555] italic mb-16 uppercase tracking-widest mt-10">
                    A 10% service fee will be added to all checks.<br />
                    Please ask about modifying items for dietary restrictions.
                </div>

                {/* Menu Sections */}
                {Object.entries(MENU_DATA).map(([section, items]) => (
                    <MenuSection key={section} title={section} items={items} addToCart={addToCart} />
                ))}
            </div>

            <MenuFooter />
        </main>
    );
}

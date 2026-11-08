// Written introductions for the collection pages (/collections/<tag>), shown
// under the grid as "About this collection". Each one is hand-written for its
// tag: what makes a good site of that kind and what the jury looks for. A tag
// with no entry shows no section. Keep each to roughly 80–150 words.

export const COLLECTION_ABOUT: Record<string, string[]> = {
  // ── Categories ────────────────────────────────────────────────────────────
  portfolio: [
    "A portfolio site has one job: make someone want to hire the person or studio behind it. The best ones say who they are in a single screen and then get out of the way of the work.",
    "The jury looks for case studies that show process and not only finished shots, navigation that lets a recruiter reach a project in two clicks, and a personality in the type and motion that you would recognise again. Heavy WebGL intros earn points only when they load fast and say something about the maker. Contact details should never be more than one scroll away.",
  ],
  agency: [
    "An agency website sells trust before it sells services. It has to show range across clients and industries while still feeling like one studio with one point of view.",
    "The strongest agency sites lead with recent, named work, explain how the team works in plain language and make the next step obvious, whether that is a brief form or a direct email. The jury rewards confident art direction, case studies with real results and pages that stay fast despite large video reels. A studio site is also a sample of the craft, so details like hover states, page transitions and the quality of the code count here more than anywhere.",
  ],
  "e-commerce": [
    "E-commerce design is judged by two audiences at once: people who want to enjoy browsing and people who want to buy in under a minute. The best online stores serve both.",
    "Here the jury looks at product photography and how it is framed, the clarity of prices, sizes and delivery details, and how quickly a visitor gets from the home page to the cart. Editorial storytelling, lookbooks and motion are welcome when they lead to products rather than away from them. Checkout flows, filter behaviour on mobile and image loading speed weigh heavily in the usability and code scores.",
  ],
  saas: [
    "A SaaS website has to explain an abstract product to a busy visitor in seconds. The best ones show the product itself, not stock illustrations, and let the interface do the convincing.",
    "The jury looks for a headline that says what the software does, product shots or live demos that read at a glance, pricing that is easy to compare and documentation that is one click away. Strong SaaS sites use motion to explain workflows step by step. They stay fast and accessible even with long feature pages, and they treat the sign-up form as part of the design, not an afterthought.",
  ],
  ai: [
    "This collection covers two kinds of site: AI products themselves, and websites that use AI in how they work, from generated imagery to chat interfaces and personalised content.",
    "AI products face a particular design problem. The capabilities are invisible until someone tries them, so the best sites put a real prompt, output or demo on the first screen instead of abstract gradients. The jury rewards honesty about what the model can and cannot do, interfaces that make waiting for a response feel considered, and builds that keep heavy client-side code off the critical path. Sites that use AI as a gimmick, with no benefit to the visitor, score low on creativity.",
  ],
  fintech: [
    "Fintech design has to make money feel safe and simple. Visitors need to trust a product with their savings or payroll within a few seconds, often on a phone.",
    "The best fintech websites balance a calm, credible visual language with clear numbers: fees, rates and limits stated plainly rather than hidden in footnotes. The jury looks for data visualisation that explains instead of decorates, regulatory information that is easy to find, and onboarding that previews the app honestly. Accessibility matters more here than in most categories, because financial tools serve everyone, so colour contrast, readable type and keyboard support all count toward the usability score.",
  ],
  hospitality: [
    "Hotels, restaurants and venues sell a feeling first: the light in a room, the noise of a dining hall, the view from a terrace. Their websites have to carry that atmosphere and still make booking easy.",
    "The jury looks for photography and video that capture a place honestly, menus and room details that load quickly on a phone, and booking or reservation paths that never leave the visitor guessing. The best hospitality sites use type and pacing to set a mood that matches the place, from minimal and quiet to loud and generous, without hiding opening hours, location and prices behind effects.",
  ],
  architecture: [
    "Architecture and interior websites are where restraint is a skill. Buildings, furniture and spaces carry the visual weight, so the site should frame the work and not compete with it.",
    "The best sites in this collection use large photography, generous white space and precise typography that echoes the discipline of the work itself. The jury rewards project pages that show plans, materials and context and not only hero shots, as well as 3D and WebGL experiences that let visitors explore a space. Navigation through a large archive of projects should stay quick, and image-heavy pages must still load fast on mobile.",
  ],
  editorial: [
    "Editorial websites are built for reading: magazines, journals, newsletters and long-form storytelling. Their design is measured in how long people stay and how much they read.",
    "The jury looks at typography first: comfortable line length, a clear hierarchy and type choices with a voice. Strong editorial sites mix text, images and interactive pieces without breaking the reading flow, and they make archives easy to browse by topic or author. Reading on a phone should feel as good as on a desktop. Pages need to load quickly despite large images, and ads and pop-ups should not interrupt the text.",
  ],
  fashion: [
    "Fashion websites live on the edge between commerce and art direction. They need the visual ambition of a campaign and the practicality of a shop.",
    "The best fashion sites in this collection have a strong point of view in casting, photography, type and motion, and they let that identity carry through to product pages and checkout. The jury rewards lookbooks and campaigns that feel native to the web rather than copied from print, bold layouts that still work on small screens, and product details such as fabric, fit and sizing that are easy to find.",
  ],
  culture: [
    "Museums, galleries, festivals, theatres and cultural institutions use their websites as a front door and a programme guide at the same time.",
    "The best culture sites in this collection make what is on, where and when instantly clear, while giving each exhibition or event its own visual moment. The jury looks for strong identity systems that can flex across very different shows, ticketing that works smoothly on a phone, and accessibility that matches the public role of the institution. Archives of past programmes, artist pages and well-structured event data also make these sites useful long after the opening night.",
  ],
  photography: [
    "Photography websites have a single priority: show the pictures at their best. Everything else, from navigation to type, should step back.",
    "The jury looks for image presentation that respects aspect ratios and colour, galleries that load quickly without losing quality, and sequencing that tells a story across a series. The best photographers' sites also make licensing, commissions and contact easy to find. Clever layouts and transitions earn points when they make the photographs feel bigger, and lose them when they crop or slow down the work.",
  ],
  music: [
    "Musicians, labels, audio studios and sound designers face an unusual problem on the web: their work is sound, and browsers stay silent until the visitor asks.",
    "The best sites in this collection make listening one tap away, with players that keep going between pages, and use visuals, motion and typography that feel like the music. The jury rewards custom audio interactions that are respectful of the visitor, tour dates and releases that are easy to scan, and artwork presented at full quality. Sites that autoplay sound or hide the music behind long intros score low on usability.",
  ],
  "real-estate": [
    "Real estate websites sell places people have not yet seen. The best ones help visitors picture themselves living or working there.",
    "The jury looks for listings with accurate floor plans, prices and availability, photography and 3D tours that show real light and proportions, and maps that place a property in its neighbourhood. Development and residential project sites also need a clear story about the architecture and the area. Strong real estate design stays fast with large galleries and makes enquiry or viewing requests simple on mobile.",
  ],
  "food-drink": [
    "Food and drink brands sell taste, smell and texture through a screen. The best websites in this collection make you hungry or thirsty within a scroll.",
    "Here the jury looks for photography and video that feel appetising rather than staged, packaging and brand identity carried confidently into the layout, and practical details such as ingredients, stockists and online ordering that are easy to reach. Playful motion and illustration are welcome, as long as the pages stay quick and readable on the phones most people browse on.",
  ],
  health: [
    "Health and wellness websites ask visitors to trust them with their bodies and minds. Calm, clear design is not decoration here; it is part of the service.",
    "The jury looks for plain language, readable type, honest claims and imagery of real people. The best sites in this collection make booking, pricing and practitioner details easy to find, and they treat accessibility as essential, from colour contrast to screen reader support. Strong visual identity matters too: clinics, apps and wellness brands that look distinctive without feeling clinical score highest on creativity.",
  ],
  education: [
    "Education websites serve students, parents, teachers and institutions, often all at once. The best ones help each of them find their own path quickly.",
    "The jury looks for course and programme information that is easy to compare, interactive learning experiences that teach something on the page itself, and visual identities that feel encouraging rather than bureaucratic. Universities, online courses and learning tools in this collection also need to work well on low-end phones and slow connections, so speed and accessibility weigh heavily in the usability and code scores.",
  ],
  games: [
    "Games and entertainment websites are allowed to be loud. Studios, launches, films and interactive experiences use the web to build hype and to let fans step into a world.",
    "The jury rewards immersive WebGL scenes, inventive interactions and motion that feels like the game or film it promotes. Ambition is welcome, but the basics still count: trailers that start quickly, release dates and platforms that are easy to find, and pages that do not lock up older laptops. The best entries in this collection are memorable enough to share on their own.",
  ],
  travel: [
    "Travel websites sell distance: a place you have not been, a route you have not taken. The best ones make the trip feel real before it is booked.",
    "The jury looks for photography and maps that give a true sense of place, itineraries and prices that are easy to compare, and booking that works smoothly on a phone, often on a slow connection abroad. Tourism boards, airlines, hotels and tour operators in this collection score highest when strong storytelling leads straight to practical information.",
  ],

  // ── Technologies ──────────────────────────────────────────────────────────
  nextjs: [
    "Next.js is a React framework for building websites that render on the server, at build time or at the edge, which makes it a common choice for fast, search-friendly marketing sites and web apps.",
    "In this collection the jury looks at what the framework makes possible: instant page transitions, images served at the right size, and content that is visible to search engines without waiting for JavaScript. The best Next.js sites combine that speed with ambitious design, and they keep client-side code small so that animations and interactions stay smooth on mid-range phones.",
  ],
  react: [
    "React is the most widely used JavaScript library for building interfaces. On award-level websites it powers everything from product configurators to scroll-driven storytelling.",
    "The sites in this collection show React used with care: interactive pieces that load only where they are needed, state that survives navigation, and rich animation without janky re-renders. The jury rewards interfaces that feel like native apps, accessible components that work with a keyboard, and builds that stay light enough for a quick first load.",
  ],
  typescript: [
    "TypeScript adds types to JavaScript, catching mistakes before a site ships. It is now the default language for many studios building complex, long-lived websites.",
    "You will not see TypeScript on the screen, so this collection is about the results it supports: large interactive sites that stay stable, design systems shared across pages and teams, and ambitious features that do not break in production. The jury's code score looks at reliability, performance and clean behaviour in the browser, which is where careful engineering shows.",
  ],
  vue: [
    "Vue is a progressive JavaScript framework known for its gentle learning curve and its single-file components. Many creative studios use it for interactive marketing sites and web apps.",
    "The sites in this collection use Vue to drive transitions, configurators, filters and animated storytelling. The jury looks for smooth interactions, fast first loads and code that degrades gracefully when a device is slow. The best entries pair Vue's reactivity with strong art direction, so the technology serves an idea rather than becoming the point.",
  ],
  nuxt: [
    "Nuxt is a framework built on Vue that adds server rendering, routing and static generation. It is popular with agencies that want Vue's comfort with the speed and search visibility of pre-rendered pages.",
    "The jury looks at what that combination delivers: pages that appear instantly, page transitions that feel like a single continuous experience, and content that search engines can read. The best Nuxt sites in this collection pair those strengths with confident motion and typography.",
  ],
  svelte: [
    "Svelte compiles components into small, fast JavaScript at build time instead of shipping a framework to the browser. SvelteKit adds routing and server rendering on top.",
    "Svelte's light output makes it a natural fit for motion-heavy and interactive sites that still need to load quickly. In this collection the jury rewards that efficiency: smooth transitions, compact bundles and interactions that feel immediate on modest hardware. The best Svelte sites show that performance and expressive design can go together.",
  ],
  astro: [
    "Astro builds content-focused websites that ship almost no JavaScript by default, loading interactive pieces only where a page needs them.",
    "That approach makes Astro sites some of the fastest in the gallery. The jury looks for designs that take advantage of it: rich typography and imagery that load instantly, interactive islands used with intent, and content structured well for search engines. The best Astro sites in this collection prove that a light build can still feel crafted and memorable.",
  ],
  webflow: [
    "Webflow is a visual development platform that lets designers build production websites without writing code by hand, with hosting and a CMS included.",
    "Award-level Webflow sites push well beyond templates. In this collection the jury looks for custom interactions, careful responsive layouts and clean CMS structures that a client can keep updating. Performance matters too: the best entries manage large images and animations without slowing down. These sites show how far a design team can go when the designer is also the builder.",
  ],
  framer: [
    "Framer started as a prototyping tool and grew into a website builder with built-in animation, a CMS and hosting. Designers use it to ship polished sites quickly.",
    "The sites in this collection show Framer at its best: fluid motion, crisp typography and layouts that adapt well to every screen size. The jury looks past the platform's ready-made effects for real art direction, sensible page structure and fast load times. The strongest entries feel like they could only have been made for their brand.",
  ],
  wordpress: [
    "WordPress powers a large share of the web, from personal blogs to major publishers and brand sites. With a custom theme or a headless setup it can support award-level design.",
    "The jury looks for WordPress builds that go beyond stock themes: bespoke layouts, considered editorial typography and an editing experience that lets clients publish without breaking the design. Speed and security weigh heavily in the code score, since plugins can slow a site down. The best entries in this collection show the platform's flexibility in the hands of a careful team.",
  ],
  shopify: [
    "Shopify runs online stores of every size. Custom themes and headless builds turn it into a base for distinctive, fast e-commerce experiences.",
    "In this collection the jury looks for stores that feel like the brand, not like a template: art-directed product pages, considered collection browsing and a checkout path that stays quick on a phone. Strong Shopify sites balance editorial storytelling with conversion, and they keep apps and scripts under control so pages load fast.",
  ],
  tailwind: [
    "Tailwind CSS is a utility-first framework: designers and developers style elements with small, composable classes instead of writing custom stylesheets from scratch.",
    "Tailwind does not dictate a look, so this collection is varied, from stark minimal layouts to dense, colourful interfaces. The jury looks for consistent spacing and type scales, responsive behaviour that holds up on every screen, and small CSS output. The best entries show that a shared utility system can still produce work with a strong identity.",
  ],
  gsap: [
    "GSAP (GreenSock Animation Platform) is the animation library behind many of the web's most celebrated sites, known for precise timelines and its ScrollTrigger plugin for scroll-driven motion.",
    "The jury looks at how animation serves the story: sequences that guide attention, scroll interactions that reveal content at the right pace and transitions that connect pages. The best GSAP sites in this collection feel smooth at 60 frames per second on ordinary laptops and phones, respect visitors who prefer reduced motion, and never make people wait for an effect to finish before they can read.",
  ],
  motion: [
    "Motion (formerly Framer Motion) is an animation library for React and JavaScript, used for gestures, layout animations and physics-based transitions.",
    "The sites in this collection use it to make interfaces feel physical: elements that spring into place, layouts that rearrange smoothly and pages that flow into one another. The jury rewards motion with purpose, animation that explains state changes or guides the eye, and penalises movement that slows tasks down. Smooth performance and respect for reduced-motion settings count toward usability and code.",
  ],
  threejs: [
    "Three.js is the most popular library for 3D graphics in the browser, built on WebGL. It powers product configurators, interactive worlds and the immersive scenes that win awards.",
    "In this collection the jury looks for 3D that earns its place: scenes that tell a story or let visitors explore a product, lighting and materials with real craft, and interactions that feel natural on touch screens as well as with a mouse. Performance is part of the craft, so the best Three.js sites load progressively, keep frame rates steady and offer a graceful fallback on weaker devices.",
  ],
  webgl: [
    "WebGL gives websites direct access to the graphics card, enabling shaders, particle systems, image distortions and real-time 3D that plain HTML and CSS cannot achieve.",
    "The sites in this collection use it for everything from subtle hover effects on photography to full interactive worlds. The jury rewards original shader work, effects that strengthen the brand rather than distract from it, and careful optimisation so pages stay responsive on laptops and phones. Content should remain readable and accessible even when the graphics are the star.",
  ],
  lenis: [
    "Lenis is a lightweight smooth-scroll library. It gives scrolling a soft, consistent feel across browsers and pairs well with scroll-driven animation.",
    "In this collection the jury looks at whether smooth scrolling improves the experience: storytelling pages where motion and scroll position stay in sync, without the laggy feel that badly tuned smooth scroll can cause. The best Lenis sites keep native behaviours such as keyboard scrolling, anchor links and accessibility tools working as visitors expect.",
  ],
  convex: [
    "Convex is a reactive backend platform: a database, server functions and real-time sync in one place, used to build apps where data updates live on every screen.",
    "Sites in this collection use Convex for live features such as voting, collaboration, chat or dashboards that refresh without reloading the page. The jury looks at how those real-time features shape the experience: instant feedback, clear loading and offline states, and interfaces that stay fast as data grows.",
  ],
  mcp: [
    "MCP (Model Context Protocol) is an open standard for connecting AI assistants to tools and data. Websites in this collection are products and experiences built around it.",
    "These sites have to explain a fairly new and technical idea to developers and businesses. The jury rewards clear explanations of what a server or integration does, live examples or code that visitors can try, and documentation that is easy to navigate. Strong visual design that makes a technical subject approachable scores well on creativity.",
  ],
  "custom-cms": [
    "These websites run on a content management system built for the project instead of an off-the-shelf platform, shaped around exactly the content and workflows the client needs.",
    "A custom CMS lets a team publish complex layouts, case studies or product data without breaking the design. In this collection the jury looks for the result on the page: flexible, consistent layouts across many entries, rich media handled well and content that is structured cleanly for search engines.",
  ],
  "custom-audio": [
    "These websites treat sound as part of the design, with custom soundscapes, interface sounds or interactive music, built for the site rather than dropped in as a background track.",
    "Browsers keep sites silent until the visitor chooses to listen, so the best entries make sound an invitation: a clear toggle, audio that responds to scroll or interaction, and an experience that still works with sound off. The jury rewards original sound design that deepens the brand and penalises audio that surprises or annoys.",
  ],

  // ── Regions ───────────────────────────────────────────────────────────────
  georgia: [
    "This collection brings together websites made in Georgia, by studios, agencies and solo developers based in Tbilisi, Batumi, Kutaisi and beyond. Georgian web design has grown quickly, and its best work now stands next to anything in the world.",
    "Every site here goes through the same jury and community voting as international entries, scored on design, usability, creativity and code. The jury looks for confident art direction, careful handling of the Georgian and Latin alphabets together, and builds that work well on the phones most Georgians browse on. If you design or develop websites in Georgia, submit your work to be featured.",
  ],
  global: [
    "This collection gathers websites from studios and independent makers everywhere outside Georgia, from global agencies to freelancers working alone.",
    "Each site is reviewed by the jury before it goes live, then scored by the jury and the community on design, usability, creativity and code during a seven-day voting window. Browse it for a wide view of what web design looks like right now across industries and technologies, or filter by category to narrow it down.",
  ],

  // ── Awards and status ────────────────────────────────────────────────────
  sotd: [
    "Site of the Day is Shemoqmedi's highest award. It goes to websites that reach a final score of 8.5 or more after seven days of voting, where the jury's score counts for 60% and the community's for 40%.",
    "Each score is the average of four pillars: design, usability, creativity and code. Winning sites usually combine a strong idea with flawless execution, being beautiful, easy to use, original and well built at the same time. Winners receive a badge they can display on their own site. This collection is the archive of every Site of the Day, newest first.",
  ],
  bsc: [
    "Best Solo Creation is awarded to websites designed and built by one person, without a studio or agency team. A solo site wins it with a final score of 8.2 or more after seven days of jury and community voting.",
    "The award exists because solo developers compete with agencies on a very different budget. These sites show what one person can do across design, motion and engineering together. A site can win Best Solo Creation and Site of the Day at the same time.",
  ],
  hm: [
    "Honorable Mention goes to websites that finish their seven-day voting window with a final score of 7.5 or more but below the 8.5 needed for Site of the Day.",
    "These are strong, well-crafted sites that the jury and community agreed deserve recognition: often excellent in one or two pillars, such as design or creativity, with smaller compromises elsewhere. Honorable Mention winners can display an award badge on their site, and the collection is a good place to find solid, realistic inspiration.",
  ],
  nominees: [
    "Nominees are websites in their seven-day public voting window right now. Every site here has been reviewed and approved by the jury before going live.",
    "Anyone with an account can score a nominee once, from 1 to 10, on design, usability, creativity and code. When voting closes, the community average is combined with the jury's score (40% community, 60% jury) to decide the awards: Site of the Day, Best Solo Creation and Honorable Mention. Sign in, open a site and cast your vote.",
  ],
};

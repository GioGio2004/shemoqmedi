import type { Metadata } from "next";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Privacy Policy — trilingual (EN/KA/RU).
//
// Law of Georgia on Personal Data Protection Art. 24 requires the notice at
// collection; Consumer Rights Law Art. 5(1) requires consumer information in
// Georgian. Prose lives in the COPY dictionary below (one file for review).
//
// ⚠ KA/RU texts are working translations — have them reviewed by a Georgian
// lawyer before relying on them in a dispute. EN is the drafting original.
// ─────────────────────────────────────────────────────────────────────────────

// ⚙️  OPERATOR IDENTITY — fill in idNumber + address before launch (also used
// on /terms; keep the two files in sync).
const OPERATOR = {
  name: "Saba Khvichia",
  legalForm: {
    en: "Individual Entrepreneur, registered in Georgia",
    ka: "ინდივიდუალური მეწარმე, რეგისტრირებული საქართველოში",
    ru: "Индивидуальный предприниматель, зарегистрирован в Грузии",
  },
  /** Public Registry identification number — FILL IN. */
  idNumber: "",
  /** Registered legal address — FILL IN. */
  address: "",
  email: "hello@shemoqmedi.space",
};

const UPDATED = "31 July 2026";

// Must match the serving host (www) — see canonical-host note in [locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

type Locale = "en" | "ka" | "ru";

const COPY: Record<
  Locale,
  {
    title: string;
    updated: string;
    intro: string;
    sections: Array<{ h: string; p?: string; list?: string[] }>;
    contactHeading: string;
    contactCity: string;
    termsLink: string;
    homeLink: string;
  }
> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    intro:
      `This Privacy Policy explains how Shemoqmedi (“we”, “us”), operated by ${OPERATOR.name} (${OPERATOR.legalForm.en}), collects, uses, and protects personal data when you use our website shemoqmedi.space, our NFC/QR digital menus, and the AI features within them (the “Service”). We comply with the Law of Georgia on Personal Data Protection and, for visitors in the European Economic Area, with the standards of the EU General Data Protection Regulation (GDPR).`,
    sections: [
      {
        h: "Who this applies to",
        p: "The Service has two kinds of users: venue partners (café and restaurant managers we invite and onboard) and diners (guests who open a venue's menu). Diners do not create accounts.",
      },
      {
        h: "What we collect",
        list: [
          "Venue partners: name, email, and organization details, handled through our authentication provider (Clerk). Partner access is invite-only.",
          "Diners: an anonymous device identifier generated in your browser's local storage. If you tell the AI about dietary needs or allergies, those preferences are stored on your device and are only sent to power your recommendations — see “Health-related data” below.",
          "Conversations & orders: messages you send to the in-menu AI, and the items, table/seat, and totals of any order you place. We do not store your payment card details — card payments (for partners' subscriptions) are handled by our payment processor.",
          "Automatically: privacy-friendly analytics (Ahrefs Web Analytics — no cookies, no personal data — and Vercel Analytics), plus standard technical data such as browser type and approximate region. A single functional session cookie keeps a dine-in table session working.",
          "Venue public data: publicly available Google Business Profile information (name, rating, reviews count, hours, location) to enrich venue pages.",
        ],
      },
      {
        h: "How we use it",
        p: "To provide and operate the Service; to power AI menu recommendations; to improve the quality of our AI; to process partners' subscriptions; to keep the Service secure and prevent abuse; and to understand aggregate, anonymous usage.",
      },
      {
        h: "Legal bases",
        p: "We rely on: performance of a contract (to run the Service for partners and diners), consent (for any health-related dietary data and for using conversations to improve our AI), and legitimate interests (security, abuse prevention, and aggregate analytics that do not identify you).",
      },
      {
        h: "Health-related data (allergies & dietary needs)",
        p: "Allergy and dietary information is a special category of personal data. We only process it with your explicit consent, we keep it on your device by default, and we send it only transiently to generate your recommendations. You can clear it at any time by clearing your browser data. Allergen information shown in a menu is provided by the venue — always confirm with staff before ordering if you have a serious allergy.",
      },
      {
        h: "Using conversations to improve our AI",
        p: "With your consent, anonymized excerpts of menu conversations may be used to improve our AI models. We take steps to remove personal identifiers before this use. You may decline, and doing so does not affect your ability to use the menu.",
      },
      {
        h: "Cookies & local storage",
        p: "We use one functional, httpOnly session cookie for dine-in table sessions, and your browser's local storage to remember your anonymous ID and any preferences you set. Our analytics (Ahrefs) is cookieless. We do not use advertising or cross-site tracking cookies.",
      },
      {
        h: "Who we share data with (processors)",
        p: "We use trusted service providers who process data on our behalf: Clerk (authentication), Convex (database & backend), Google (Gemini AI and Maps/Places), ImageKit (image hosting), Resend (transactional email), Upstash (rate limiting), Flitt (card payments for partner subscriptions), Ahrefs and Vercel (analytics & hosting). We do not sell your personal data.",
      },
      {
        h: "International transfers",
        p: "Some providers are located outside Georgia and the EEA. Where personal data is transferred internationally, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses.",
      },
      {
        h: "Retention",
        p: "We keep partner account data for as long as the partnership is active. Diner chat and session data are retained only as long as needed to operate the Service and are then deleted or anonymized. On-device preferences remain on your device until you clear them.",
      },
      {
        h: "Your rights",
        p: "Under Georgian law and the GDPR you have the right to access, correct, delete, restrict, or object to the processing of your personal data, to data portability, and to withdraw consent at any time (in the same form in which you gave it). You may also lodge a complaint with the Personal Data Protection Service of Georgia (personaldata.ge), or your local EEA supervisory authority. To exercise any right, contact us at the email below.",
      },
      {
        h: "Children",
        p: "The Service is not directed at children under 16 and we do not knowingly collect their personal data.",
      },
      {
        h: "Security",
        p: "We use industry-standard measures to protect personal data, including access controls and encryption in transit. No method of transmission is perfectly secure, but we work to protect your information.",
      },
      {
        h: "Changes",
        p: "We may update this policy from time to time. Material changes will be reflected by the “Last updated” date above.",
      },
    ],
    contactHeading: "Contact",
    contactCity: "Tbilisi, Georgia",
    termsLink: "Terms & Conditions",
    homeLink: "Home",
  },

  ka: {
    title: "კონფიდენციალურობის პოლიტიკა",
    updated: "ბოლო განახლება",
    intro:
      `ეს პოლიტიკა განმარტავს, როგორ აგროვებს, იყენებს და იცავს პერსონალურ მონაცემებს Shemoqmedi („ჩვენ“), რომელსაც მართავს ${OPERATOR.name} (${OPERATOR.legalForm.ka}), როდესაც სარგებლობთ ვებგვერდით shemoqmedi.space, ჩვენი NFC/QR ციფრული მენიუებით და მათში ჩაშენებული AI ფუნქციებით („სერვისი“). ჩვენ ვიცავთ „პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონს, ხოლო ევროპის ეკონომიკური ზონის ვიზიტორებისთვის — GDPR-ის სტანდარტებს.`,
    sections: [
      {
        h: "ვისზე ვრცელდება",
        p: "სერვისს ორი ტიპის მომხმარებელი ჰყავს: პარტნიორი დაწესებულებები (კაფეებისა და რესტორნების მენეჯერები, რომლებსაც ჩვენ ვიწვევთ) და სტუმრები (ვინც ხსნის დაწესებულების მენიუს). სტუმრები ანგარიშს არ ქმნიან.",
      },
      {
        h: "რას ვაგროვებთ",
        list: [
          "პარტნიორები: სახელი, ელფოსტა და ორგანიზაციის მონაცემები — ჩვენი ავთენტიფიკაციის პროვაიდერის (Clerk) მეშვეობით. პარტნიორის წვდომა მხოლოდ მოწვევითაა.",
          "სტუმრები: ანონიმური მოწყობილობის იდენტიფიკატორი, რომელიც თქვენი ბრაუზერის ლოკალურ საცავში იქმნება. თუ AI-ს კვების საჭიროებებზე ან ალერგიებზე ეტყვით, ეს პრეფერენციები ინახება თქვენს მოწყობილობაზე და იგზავნება მხოლოდ რეკომენდაციების შესაქმნელად — იხ. „ჯანმრთელობასთან დაკავშირებული მონაცემები“.",
          "საუბრები და შეკვეთები: მენიუს AI-სთვის გაგზავნილი შეტყობინებები და თქვენი შეკვეთის პოზიციები, მაგიდა/ადგილი და ჯამები. საბარათე მონაცემებს ჩვენ არ ვინახავთ — ბარათით გადახდებს (პარტნიორთა გამოწერებისთვის) ამუშავებს ჩვენი გადახდის პროვაიდერი.",
          "ავტომატურად: კონფიდენციალურობის მიმართ კეთილგანწყობილი ანალიტიკა (Ahrefs Web Analytics — ქუქიებისა და პერსონალური მონაცემების გარეშე — და Vercel Analytics), ასევე სტანდარტული ტექნიკური მონაცემები, როგორიცაა ბრაუზერის ტიპი და მიახლოებითი რეგიონი. ერთი ფუნქციური სესიის ქუქი უზრუნველყოფს მაგიდის სესიის მუშაობას.",
          "დაწესებულების საჯარო მონაცემები: Google Business Profile-ის საჯაროდ ხელმისაწვდომი ინფორმაცია (სახელი, რეიტინგი, შეფასებების რაოდენობა, საათები, მდებარეობა) დაწესებულების გვერდების გასამდიდრებლად.",
        ],
      },
      {
        h: "როგორ ვიყენებთ",
        p: "სერვისის მიწოდებისა და ფუნქციონირებისთვის; AI მენიუ-რეკომენდაციებისთვის; ჩვენი AI-ის ხარისხის გასაუმჯობესებლად; პარტნიორთა გამოწერების დასამუშავებლად; სერვისის უსაფრთხოებისა და ბოროტად გამოყენების პრევენციისთვის; და აგრეგირებული, ანონიმური გამოყენების გასაანალიზებლად.",
      },
      {
        h: "სამართლებრივი საფუძვლები",
        p: "ვეყრდნობით: ხელშეკრულების შესრულებას (სერვისის მიწოდება პარტნიორებისა და სტუმრებისთვის), თანხმობას (ჯანმრთელობასთან დაკავშირებული კვების მონაცემებისა და AI-ის გასაუმჯობესებლად საუბრების გამოყენებისთვის) და ლეგიტიმურ ინტერესს (უსაფრთხოება, ბოროტად გამოყენების პრევენცია და აგრეგირებული ანალიტიკა, რომელიც თქვენ ვერ გაიდენტიფიცირებთ).",
      },
      {
        h: "ჯანმრთელობასთან დაკავშირებული მონაცემები (ალერგიები და კვება)",
        p: "ალერგიისა და კვების ინფორმაცია პერსონალურ მონაცემთა განსაკუთრებული კატეგორიაა. მას ვამუშავებთ მხოლოდ თქვენი მკაფიო თანხმობით, ნაგულისხმევად ვინახავთ თქვენს მოწყობილობაზე და ვგზავნით მხოლოდ დროებით — რეკომენდაციების შესაქმნელად. მისი წაშლა ნებისმიერ დროს შეგიძლიათ ბრაუზერის მონაცემების გასუფთავებით. მენიუში ნაჩვენებ ალერგენების ინფორმაციას აწვდის დაწესებულება — სერიოზული ალერგიის შემთხვევაში შეკვეთამდე ყოველთვის დაადასტურეთ პერსონალთან.",
      },
      {
        h: "საუბრების გამოყენება AI-ის გასაუმჯობესებლად",
        p: "თქვენი თანხმობით, მენიუს საუბრების ანონიმიზებული ფრაგმენტები შეიძლება გამოვიყენოთ ჩვენი AI მოდელების გასაუმჯობესებლად. გამოყენებამდე ვშლით პერსონალურ იდენტიფიკატორებს. შეგიძლიათ უარი თქვათ — ეს მენიუს გამოყენებაზე არ იმოქმედებს.",
      },
      {
        h: "ქუქიები და ლოკალური საცავი",
        p: "ვიყენებთ ერთ ფუნქციურ, httpOnly სესიის ქუქის მაგიდის სესიებისთვის და ბრაუზერის ლოკალურ საცავს თქვენი ანონიმური ID-ისა და პრეფერენციების დასამახსოვრებლად. ჩვენი ანალიტიკა (Ahrefs) ქუქიების გარეშე მუშაობს. სარეკლამო ან საიტთაშორისი თვალთვალის ქუქიებს არ ვიყენებთ.",
      },
      {
        h: "ვის ვუზიარებთ მონაცემებს (დამმუშავებლები)",
        p: "ვიყენებთ სანდო პროვაიდერებს, რომლებიც მონაცემებს ჩვენი სახელით ამუშავებენ: Clerk (ავთენტიფიკაცია), Convex (მონაცემთა ბაზა და ბექენდი), Google (Gemini AI და Maps/Places), ImageKit (სურათების ჰოსტინგი), Resend (ტრანზაქციული ელფოსტა), Upstash (მოთხოვნათა შეზღუდვა), Flitt (ბარათით გადახდები პარტნიორთა გამოწერებისთვის), Ahrefs და Vercel (ანალიტიკა და ჰოსტინგი). თქვენს პერსონალურ მონაცემებს არ ვყიდით.",
      },
      {
        h: "საერთაშორისო გადაცემა",
        p: "ზოგიერთი პროვაიდერი საქართველოსა და ევროპის ეკონომიკური ზონის ფარგლებს გარეთ მდებარეობს. პერსონალური მონაცემების საერთაშორისო გადაცემისას ვეყრდნობით შესაბამის გარანტიებს, მაგალითად ევროკომისიის სტანდარტულ სახელშეკრულებო პირობებს.",
      },
      {
        h: "შენახვის ვადა",
        p: "პარტნიორის ანგარიშის მონაცემებს ვინახავთ პარტნიორობის აქტიურობის განმავლობაში. სტუმრის ჩატისა და სესიის მონაცემები ინახება მხოლოდ სერვისის ფუნქციონირებისთვის საჭირო ვადით და შემდეგ იშლება ან ანონიმიზდება. მოწყობილობაზე შენახული პრეფერენციები რჩება, სანამ თავად წაშლით.",
      },
      {
        h: "თქვენი უფლებები",
        p: "საქართველოს კანონმდებლობითა და GDPR-ით გაქვთ უფლება მოითხოვოთ თქვენს პერსონალურ მონაცემებზე წვდომა, მათი გასწორება, წაშლა, დამუშავების შეზღუდვა ან შეწყვეტა, მონაცემთა პორტაბელურობა და თანხმობის ნებისმიერ დროს გამოხმობა (იმავე ფორმით, რომლითაც გაეცით). ასევე შეგიძლიათ საჩივრით მიმართოთ საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს (personaldata.ge) ან თქვენს ადგილობრივ ზედამხედველ ორგანოს ევროპის ეკონომიკურ ზონაში. უფლების განსახორციელებლად მოგვწერეთ ქვემოთ მითითებულ ელფოსტაზე.",
      },
      {
        h: "ბავშვები",
        p: "სერვისი არ არის განკუთვნილი 16 წლამდე ბავშვებისთვის და მათ პერსონალურ მონაცემებს შეგნებულად არ ვაგროვებთ.",
      },
      {
        h: "უსაფრთხოება",
        p: "პერსონალური მონაცემების დასაცავად ვიყენებთ ინდუსტრიის სტანდარტულ ზომებს, მათ შორის წვდომის კონტროლსა და გადაცემისას დაშიფვრას. გადაცემის არცერთი მეთოდი არ არის სრულყოფილად უსაფრთხო, თუმცა ვმუშაობთ თქვენი ინფორმაციის დასაცავად.",
      },
      {
        h: "ცვლილებები",
        p: "პოლიტიკა შეიძლება პერიოდულად განახლდეს. არსებითი ცვლილებები აისახება ზემოთ მითითებულ „ბოლო განახლების“ თარიღში.",
      },
    ],
    contactHeading: "კონტაქტი",
    contactCity: "თბილისი, საქართველო",
    termsLink: "წესები და პირობები",
    homeLink: "მთავარი",
  },

  ru: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление",
    intro:
      `Настоящая Политика объясняет, как Shemoqmedi («мы»), под управлением ${OPERATOR.name} (${OPERATOR.legalForm.ru}), собирает, использует и защищает персональные данные при использовании сайта shemoqmedi.space, наших цифровых NFC/QR-меню и встроенных в них AI-функций («Сервис»). Мы соблюдаем Закон Грузии «О защите персональных данных», а для посетителей из Европейской экономической зоны — стандарты GDPR.`,
    sections: [
      {
        h: "К кому это относится",
        p: "У Сервиса два типа пользователей: заведения-партнёры (менеджеры кафе и ресторанов, которых мы приглашаем) и гости (те, кто открывает меню заведения). Гости не создают аккаунтов.",
      },
      {
        h: "Что мы собираем",
        list: [
          "Партнёры: имя, эл. почта и данные организации — через нашего провайдера аутентификации (Clerk). Доступ партнёров — только по приглашению.",
          "Гости: анонимный идентификатор устройства, создаваемый в локальном хранилище браузера. Если вы сообщите AI о диетических потребностях или аллергиях, эти предпочтения хранятся на вашем устройстве и передаются только для формирования рекомендаций — см. «Данные о здоровье».",
          "Разговоры и заказы: сообщения, которые вы отправляете AI в меню, а также позиции, стол/место и суммы ваших заказов. Данные банковских карт мы не храним — платежи картой (за подписки партнёров) обрабатывает наш платёжный провайдер.",
          "Автоматически: аналитика, бережная к приватности (Ahrefs Web Analytics — без cookie и персональных данных — и Vercel Analytics), а также стандартные технические данные: тип браузера и примерный регион. Один функциональный сессионный cookie обеспечивает работу сессии за столом.",
          "Публичные данные заведений: общедоступная информация Google Business Profile (название, рейтинг, число отзывов, часы, расположение) для обогащения страниц заведений.",
        ],
      },
      {
        h: "Как мы это используем",
        p: "Для предоставления и работы Сервиса; для AI-рекомендаций по меню; для улучшения качества нашего AI; для обработки подписок партнёров; для безопасности и предотвращения злоупотреблений; для анализа агрегированного анонимного использования.",
      },
      {
        h: "Правовые основания",
        p: "Мы опираемся на: исполнение договора (работа Сервиса для партнёров и гостей), согласие (для данных о здоровье и использования разговоров для улучшения AI) и законный интерес (безопасность, предотвращение злоупотреблений и агрегированная аналитика, не идентифицирующая вас).",
      },
      {
        h: "Данные о здоровье (аллергии и диета)",
        p: "Информация об аллергиях и диете — особая категория персональных данных. Мы обрабатываем её только с вашего явного согласия, по умолчанию храним на вашем устройстве и передаём только временно — для формирования рекомендаций. Вы можете удалить её в любой момент, очистив данные браузера. Информацию об аллергенах в меню предоставляет заведение — при серьёзной аллергии всегда уточняйте у персонала перед заказом.",
      },
      {
        h: "Использование разговоров для улучшения AI",
        p: "С вашего согласия анонимизированные фрагменты разговоров в меню могут использоваться для улучшения наших AI-моделей. Перед этим мы удаляем персональные идентификаторы. Вы можете отказаться — это не повлияет на возможность пользоваться меню.",
      },
      {
        h: "Cookie и локальное хранилище",
        p: "Мы используем один функциональный httpOnly сессионный cookie для сессий за столом и локальное хранилище браузера для вашего анонимного ID и предпочтений. Наша аналитика (Ahrefs) работает без cookie. Рекламные и межсайтовые отслеживающие cookie мы не используем.",
      },
      {
        h: "С кем мы делимся данными (обработчики)",
        p: "Мы используем надёжных провайдеров, обрабатывающих данные от нашего имени: Clerk (аутентификация), Convex (база данных и бэкенд), Google (Gemini AI и Maps/Places), ImageKit (хостинг изображений), Resend (транзакционная почта), Upstash (ограничение запросов), Flitt (платежи картой за подписки партнёров), Ahrefs и Vercel (аналитика и хостинг). Мы не продаём ваши персональные данные.",
      },
      {
        h: "Международная передача",
        p: "Некоторые провайдеры находятся за пределами Грузии и ЕЭЗ. При международной передаче персональных данных мы опираемся на надлежащие гарантии, например Стандартные договорные условия Европейской комиссии.",
      },
      {
        h: "Сроки хранения",
        p: "Данные аккаунтов партнёров хранятся, пока партнёрство активно. Данные чатов и сессий гостей хранятся только столько, сколько нужно для работы Сервиса, затем удаляются или анонимизируются. Предпочтения на устройстве остаются, пока вы их не очистите.",
      },
      {
        h: "Ваши права",
        p: "По законодательству Грузии и GDPR вы вправе запросить доступ к своим персональным данным, их исправление, удаление, ограничение или прекращение обработки, переносимость данных, а также отозвать согласие в любой момент (в той же форме, в которой оно было дано). Вы также можете подать жалобу в Службу защиты персональных данных Грузии (personaldata.ge) или в свой надзорный орган в ЕЭЗ. Для реализации прав напишите нам на указанную ниже почту.",
      },
      {
        h: "Дети",
        p: "Сервис не предназначен для детей младше 16 лет, и мы сознательно не собираем их персональные данные.",
      },
      {
        h: "Безопасность",
        p: "Мы применяем отраслевые меры защиты персональных данных, включая контроль доступа и шифрование при передаче. Ни один способ передачи не является абсолютно безопасным, но мы работаем над защитой вашей информации.",
      },
      {
        h: "Изменения",
        p: "Мы можем периодически обновлять эту политику. Существенные изменения отражаются в дате «Последнее обновление» выше.",
      },
    ],
    contactHeading: "Контакты",
    contactCity: "Тбилиси, Грузия",
    termsLink: "Условия использования",
    homeLink: "Главная",
  },
};

const META_DESC: Record<Locale, string> = {
  en: "How Shemoqmedi collects, uses, and protects personal data — for café/restaurant partners and diners. Georgian law + GDPR-aligned.",
  ka: "როგორ აგროვებს, იყენებს და იცავს Shemoqmedi პერსონალურ მონაცემებს — პარტნიორებისა და სტუმრებისთვის. საქართველოს კანონი + GDPR.",
  ru: "Как Shemoqmedi собирает, использует и защищает персональные данные — для партнёров и гостей. Закон Грузии + GDPR.",
};

function resolveLocale(locale: string): Locale {
  return locale === "ka" || locale === "ru" ? locale : "en";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = resolveLocale(locale);
  const title = COPY[l].title;
  const description = META_DESC[l];
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        en: `${BASE_URL}/en/privacy`,
        ka: `${BASE_URL}/ka/privacy`,
        ru: `${BASE_URL}/ru/privacy`,
        "x-default": `${BASE_URL}/en/privacy`,
      },
    },
    // og:url must match this page's canonical (not the layout's homepage URL).
    // og:image is required for a complete card — without it Ahrefs reports
    // "Open Graph tags incomplete" and shares render as a bare link.
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/privacy`,
      type: "website",
      siteName: "Shemoqmedi",
      images: [
        {
          url: `${BASE_URL}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: "VOLOO by Shemoqmedi",
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white mt-10 mb-3">{children}</h2>;
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Locale-prefixed hrefs: bare "/" and "/terms" bounce through the locale
  // middleware (internal 3XX for crawlers) and leave /ka/... and /ru/...
  // legal pages with zero incoming links (Ahrefs orphan pages).
  const { locale } = await params;
  const l = resolveLocale(locale);
  const c = COPY[l];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href={`/${locale}`} className="text-xs tracking-widest uppercase text-zinc-500 hover:text-white transition-colors">
          ← Shemoqmedi
        </Link>
        <h1 className="text-4xl font-bold text-white mt-6 mb-2">{c.title}</h1>
        <p className="text-sm text-zinc-500">{c.updated}: {UPDATED}</p>

        <p className="mt-8 leading-relaxed">{c.intro}</p>

        {c.sections.map((s) => (
          <div key={s.h}>
            <H>{s.h}</H>
            {s.p && <p className="leading-relaxed">{s.p}</p>}
            {s.list && (
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                {s.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <H>{c.contactHeading}</H>
        <p className="leading-relaxed">
          <a href={`mailto:${OPERATOR.email}`} className="text-white underline underline-offset-4">{OPERATOR.email}</a>,{" "}
          {c.contactCity}.
          {OPERATOR.address && <> {OPERATOR.address}.</>}
        </p>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-sm text-zinc-500">
          <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{c.termsLink}</Link>
          <Link href={`/${locale}`} className="hover:text-white transition-colors">{c.homeLink}</Link>
          <nav className="ml-auto flex gap-3" aria-label="Languages">
            {(["en", "ka", "ru"] as const).map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/privacy`}
                className={lang === locale ? "text-white" : "hover:text-white transition-colors"}
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}

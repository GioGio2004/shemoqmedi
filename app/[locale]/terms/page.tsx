import type { Metadata } from "next";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Terms & Conditions — trilingual (EN/KA/RU).
//
// Georgian Consumer Rights Law Art. 5(1) requires consumer information in
// Georgian; the E-Commerce Law Art. 4 requires the operator's identity, legal
// form, address, and contact details to be permanently accessible. The prose
// lives in the COPY dictionary below so a lawyer can review one file.
//
// ⚠ KA/RU texts are working translations — have them reviewed by a Georgian
// lawyer before relying on them in a dispute. EN is the drafting original.
// ─────────────────────────────────────────────────────────────────────────────

// ⚙️  OPERATOR IDENTITY — fill in idNumber + address before launch.
// Required by the Law of Georgia on Electronic Commerce, Art. 4.
const OPERATOR = {
  name: "Saba Khvichia",
  legalForm: {
    en: "Individual Entrepreneur, registered in Georgia",
    ka: "ინდივიდუალური მეწარმე, რეგისტრირებული საქართველოში",
    ru: "Индивидуальный предприниматель, зарегистрирован в Грузии",
  },
  /** Public Registry identification number — FILL IN (e.g. "404XXXXXX"). */
  idNumber: "",
  /** Registered legal address — FILL IN (e.g. "Tbilisi, ... st. N"). */
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
    operatorHeading: string;
    operatorRows: { name: string; legalForm: string; id: string; address: string; email: string };
    sections: Array<{ h: string; p: string }>;
    complaintsHeading: string;
    complaints: string;
    contactHeading: string;
    contactCity: string;
    privacyLink: string;
    homeLink: string;
  }
> = {
  en: {
    title: "Terms & Conditions",
    updated: "Last updated",
    intro:
      "These Terms govern your use of Shemoqmedi (the “Service”), operated by the operator identified below (“we”, “us”). By using the Service you agree to these Terms. If you do not agree, please do not use the Service.",
    operatorHeading: "Operator identity",
    operatorRows: {
      name: "Operator",
      legalForm: "Legal form",
      id: "Identification number",
      address: "Legal address",
      email: "Email",
    },
    sections: [
      {
        h: "The Service",
        p: "Shemoqmedi provides NFC/QR digital menus, an in-menu AI assistant, and table-ordering tools for cafés and restaurants (“Venues”), together with a management dashboard for Venue partners. We are a technology provider. Food, drinks, prices, and service are provided by the Venue, not by us.",
      },
      {
        h: "Accounts & access",
        p: "Venue partner accounts are created by invitation only and are managed through our authentication provider. You are responsible for keeping your credentials secure. Diners use the menus without an account.",
      },
      {
        h: "Menus, prices & allergens",
        p: "Menu content, pricing, availability, and allergen/dietary information are supplied and controlled by each Venue. We do not verify their accuracy. If you have a food allergy or intolerance, always confirm with Venue staff before ordering — do not rely solely on the menu or the AI assistant.",
      },
      {
        h: "Orders",
        p: "When you place an order through a menu, you are ordering from the Venue. The contract for the food and drink is between you and the Venue. We pass your order to the Venue but are not responsible for its preparation, fulfilment, quality, or any payment made in person at the Venue. Note: under Article 14 of the Law of Georgia on the Protection of Consumer Rights, the 14-day distance-contract withdrawal right does not apply to catering services for a specific date or to perishable goods.",
      },
      {
        h: "The AI assistant",
        p: "The in-menu AI provides suggestions generated automatically. It may be inaccurate or incomplete and should not be relied upon for allergy, health, or dietary safety. Recommendations are not professional advice.",
      },
      {
        h: "Partner subscriptions & payments",
        p: "Venue partners may subscribe to paid plans. Recurring card payments are processed by our payment provider (Flitt); we do not store full card details. Fees, billing cycles, and cancellation terms are those agreed at sign-up. All prices include applicable taxes as required by Georgian law.",
      },
      {
        h: "Acceptable use",
        p: "You agree not to misuse the Service: no attempts to breach security or access data you are not authorized to access, no automated abuse of the AI or ordering systems, no unlawful, harmful, or infringing content, and no interference with the Service's operation.",
      },
      {
        h: "Intellectual property",
        p: "The Service, including its software, design, and branding, is owned by us or our licensors. Venues retain rights to their own menu content and brand assets, and grant us the licence needed to display them within the Service.",
      },
      {
        h: "Disclaimers & limitation of liability",
        p: "The Service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect or consequential losses, for the acts or omissions of any Venue, or for issues arising from menu accuracy, allergens, food quality, or order fulfilment. Nothing in these Terms excludes liability that cannot be excluded under applicable law.",
      },
      {
        h: "Changes",
        p: "We may update these Terms; material changes will be reflected by the “Last updated” date above. Continued use of the Service means you accept the updated Terms.",
      },
      {
        h: "Governing law",
        p: "These Terms are governed by the laws of Georgia, and disputes are subject to the jurisdiction of the competent courts of Georgia, without prejudice to any mandatory consumer protections available to you.",
      },
    ],
    complaintsHeading: "Consumer complaints",
    complaints:
      "If you believe your consumer rights have been violated, you may contact us first at the email below. You also have the right to apply to the Competition and Consumer Agency of Georgia or to the courts.",
    contactHeading: "Contact",
    contactCity: "Tbilisi, Georgia",
    privacyLink: "Privacy Policy",
    homeLink: "Home",
  },

  ka: {
    title: "წესები და პირობები",
    updated: "ბოლო განახლება",
    intro:
      "წინამდებარე წესები არეგულირებს Shemoqmedi-ის („სერვისი“) გამოყენებას, რომელსაც მართავს ქვემოთ მითითებული ოპერატორი („ჩვენ“). სერვისის გამოყენებით თქვენ ეთანხმებით ამ წესებს. თუ არ ეთანხმებით, გთხოვთ, არ ისარგებლოთ სერვისით.",
    operatorHeading: "ოპერატორის რეკვიზიტები",
    operatorRows: {
      name: "ოპერატორი",
      legalForm: "სამართლებრივი ფორმა",
      id: "საიდენტიფიკაციო ნომერი",
      address: "იურიდიული მისამართი",
      email: "ელფოსტა",
    },
    sections: [
      {
        h: "სერვისი",
        p: "Shemoqmedi კაფეებსა და რესტორნებს („დაწესებულებები“) სთავაზობს NFC/QR ციფრულ მენიუებს, მენიუში ჩაშენებულ AI ასისტენტს და მაგიდიდან შეკვეთის ინსტრუმენტებს, ასევე მართვის პანელს პარტნიორებისთვის. ჩვენ ვართ ტექნოლოგიური პროვაიდერი — საკვებს, სასმელს, ფასებსა და მომსახურებას უზრუნველყოფს დაწესებულება და არა ჩვენ.",
      },
      {
        h: "ანგარიშები და წვდომა",
        p: "პარტნიორის ანგარიშები იქმნება მხოლოდ მოწვევით და იმართება ჩვენი ავთენტიფიკაციის პროვაიდერის მეშვეობით. თქვენ პასუხისმგებელი ხართ თქვენი მონაცემების უსაფრთხოდ შენახვაზე. სტუმრები მენიუებს ანგარიშის გარეშე იყენებენ.",
      },
      {
        h: "მენიუ, ფასები და ალერგენები",
        p: "მენიუს შინაარსს, ფასებს, ხელმისაწვდომობასა და ალერგენების/კვების ინფორმაციას აწვდის და აკონტროლებს თითოეული დაწესებულება. ჩვენ არ ვამოწმებთ მათ სიზუსტეს. თუ გაქვთ კვების ალერგია ან აუტანლობა, შეკვეთამდე ყოველთვის დაადასტურეთ დაწესებულების პერსონალთან — ნუ დაეყრდნობით მხოლოდ მენიუს ან AI ასისტენტს.",
      },
      {
        h: "შეკვეთები",
        p: "როდესაც მენიუდან შეკვეთას აკეთებთ, თქვენ უკვეთავთ დაწესებულებას. ხელშეკრულება საკვებსა და სასმელზე იდება თქვენსა და დაწესებულებას შორის. ჩვენ შეკვეთას გადავცემთ დაწესებულებას, თუმცა არ ვაგებთ პასუხს მის მომზადებაზე, შესრულებაზე, ხარისხზე ან ადგილზე განხორციელებულ გადახდაზე. გაითვალისწინეთ: „მომხმარებლის უფლებების დაცვის შესახებ“ საქართველოს კანონის მე-14 მუხლის თანახმად, დისტანციური ხელშეკრულებიდან 14-დღიანი გასვლის უფლება არ ვრცელდება კონკრეტული თარიღისთვის გაწეულ კვების მომსახურებასა და მალფუჭებად პროდუქტზე.",
      },
      {
        h: "AI ასისტენტი",
        p: "მენიუში ჩაშენებული AI გთავაზობთ ავტომატურად გენერირებულ რჩევებს. ისინი შეიძლება იყოს არაზუსტი ან არასრული და არ უნდა გამოიყენოთ ალერგიის, ჯანმრთელობის ან კვების უსაფრთხოების საკითხებში გადაწყვეტილების ერთადერთ წყაროდ. რეკომენდაციები არ არის პროფესიული რჩევა.",
      },
      {
        h: "პარტნიორის გამოწერა და გადახდები",
        p: "დაწესებულებებს შეუძლიათ ფასიანი გეგმების გამოწერა. განმეორებად ბარათით გადახდებს ამუშავებს ჩვენი გადახდის პროვაიდერი (Flitt); ბარათის სრულ მონაცემებს ჩვენ არ ვინახავთ. საფასური, ბილინგის ციკლები და გაუქმების პირობები განისაზღვრება რეგისტრაციისას. ყველა ფასი მოიცავს საქართველოს კანონმდებლობით გათვალისწინებულ გადასახადებს.",
      },
      {
        h: "დასაშვები გამოყენება",
        p: "თქვენ თანხმდებით, რომ არ გამოიყენებთ სერვისს არამიზნობრივად: აკრძალულია უსაფრთხოების დარღვევის მცდელობა ან არაავტორიზებულ მონაცემებზე წვდომა, AI-ისა და შეკვეთის სისტემების ავტომატიზებული ბოროტად გამოყენება, უკანონო, მავნე ან უფლებების დამრღვევი კონტენტის განთავსება და სერვისის მუშაობაში ჩარევა.",
      },
      {
        h: "ინტელექტუალური საკუთრება",
        p: "სერვისი — მისი პროგრამული უზრუნველყოფა, დიზაინი და ბრენდინგი — ეკუთვნის ჩვენ ან ჩვენს ლიცენზიარებს. დაწესებულებები ინარჩუნებენ უფლებებს საკუთარ მენიუსა და ბრენდის მასალებზე და გვანიჭებენ ლიცენზიას მათი სერვისში საჩვენებლად.",
      },
      {
        h: "პასუხისმგებლობის შეზღუდვა",
        p: "სერვისი მოწოდებულია „როგორც არის“, ყოველგვარი გარანტიის გარეშე. კანონით დაშვებულ მაქსიმალურ ფარგლებში ჩვენ არ ვაგებთ პასუხს არაპირდაპირ ან თანმდევ ზიანზე, დაწესებულების ქმედებებზე ან უმოქმედობაზე, ასევე მენიუს სიზუსტესთან, ალერგენებთან, საკვების ხარისხთან ან შეკვეთის შესრულებასთან დაკავშირებულ საკითხებზე. ეს წესები არ გამორიცხავს პასუხისმგებლობას, რომლის გამორიცხვაც კანონით დაუშვებელია.",
      },
      {
        h: "ცვლილებები",
        p: "ჩვენ შეიძლება განვაახლოთ ეს წესები; არსებითი ცვლილებები აისახება ზემოთ მითითებულ „ბოლო განახლების“ თარიღში. სერვისის გამოყენების გაგრძელება ნიშნავს განახლებული წესების მიღებას.",
      },
      {
        h: "მარეგულირებელი კანონმდებლობა",
        p: "ეს წესები რეგულირდება საქართველოს კანონმდებლობით და დავები განიხილება საქართველოს კომპეტენტური სასამართლოების მიერ, თქვენთვის ხელმისაწვდომი მომხმარებელთა სავალდებულო დაცვის ნორმების შეუზღუდავად.",
      },
    ],
    complaintsHeading: "მომხმარებლის საჩივრები",
    complaints:
      "თუ მიგაჩნიათ, რომ თქვენი, როგორც მომხმარებლის, უფლებები დაირღვა, პირველ რიგში მოგვმართეთ ქვემოთ მითითებულ ელფოსტაზე. თქვენ ასევე გაქვთ უფლება მიმართოთ საქართველოს კონკურენციისა და მომხმარებლის დაცვის სააგენტოს ან სასამართლოს.",
    contactHeading: "კონტაქტი",
    contactCity: "თბილისი, საქართველო",
    privacyLink: "კონფიდენციალურობის პოლიტიკა",
    homeLink: "მთავარი",
  },

  ru: {
    title: "Условия использования",
    updated: "Последнее обновление",
    intro:
      "Настоящие Условия регулируют использование сервиса Shemoqmedi («Сервис»), которым управляет указанный ниже оператор («мы»). Используя Сервис, вы соглашаетесь с настоящими Условиями. Если вы не согласны, пожалуйста, не используйте Сервис.",
    operatorHeading: "Реквизиты оператора",
    operatorRows: {
      name: "Оператор",
      legalForm: "Правовая форма",
      id: "Идентификационный номер",
      address: "Юридический адрес",
      email: "Эл. почта",
    },
    sections: [
      {
        h: "Сервис",
        p: "Shemoqmedi предоставляет кафе и ресторанам («Заведения») цифровые NFC/QR-меню, встроенного AI-ассистента и инструменты заказа со стола, а также панель управления для партнёров. Мы — технологический провайдер. Еду, напитки, цены и обслуживание предоставляет Заведение, а не мы.",
      },
      {
        h: "Аккаунты и доступ",
        p: "Аккаунты партнёров создаются только по приглашению и управляются через нашего провайдера аутентификации. Вы отвечаете за сохранность своих учётных данных. Гости пользуются меню без аккаунта.",
      },
      {
        h: "Меню, цены и аллергены",
        p: "Содержание меню, цены, доступность и информацию об аллергенах предоставляет и контролирует каждое Заведение. Мы не проверяем их точность. Если у вас пищевая аллергия или непереносимость, всегда уточняйте у персонала Заведения перед заказом — не полагайтесь только на меню или AI-ассистента.",
      },
      {
        h: "Заказы",
        p: "Оформляя заказ через меню, вы заказываете у Заведения. Договор на еду и напитки заключается между вами и Заведением. Мы передаём заказ Заведению, но не отвечаем за его приготовление, исполнение, качество или оплату на месте. Обратите внимание: согласно статье 14 Закона Грузии «О защите прав потребителей», 14-дневное право отказа от дистанционного договора не распространяется на услуги общественного питания на конкретную дату и на скоропортящиеся продукты.",
      },
      {
        h: "AI-ассистент",
        p: "Встроенный в меню AI даёт автоматически сгенерированные рекомендации. Они могут быть неточными или неполными, и на них нельзя полагаться в вопросах аллергии, здоровья или безопасности питания. Рекомендации не являются профессиональной консультацией.",
      },
      {
        h: "Подписки партнёров и платежи",
        p: "Заведения-партнёры могут оформлять платные тарифы. Регулярные платежи картой обрабатывает наш платёжный провайдер (Flitt); полные данные карт мы не храним. Стоимость, циклы списания и условия отмены определяются при оформлении. Все цены включают налоги, предусмотренные законодательством Грузии.",
      },
      {
        h: "Допустимое использование",
        p: "Вы обязуетесь не злоупотреблять Сервисом: запрещены попытки взлома или доступа к чужим данным, автоматизированное злоупотребление AI и системами заказов, незаконный, вредоносный или нарушающий права контент, а также вмешательство в работу Сервиса.",
      },
      {
        h: "Интеллектуальная собственность",
        p: "Сервис — его программное обеспечение, дизайн и брендинг — принадлежит нам или нашим лицензиарам. Заведения сохраняют права на собственное меню и бренд и предоставляют нам лицензию, необходимую для их отображения в Сервисе.",
      },
      {
        h: "Отказ от гарантий и ограничение ответственности",
        p: "Сервис предоставляется «как есть», без каких-либо гарантий. В максимально допустимой законом мере мы не несём ответственности за косвенные убытки, за действия или бездействие Заведений, а также за вопросы, связанные с точностью меню, аллергенами, качеством еды или исполнением заказов. Настоящие Условия не исключают ответственность, которую нельзя исключить по закону.",
      },
      {
        h: "Изменения",
        p: "Мы можем обновлять настоящие Условия; существенные изменения отражаются в дате «Последнее обновление» выше. Продолжение использования Сервиса означает принятие обновлённых Условий.",
      },
      {
        h: "Применимое право",
        p: "Настоящие Условия регулируются законодательством Грузии; споры подлежат рассмотрению компетентными судами Грузии без ущерба для обязательных мер защиты потребителей.",
      },
    ],
    complaintsHeading: "Жалобы потребителей",
    complaints:
      "Если вы считаете, что ваши права потребителя нарушены, сначала свяжитесь с нами по указанной ниже почте. Вы также вправе обратиться в Агентство по конкуренции и защите прав потребителей Грузии или в суд.",
    contactHeading: "Контакты",
    contactCity: "Тбилиси, Грузия",
    privacyLink: "Политика конфиденциальности",
    homeLink: "Главная",
  },
};

const META_DESC: Record<Locale, string> = {
  en: "The terms governing use of Shemoqmedi's NFC digital menus, AI features, and partner subscriptions. Governed by Georgian law.",
  ka: "Shemoqmedi-ის NFC ციფრული მენიუების, AI ფუნქციებისა და პარტნიორული გამოწერების გამოყენების წესები. რეგულირდება საქართველოს კანონმდებლობით.",
  ru: "Условия использования NFC-меню, AI-функций и партнёрских подписок Shemoqmedi. Регулируются законодательством Грузии.",
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
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        en: `${BASE_URL}/en/terms`,
        ka: `${BASE_URL}/ka/terms`,
        ru: `${BASE_URL}/ru/terms`,
        "x-default": `${BASE_URL}/en/terms`,
      },
    },
    // og:url must match this page's canonical (not the layout's homepage URL).
    // og:image is required for a complete card — without it Ahrefs reports
    // "Open Graph tags incomplete" and shares render as a bare link.
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/terms`,
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Locale-prefixed hrefs: bare "/" and "/privacy" bounce through the locale
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

        {/* E-Commerce Law Art. 4 — permanently accessible operator identity */}
        <H>{c.operatorHeading}</H>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm leading-relaxed">
          <dt className="text-zinc-500">{c.operatorRows.name}</dt>
          <dd className="text-white">{OPERATOR.name}</dd>
          <dt className="text-zinc-500">{c.operatorRows.legalForm}</dt>
          <dd>{OPERATOR.legalForm[l]}</dd>
          {OPERATOR.idNumber && (
            <>
              <dt className="text-zinc-500">{c.operatorRows.id}</dt>
              <dd>{OPERATOR.idNumber}</dd>
            </>
          )}
          {OPERATOR.address && (
            <>
              <dt className="text-zinc-500">{c.operatorRows.address}</dt>
              <dd>{OPERATOR.address}</dd>
            </>
          )}
          <dt className="text-zinc-500">{c.operatorRows.email}</dt>
          <dd>
            <a href={`mailto:${OPERATOR.email}`} className="text-white underline underline-offset-4">
              {OPERATOR.email}
            </a>
          </dd>
        </dl>

        {c.sections.map((s) => (
          <div key={s.h}>
            <H>{s.h}</H>
            <p className="leading-relaxed">{s.p}</p>
          </div>
        ))}

        <H>{c.complaintsHeading}</H>
        <p className="leading-relaxed">{c.complaints}</p>

        <H>{c.contactHeading}</H>
        <p className="leading-relaxed">
          <a href={`mailto:${OPERATOR.email}`} className="text-white underline underline-offset-4">{OPERATOR.email}</a>,{" "}
          {c.contactCity}.
        </p>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-sm text-zinc-500">
          <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{c.privacyLink}</Link>
          <Link href={`/${locale}`} className="hover:text-white transition-colors">{c.homeLink}</Link>
          <nav className="ml-auto flex gap-3" aria-label="Languages">
            {(["en", "ka", "ru"] as const).map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/terms`}
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

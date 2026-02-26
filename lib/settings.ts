import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/database";

export type Locale = "uz" | "ru" | "en";

export type LocalizedText = {
  uz: string;
  ru: string;
  en: string;
};

export type AboutSetting = {
  title: LocalizedText;
  quote: LocalizedText;
  body: Record<Locale, string[]>;
  highlight: LocalizedText;
};

export type HeroSetting = {
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
};

export type ContactSetting = {
  phone: string;
  address: string;
  instagram: string;
  telegramChannel: string;
  telegramAdmin: string;
  email?: string;
};

export type FooterSetting = {
  short: LocalizedText;
  domain: string;
};

export const defaultSettings: {
  about: AboutSetting;
  hero: HeroSetting;
  contact: ContactSetting;
  footer: FooterSetting;
} = {
  about: {
    title: {
      uz: "BOND nima?",
      ru: "Что такое BOND?",
      en: "What is BOND?"
    },
    quote: {
      uz: "BOND - bu raqobat emas, rishta.",
      ru: "BOND - это не конкуренция, а связь.",
      en: "BOND is not rivalry, it is a bond."
    },
    body: {
      uz: [
        "Bu olimpiada o'quvchilarni fan orqali, tafakkur orqali va orzular orqali bog'laydi.",
        "BOND'da g'olib - eng ko'p ball olgan emas, eng ko'p o'rgangan va rivojlangan ishtirokchidir."
      ],
      ru: [
        "Эта олимпиада объединяет учеников через науку, мышление и мечты.",
        "В BOND победитель - не тот, кто набрал больше баллов, а тот, кто больше всего научился и развился."
      ],
      en: [
        "This olympiad connects students through knowledge, thinking, and dreams.",
        "In BOND, the winner is not the highest score, but the participant who learned and grew the most."
      ]
    },
    highlight: {
      uz: "Bizning asosiy maqsadimiz - o'quvchilarda bilimga qiziqish uyg'otish, mantiqiy fikrlashni rivojlantirish va sog'lom raqobat muhitini yaratish.",
      ru: "Наша главная цель - пробудить интерес к знаниям, развивать логическое мышление и создать здоровую конкурентную среду.",
      en: "Our main goal is to spark interest in learning, develop logical thinking, and build a healthy competitive environment."
    }
  },
  hero: {
    badge: {
      uz: "International Standard",
      ru: "International Standard",
      en: "International Standard"
    },
    title: {
      uz: "BOND International Olympiad - bilim, fikrlash va rivojlanish maydoni",
      ru: "BOND International Olympiad - пространство знаний, мышления и развития",
      en: "BOND International Olympiad - a space for knowledge, thinking, and growth"
    },
    subtitle: {
      uz: "BOND International Olympiad - bu ingliz tili, matematika, axborot texnologiyalari va mental arifmetika yo'nalishlari bo'yicha o'quvchilarning bilimini aniqlash, rivojlantirish va rag'batlantirishga qaratilgan mustaqil olimpiadadir.",
      ru: "BOND International Olympiad - независимая олимпиада, направленная на оценку, развитие и поощрение знаний учеников по английскому языку, математике, информационным технологиям и ментальной арифметике.",
      en: "BOND International Olympiad is an independent olympiad focused on assessing, developing, and encouraging student knowledge in English, mathematics, information technology, and mental arithmetic."
    }
  },
  contact: {
    phone: "+998 ...",
    address: "TBD",
    instagram: "",
    telegramChannel: "@bond_olympiad",
    telegramAdmin: "@bond_admin",
    email: "info@bondolympiad.uz"
  },
  footer: {
    short: {
      uz: "Xalqaro standartdagi akademik musobaqa.",
      ru: "Академическая олимпиада международного стандарта.",
      en: "International-standard academic competition."
    },
    domain: "bondolympiad.uz"
  }
};

export async function getSiteSettings() {
  if (!isDatabaseConfigured()) {
    return defaultSettings;
  }

  const keys = ["about", "hero", "contact", "footer"];
  let records: Awaited<ReturnType<typeof prisma.siteSetting.findMany>> = [];
  try {
    records = await prisma.siteSetting.findMany({
      where: { key: { in: keys } }
    });
  } catch (error) {
    console.error("Failed to load site settings. Falling back to defaults.", error);
  }

  const map = new Map(records.map((record) => [record.key, record.value]));
  const rawContact =
    (map.get("contact") as Partial<ContactSetting & { telegram?: string }>) ?? {};

  const mergedContact: ContactSetting = {
    ...defaultSettings.contact,
    ...rawContact,
    telegramChannel:
      rawContact.telegramChannel ?? rawContact.telegram ?? defaultSettings.contact.telegramChannel
  };

  return {
    about: (map.get("about") as AboutSetting) ?? defaultSettings.about,
    hero: (map.get("hero") as HeroSetting) ?? defaultSettings.hero,
    contact: mergedContact,
    footer: (map.get("footer") as FooterSetting) ?? defaultSettings.footer
  };
}

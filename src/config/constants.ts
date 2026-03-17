export const APP_INFO = {
  name: "MyDiary",
  fullName: "Daily Journal",
  description: "A premium daily journal and expense tracker.",
  contactEmail: "jayantakarmakar998@gmail.com",
};

export const DEVELOPER_INFO = {
  name: "Jayanta Karmakar",
  role: "Full Stack Developer & UI/UX Designer",
  location: "India (Available Remotely Worldwide)",
  email: "jayantakarmakar998@gmail.com",
  website: "http://codebyjayanta.in/",
  github: "https://github.com/jayanta-karmakar",
  linkedin: "https://www.linkedin.com/in/jayanta-karmakar-496641140/",
};

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/",
  NEW_ENTRY: "/new",
  VIEW_ENTRY: "/entry/:date",
  EDIT_ENTRY: "/entry/:date/edit",
  SETTINGS: "/settings",
  SUMMARY: "/month-summary",
  PRICING: "/pricing",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN: "/admin",
};

export const AUTH_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const HIDE_NAV_PATHS = [
  APP_ROUTES.PRIVACY,
  APP_ROUTES.TERMS,
  APP_ROUTES.CONTACT,
  APP_ROUTES.FORGOT_PASSWORD,
  APP_ROUTES.RESET_PASSWORD,
  APP_ROUTES.ADMIN,
];

export const CONNECTIVITY = {
  CHECK_URL: 'https://www.gstatic.com/generate_204',
  CHECK_INTERVAL_MS: 8000,
  CHECK_TIMEOUT_MS: 5000,
};

export const DATABASE = {
  IDB_NAME: 'MyDiaryDB',
  IDB_VERSION: 1,
  TABLES: {
    PROFILES: 'profiles',
    ENTRIES: 'entries',
    EXPENSES: 'expenses',
    MONTH_CONFIGS: 'month_configs',
    PRICING_PLANS: 'pricing_plans',
  },
};

export const STORAGE_KEYS = {
  THEME: 'daily-journal-theme-v2',
};

export const DEFAULTS = {
  CURRENCY: 'INR',
};

export const PRICING = {
  EXCHANGE_RATES: {
    USD: 1,
    INR: 83.2,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.5,
    CAD: 1.35,
    AED: 3.67,
    AUD: 1.54,
    SGD: 1.34,
  } as Record<string, number>,
  FEATURED_CURRENCY_CODES: ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AED', 'AUD', 'SGD'],
};

export const plans = [ // keep this for now
  {
    name: 'Free Plan',
    description: 'A lightweight way to try MyDiary. No cost, no card, no hassle.',
    price: 0,
    features: [
      'Unlimited journal entries',
      'Basic budget tracking',
      'Daily workout logs',
      'PWA & Offline support',
    ],
    buttonText: 'Get started',
    popular: true,
  },
  {
    name: 'Hobby',
    description: 'Great for side projects and personal growth. Fast, simple, no fuss.',
    price: 10,
    features: [
      'Everything in Free',
      'Biometric lock (Mobile)',
      'Export to PDF/CSV',
      'Advanced monthly analytics',
      'Custom categories',
    ],
    buttonText: 'Coming Soon',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Scaling with less effort. Trusted, dependable, and powerful.',
    price: 20,
    features: [
      'Everything in Hobby',
      'Priority cloud sync',
      'Unlimited storage',
      'AI-powered reflection',
      'Multi-device sync',
      'Family sharing (up to 3)',
    ],
    buttonText: 'Coming Soon',
    popular: false,
  },
  {
    name: 'Growth',
    description: 'Built for high volume and speed. MyDiary at full force.',
    price: 49,
    features: [
      'Everything in Pro',
      'Enterprise-grade security',
      'API access',
      'Dedicated support',
      'Custom data migration',
      'Early access to features',
    ],
    buttonText: 'Subscribe',
    popular: false,
  },
];
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

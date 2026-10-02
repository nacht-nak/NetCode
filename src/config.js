// Supply these public values in .env.local before launch. Never put secrets in VITE_* variables.
export const siteConfig = {
  email: import.meta.env.VITE_CONTACT_EMAIL || "",
  phone: import.meta.env.VITE_CONTACT_PHONE || "",
  location: import.meta.env.VITE_CONTACT_LOCATION || "",
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT || "",
  github: import.meta.env.VITE_GITHUB_URL || "",
  facebook: import.meta.env.VITE_FACEBOOK_URL || "",
  twitter: import.meta.env.VITE_TWITTER_URL || "",
  linkedin: import.meta.env.VITE_LINKEDIN_URL || "",
};

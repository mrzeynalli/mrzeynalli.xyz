export const SITE = {
  website: "https://mrzeynalli.xyz/",
  author: "Elvin Zeynalli",
  profile: "https://mrzeynalli.xyz/",
  desc: "Business Analyst / Quantitative Researcher / Data Scientist",
  title: "Elvin Zeynalli",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, 
  showArchives: true,
  showBackButton: true, 
  editPost: {
    enabled: false, // Set to false if you don't want "Edit page" links on posts
    text: "Edit page",
    url: "https://github.com/your-username/your-repo-name/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Istanbul",
} as const;
/**
 * Centralized Portfolio Data
 * Industry-standard English content for Choqy Pananda Sirait (KIRITO).
 */
export const portfolioData = {
  profile: {
    name: "Choqy Pananda Sirait",
    brand: "KIRITO",
    headline: "Information Systems Student & Web Developer",
    status: "Open for internship, collaboration, and freelance opportunities",
    email: "choqy.sirait@example.com",
    github: "https://github.com/ChoqySirait",
    linkedin: "https://linkedin.com",
  },

  about: {
    title: "About Me",
    role: "Information Systems Student",
    description:
      "An Information Systems undergraduate with a keen passion for modern web development and a strong enthusiasm for cybersecurity. Dedicated to continuous exploration, software architecture, and building secure, interactive digital solutions.",
    badges: ["Web Development", "Cybersecurity Enthusiast", "Learn Always"],
  },

  skills: {
    title: "Technical Stack & Expertise",
    categories: [
      {
        name: "Frontend & UI/UX",
        items: ["HTML5", "CSS3", "JavaScript", "TypeScript", "Node.js", "Figma", "Bizagi"],
      },
      {
        name: "Backend & Systems",
        items: ["Laravel", "Golang", "REST API", "MySQL", "SQL Server", "Laragon"],
      },
      {
        name: "Tools & Environments",
        items: ["Git", "GitHub", "Three.js", "VS Code", "OpenCode", "Antigravity"],
      },
    ],
  },

  projects: {
    title: "Featured Engineering & Design Projects",
    list: [
      {
        id: 1,
        title: "SecurAI — Intelligent SOC L1 Triage & Threat Intel",
        category: "Cybersecurity & AI",
        description: "AI-powered cybersecurity assistant using a hybrid heuristic and LLM engine for URL triage and threat analysis.",
        impact: "Automates Level-1 threat triage, anti-SSRF URL defanging, and incident reporting mapped directly to MITRE ATT&CK.",
        tags: ["FastAPI", "Python", "Gemini AI", "Cybersecurity", "MITRE ATT&CK"],
        linkType: "GitHub",
        url: "https://github.com/ChoqySirait/Chatbot",
      },
      {
        id: 2,
        title: "SupplySync — Enterprise Warehouse Management",
        category: "Fullstack & Systems",
        description: "Industrial warehouse software featuring Auto-FIFO engine, stock batch tracking, and real-time transaction audit logs.",
        impact: "Eliminates expired inventory loss and enforces 100% database transaction auditing against unauthorized adjustments.",
        tags: ["Node.js", "Express.js", "MySQL", "Tailwind CSS", "REST API", "FIFO Engine"],
        linkType: "GitHub",
        url: "https://github.com/ChoqySirait/SupplySync-Mini-Warehouse-Management-System",
      },
      {
        id: 3,
        title: "MSME Parcel Pickup Management System",
        category: "UI/UX & Product Design",
        description: "Integrated package logging and retrieval application designed to streamline logistics operations.",
        impact: "Cut package verification time by 50% and minimized inventory tracking discrepancies.",
        tags: ["Figma", "UI/UX", "System Design"],
        linkType: "Figma",
        url: "https://www.figma.com/design/jcpu2VvqOW6k8LJdFMYNn8/ANAPRANCIS-A?node-id=0-1&t=R8MBUf5nc0j9vZYJ-1",
      },
      {
        id: 4,
        title: "TRIPORIA — Travel & Hotel Guide Experience",
        category: "UI/UX & Product Design",
        description: "Interface prototype and booking workflow for Lake Toba and Samosir regional tour packages.",
        impact: "Achieved an 85% usability test benchmark through structured local tourism catalog flows.",
        tags: ["Figma", "UI/UX", "User Research"],
        linkType: "Figma",
        url: "https://www.figma.com/design/sk3lf3VuJE0mLsAoBTPcFp/KEL-2?node-id=0-1&t=4PAzCGVIItE9ahzP-1",
      },
      {
        id: 5,
        title: "Nakama Interactive To-Do List",
        category: "Frontend Web",
        description: "Responsive productivity workspace built with Vanilla JavaScript and persistent local storage caching.",
        impact: "Zero-latency offline task organization with local filtering and state management.",
        tags: ["HTML5", "JavaScript", "CSS3"],
        linkType: "GitHub",
        url: "https://github.com/ChoqySirait/Nakama-To-Do-Listt",
      },
      {
        id: 6,
        title: "Enterprise Information Architecture Blueprint",
        category: "Systems Analysis",
        description: "Architectural blueprint and UML specification for high-throughput business information systems.",
        impact: "Comprehensive data schema modeling and business process re-engineering documentation.",
        tags: ["UML", "Database Design", "System Architecture"],
        linkType: "Blueprint",
        url: "#",
      },
    ],
  },
};
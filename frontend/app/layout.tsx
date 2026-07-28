import "./globals.css";
import { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { getProfile } from "@/services/profileService";

// Noir/champagne type system: Fraunces for display/serif moments,
// Plus Jakarta Sans as the body face site-wide.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jaiminpanchal.com";

// Baseline keywords that apply regardless of what's in the DB — covers both
// how recruiters search (role + hire intent) and how clients search
// (service + technology). Real profile data (name, headline, location) is
// layered on top of this in generateMetadata below, so this list only needs
// to carry the terms that never change.
const BASE_KEYWORDS = [
  // Core identity
  "Backend and AI Engineer",
  "Backend Developer",
  "AI Engineer",
  "Full Stack Developer",
  "Software Engineer Portfolio",
  // Primary stack — strongest, production-proven
  "Laravel Developer",
  "PHP Developer",
  "TypeScript Developer",
  "Next.js Developer",
  "Spring Boot Developer",
  "FastAPI Developer",
  "Python Developer",
  "Flutter Developer",
  "React Developer",
  "Vue.js Developer",
  // AI / LLM specialty — the differentiator
  "RAG Engineer",
  "LangGraph Developer",
  "LangChain Developer",
  "AI Agent Developer",
  "LLM Integration Engineer",
  "Generative AI Engineer",
  "RAG Evaluation Engineer",
  "Prompt Engineering",
  // DevSecOps / security
  "DevSecOps Engineer",
  "CI/CD Engineer",
  "OWASP Security Engineer",
  "SAST DAST Engineer",
  // Domain proof — real production experience
  "Fintech Software Engineer",
  "E-commerce Developer",
  "Shopify Developer",
  "SaaS Developer",
  "Mobile App Developer",
  // Databases & cloud
  "PostgreSQL Developer",
  "MySQL Developer",
  "Docker Kubernetes Engineer",
  "AWS Developer",
  // Hire intent
  "Hire Backend Developer",
  "Hire AI Engineer",
  "Freelance Software Engineer",
  "Remote Software Engineer",
];

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile().catch(() => null);

  const fullName = profile?.fullName || "Jaimin Panchal";
  const headline = profile?.headline || "Backend & AI Engineer";
  const about =
    profile?.about ||
    "Backend and AI Software Engineer with 2+ years shipping production SaaS, e-commerce, and fintech platforms. Strongest in Laravel/PHP and TypeScript/Next.js, with production Java/Spring Boot, Python/FastAPI, and Flutter. Builds evaluation-driven LLM systems (hybrid RAG, agentic tool calling) shipped through DevSecOps CI/CD.";
  const location = profile?.location;

  const title = `${fullName} | ${headline} Portfolio`;
  const description = about.length > 160 ? `${about.slice(0, 157)}...` : about;

  const keywords = [
    fullName,
    headline,
    ...BASE_KEYWORDS,
    ...(location ? [`Software Engineer in ${location}`, `Developer for hire in ${location}`] : []),
    "Portfolio",
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${fullName}`,
    },
    description,
    keywords,
    authors: [{ name: fullName }],
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: `${fullName} | Portfolio`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
import "./globals.css";
import { Metadata } from "next";
import { Outfit } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Jaimin Panchal | Full Stack AI Developer Portfolio",
  description: "Full Stack AI Developer specializing in production-ready, scalable SaaS and AI systems using Spring Boot, Node.js, Python, and cloud architectures.",
  keywords: ["Jaimin Panchal", "Full Stack AI Developer", "Software Engineer", "React Developer", "Spring Boot Developer", "AI Developer", "LLM Integration", "Portfolio"],
  authors: [{ name: "Jaimin Panchal" }],
  openGraph: {
    title: "Jaimin Panchal | Full Stack AI Developer",
    description: "Explore my developer portfolio, projects, skills, and contact me for freelance or consulting opportunities.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaimin Panchal | Full Stack AI Developer",
    description: "Explore my developer portfolio, projects, skills, and contact me for freelance or consulting opportunities.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
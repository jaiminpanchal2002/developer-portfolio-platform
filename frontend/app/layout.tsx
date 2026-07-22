import "./globals.css";
import { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";

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
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
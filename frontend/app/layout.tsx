import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jaimin Panchal | Senior Software Engineer & Consultant Portfolio",
  description: "Senior Software Engineer and Technology Consultant. Specializing in high-performance Spring Boot architectures, React, Next.js, and Cloud Solutions. Schedule a 1-on-1 technical counselling session or hire for freelance development.",
  keywords: ["Jaimin Panchal", "Software Engineer", "Consultant", "Freelance Developer", "React Developer", "Spring Boot Developer", "Technical Counselling", "Web Developer"],
  authors: [{ name: "Jaimin Panchal" }],
  openGraph: {
    title: "Jaimin Panchal | Senior Software Engineer & Consultant",
    description: "Explore my developer portfolio, projects, skills, and book a direct technical counselling session.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaimin Panchal | Senior Software Engineer",
    description: "Explore my developer portfolio, projects, skills, and book a direct technical counselling session.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
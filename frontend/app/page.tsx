import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Certificates from "@/components/Certificates";
import Contact from "@/components/Contact";
import AppointmentBooking from "@/components/AppointmentBooking";
import Footer from "@/components/Footer";
import AtsMatcher from "@/components/AtsMatcher";
import Testimonials from "@/components/Testimonials";
import SectionWrapper from "@/components/SectionWrapper";

import GitHubShowcase from "@/components/GitHubShowcase";
import { getProfile } from "@/services/profileService";
import { getImageUrl } from "@/lib/api";
import { safeJsonLd } from "@/lib/utils";
import {
  extractGitHubUsername,
  getGitHubShowcase,
} from "@/services/githubService";
import { getProjects } from "@/services/projectService";
import { getSkills } from "@/services/skillService";
import { getExperiences } from "@/services/experienceService";
import { getEducations } from "@/services/educationService";
import { getCertificates } from "@/services/certificateService";
import { getTestimonials } from "@/services/testimonialService";
import { getBlogPosts } from "@/services/blogService";

// Content is managed live via the admin panel and framer-motion's client
// hooks (e.g. useReducedMotion) don't survive Next's build-time static
// prerender pass when reached through this Server Component boundary, so
// this route renders per-request instead of being statically generated.
export const dynamic = "force-dynamic";

// Static fallback so the portfolio degrades gracefully (instead of 404ing)
// when the backend is unreachable — a portfolio must never be a dead page.
const FALLBACK_PROFILE = {
  id: 0,
  fullName: "Jaimin Panchal",
  headline: "Backend & AI Engineer",
  about:
    "Backend and AI Software Engineer with 2+ years shipping production SaaS, e-commerce, and fintech platforms. Strongest in Laravel/PHP and TypeScript/Next.js, with production Java/Spring Boot, Python/FastAPI, and Flutter. Builds evaluation-driven LLM systems (hybrid RAG, agentic tool calling) shipped through DevSecOps CI/CD.",
  email: "jaiminmpanchal02@gmail.com",
  phone: undefined as string | undefined,
  location: "Ahmedabad, India",
  githubUrl: "",
  linkedinUrl: "",
  profileImageUrl: undefined as string | undefined,
};

export default async function Home() {
  const [
    fetchedProfile,
    projects,
    skills,
    experiences,
    educations,
    certificates,
    testimonials,
    blogPosts,
  ] = await Promise.all([
    getProfile().catch(() => null),
    getProjects().catch(() => []),
    getSkills().catch(() => []),
    getExperiences().catch(() => []),
    getEducations().catch(() => []),
    getCertificates().catch(() => []),
    getTestimonials().catch(() => []),
    getBlogPosts().catch(() => []),
  ]);

  const profile = fetchedProfile ?? FALLBACK_PROFILE;

  const githubUsername = extractGitHubUsername(profile.githubUrl);
  const github = githubUsername
    ? await getGitHubShowcase(githubUsername).catch(() => null)
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jaiminpanchal.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.headline,
    email: profile.email,
    telephone: profile.phone || undefined,
    url: siteUrl,
    image: profile.profileImageUrl ? getImageUrl(profile.profileImageUrl) : undefined,
    address: profile.location
      ? { "@type": "PostalAddress", addressLocality: profile.location }
      : undefined,
    sameAs: [profile.githubUrl || "", profile.linkedinUrl || ""].filter(Boolean),
    description: profile.about,
    knowsAbout: skills.map((s) => s.name),
    worksFor: {
      "@type": "Organization",
      name: "Freelance / Independent",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <Navbar profile={profile} showBlog={blogPosts.length > 0} />

      <main className="relative z-10 overflow-x-hidden">
        <Hero profile={profile} />

        <SectionWrapper id="about">
          <About
            profile={profile}
            projectsCount={projects.length}
            experiencesCount={experiences.length}
            certificatesCount={certificates.length}
            educationsCount={educations.length}
          />
        </SectionWrapper>

        <SectionWrapper id="skills">
          <Skills skills={skills} />
        </SectionWrapper>

        <SectionWrapper id="projects">
          <Projects projects={projects} />
        </SectionWrapper>

        {github && (
          <SectionWrapper id="github">
            <GitHubShowcase data={github} />
          </SectionWrapper>
        )}

        <SectionWrapper id="experience">
          <Experience experiences={experiences} />
        </SectionWrapper>

        <SectionWrapper id="education">
          <Education educations={educations} />
        </SectionWrapper>

        <SectionWrapper id="certificates">
          <Certificates certificates={certificates} />
        </SectionWrapper>

        {testimonials.length > 0 && (
          <SectionWrapper id="testimonials">
            <Testimonials testimonials={testimonials} />
          </SectionWrapper>
        )}

        <SectionWrapper id="ats-matcher">
          <AtsMatcher />
        </SectionWrapper>

        <SectionWrapper id="contact">
          <Contact profile={profile} />
        </SectionWrapper>

        <SectionWrapper id="appointment">
          <AppointmentBooking />
        </SectionWrapper>
      </main>

      <div className="relative z-10">
        <Footer profile={profile} />
      </div>
    </>
  );
}

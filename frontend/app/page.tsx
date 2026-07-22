import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Certificates from "@/components/Certificates";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AtsMatcher from "@/components/AtsMatcher";
import SectionWrapper from "@/components/SectionWrapper";

import { getProfile } from "@/services/profileService";
import { getProjects } from "@/services/projectService";
import { getSkills } from "@/services/skillService";
import { getExperiences } from "@/services/experienceService";
import { getEducations } from "@/services/educationService";
import { getCertificates } from "@/services/certificateService";

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
  headline: "Full Stack AI Developer",
  about:
    "Full Stack AI Developer specializing in production-ready, scalable SaaS and AI systems using Spring Boot, Node.js, Python, and cloud architectures.",
  email: "jaiminpanchal939@gmail.com",
  location: "India",
  githubUrl: "",
  linkedinUrl: "",
};

export default async function Home() {
  const [fetchedProfile, projects, skills, experiences, educations, certificates] =
    await Promise.all([
      getProfile().catch(() => null),
      getProjects().catch(() => []),
      getSkills().catch(() => []),
      getExperiences().catch(() => []),
      getEducations().catch(() => []),
      getCertificates().catch(() => []),
    ]);

  const profile = fetchedProfile ?? FALLBACK_PROFILE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jaimin Panchal",
    jobTitle: "Jaimin Panchal - Full Stack AI Developer",
    email: profile.email,
    url: "https://jaiminpanchal.com",
    sameAs: [profile.githubUrl || "", profile.linkedinUrl || ""].filter(Boolean),
    description:
      "Full Stack AI Developer specializing in production-ready, scalable SaaS and AI systems using Spring Boot, Node.js, Python, and cloud architectures.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar profile={profile} />

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

        <SectionWrapper id="experience">
          <Experience experiences={experiences} />
        </SectionWrapper>

        <SectionWrapper id="education">
          <Education educations={educations} />
        </SectionWrapper>

        <SectionWrapper id="certificates">
          <Certificates certificates={certificates} />
        </SectionWrapper>

        <SectionWrapper id="ats-matcher">
          <AtsMatcher />
        </SectionWrapper>

        <SectionWrapper id="contact">
          <Contact profile={profile} />
        </SectionWrapper>
      </main>

      <div className="relative z-10">
        <Footer profile={profile} />
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

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
import Playground from "@/components/Playground";
import AtsMatcher from "@/components/AtsMatcher";

import { getProfile } from "@/services/profileService";
import { getProjects } from "@/services/projectService";
import { getSkills } from "@/services/skillService";
import { getExperiences } from "@/services/experienceService";
import { getEducations } from "@/services/educationService";
import { getCertificates } from "@/services/certificateService";

export default function Home() {

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const profileData = await getProfile();
        const projectData = await getProjects();
        const skillData = await getSkills();
        const experienceData = await getExperiences();
        const educationData = await getEducations();
        const certificateData = await getCertificates();

        setProfile(profileData);
        setProjects(projectData);
        setSkills(skillData);
        setExperiences(experienceData);
        setEducations(educationData);
        setCertificates(certificateData);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  const profileData = profile as any;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Jaimin Panchal",
    "jobTitle": "Jaimin Panchal - Full Stack AI Developer",
    "email": profileData.email,
    "url": "https://jaiminpanchal.com",
    "sameAs": [
      profileData.githubUrl || "",
      profileData.linkedinUrl || ""
    ].filter(Boolean),
    "description": "Full Stack AI Developer specializing in production-ready, scalable SaaS and AI systems using Spring Boot, Node.js, Python, and cloud architectures."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar profile={profile} />

      <main className="overflow-x-hidden">
        <Hero profile={profile} />
        <About
          profile={profile}
          projectsCount={projects.length}
          experiencesCount={experiences.length}
          certificatesCount={certificates.length}
          educationsCount={educations.length}
        />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Playground />
        <Experience experiences={experiences} />
        <Education educations={educations} />
        <Certificates certificates={certificates} />
        <AtsMatcher />
        <Contact profile={profile} />
      </main>

      <Footer profile={profile} />
    </>
  );
}
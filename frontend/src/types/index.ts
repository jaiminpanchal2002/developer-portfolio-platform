export interface Profile {
  id: number;
  fullName: string;
  headline: string;
  about: string;
  email: string;
  phone?: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  profileImageUrl?: string;
  resumeUrl?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl?: string;
  technologies?: string;
  featured?: boolean;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  grade: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  certificateUrl: string;
}

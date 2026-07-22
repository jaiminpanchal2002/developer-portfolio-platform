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

export interface ProjectCaseStudy {
  problemStatement?: string;
  solution?: string;
  architecture?: string;
  challenges?: string;
  learnings?: string;
  /** Outcome numbers, one per line */
  metrics?: string;
}

export interface Project extends ProjectCaseStudy {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl?: string;
  technologies?: string;
  featured?: boolean;
  displayOrder?: number;
  /** false = draft (hidden from the public showcase); undefined counts as published */
  published?: boolean;
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

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  tags?: string;
  readMinutes?: number;
  /** false = draft (hidden from the public list); undefined counts as published */
  published?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: number;
  authorName: string;
  authorRole?: string;
  quote: string;
  avatarUrl?: string;
  linkUrl?: string;
  displayOrder?: number;
  /** false = draft (hidden from the public site); undefined counts as published */
  published?: boolean;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  scheduleMeeting?: boolean;
  meetingDate?: string;
  meetingTime?: string;
  meetingLink?: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issueDate?: string;
  certificateUrl: string;
}

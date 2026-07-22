export interface Job {
    id: string;
    title: string;
    description: string;
    redirect_url: string;

    company?: {
        display_name: string;
    };

    location?: {
        display_name: string;
    };
}

// Shape returned by the backend's job-match API (JobDTO).
export interface JobMatch {
  title: string;
  company?: string;
  location?: string;
  applyLink?: string;
  description?: string;
  salary?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendation?: string;
  recruiterEmail?: string;
  roadmap?: string;
  createdAt?: string;
  source?: string;
}

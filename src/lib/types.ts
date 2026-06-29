export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkMode = "Remote" | "Hybrid" | "On-site";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  postedDaysAgo: number;
  applyUrl: string;
  source: "Greenhouse" | "Lever" | "Ashby" | "Workday" | "Seed";
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  match?: number;
}

export interface ParsedResume {
  rawText: string;
  keywords: string[];
  techStack: string[];
  tools: string[];
  certifications: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  name: string;
}

export type SeekingStatus = "actively" | "casually";

export interface UserProfile {
  email: string;
  name: string;
  jobTitle: string;
  currentCompany: string;
  currentCtc: string;
  expectedCtc: string;
  seeking: SeekingStatus;
  avatarDataUrl?: string;
  resumeFileName?: string;
  resume?: ParsedResume;
}

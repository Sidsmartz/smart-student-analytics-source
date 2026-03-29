export type StudentClass = "CSD-A" | "CSD-B" | "CSD-C" | "CSD-D" | "";

export interface Student {
  name: string;
  mid1: number;
  mid2: number;
  attendance: number;
  skills: string[];
  eventParticipation: string[];
  resumeDetails: string;
  class?: StudentClass;
}

export interface AnalysisResult {
  totalStudents: number;
  weakStudents: Student[];
  averageMid1: number;
  averageMid2: number;
  averageAttendance: number;
  topPerformers: Student[];
  skillDistribution: Record<string, number>;
}

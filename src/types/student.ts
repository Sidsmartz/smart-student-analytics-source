export interface Student {
  name: string;
  marks: number;
  attendance: number;
  skills: string[];
  eventParticipation: string[];
  resumeDetails: string;
}

export interface AnalysisResult {
  totalStudents: number;
  weakStudents: Student[];
  averageMarks: number;
  averageAttendance: number;
  topPerformers: Student[];
  skillDistribution: Record<string, number>;
}

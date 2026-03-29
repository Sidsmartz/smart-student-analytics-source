import { Student, AnalysisResult } from "@/types/student";

export function analyzeStudents(students: Student[]): AnalysisResult {
  const sanitized = students.map((s) => ({
    ...s,
    mid1: Number(s.mid1) || 0,
    mid2: Number(s.mid2) || 0,
    attendance: Number(s.attendance) || 0,
  }));

  const weakStudents = sanitized.filter(
    (s) => (s.mid1 + s.mid2) / 2 < 50 || s.attendance < 75
  );

  const averageMid1 = sanitized.reduce((sum, s) => sum + s.mid1, 0) / (sanitized.length || 1);
  const averageMid2 = sanitized.reduce((sum, s) => sum + s.mid2, 0) / (sanitized.length || 1);
  const averageAttendance = sanitized.reduce((sum, s) => sum + s.attendance, 0) / (sanitized.length || 1);

  const topPerformers = [...sanitized]
    .sort((a, b) => (b.mid1 + b.mid2) - (a.mid1 + a.mid2))
    .slice(0, 5);

  const skillDistribution: Record<string, number> = {};
  sanitized.forEach((s) =>
    s.skills.forEach((skill) => {
      skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
    })
  );

  return {
    totalStudents: sanitized.length,
    weakStudents,
    averageMid1,
    averageMid2,
    averageAttendance,
    topPerformers,
    skillDistribution,
  };
}

const EVENT_MAP: Record<string, string[]> = {
  python: ["Hackathon", "Data Science Workshop", "AI/ML Bootcamp"],
  java: ["Code Sprint", "Android Dev Workshop", "Java Conference"],
  javascript: ["Web Dev Hackathon", "React Workshop", "Frontend Fest"],
  react: ["React Workshop", "Frontend Fest", "UI/UX Hackathon"],
  ml: ["AI/ML Bootcamp", "Data Science Workshop", "Kaggle Competition"],
  "machine learning": ["AI/ML Bootcamp", "Data Science Workshop", "Kaggle Competition"],
  "data science": ["Data Science Workshop", "Kaggle Competition", "Analytics Summit"],
  design: ["UI/UX Hackathon", "Design Sprint", "Creative Workshop"],
  communication: ["Debate Competition", "Public Speaking Event", "Model UN"],
  leadership: ["Student Council Elections", "Management Fest", "Leadership Summit"],
  sql: ["Database Workshop", "Data Engineering Bootcamp"],
  cloud: ["Cloud Computing Workshop", "AWS/GCP Hackathon"],
  css: ["Frontend Fest", "UI/UX Hackathon", "Web Dev Hackathon"],
  html: ["Web Dev Hackathon", "Frontend Fest"],
  c: ["Competitive Programming", "Code Sprint", "Systems Workshop"],
  "c++": ["Competitive Programming", "Code Sprint", "Systems Workshop"],
};

const JOB_MAP: Record<string, string[]> = {
  python: ["Python Developer Intern", "Data Analyst", "Backend Developer"],
  java: ["Java Developer Intern", "Android Developer", "Software Engineer Trainee"],
  javascript: ["Frontend Developer Intern", "Full Stack Intern", "Web Developer"],
  react: ["React Developer Intern", "Frontend Engineer", "UI Developer"],
  ml: ["ML Engineer Intern", "AI Research Intern", "Data Scientist Intern"],
  "machine learning": ["ML Engineer Intern", "AI Research Intern", "Data Scientist Intern"],
  "data science": ["Data Analyst Intern", "Business Analyst", "Data Scientist Intern"],
  design: ["UI/UX Designer Intern", "Product Designer", "Graphic Designer Intern"],
  communication: ["Content Writer Intern", "HR Intern", "Marketing Intern"],
  leadership: ["Project Coordinator Intern", "Management Trainee", "Operations Intern"],
  sql: ["Database Admin Intern", "Data Analyst", "Backend Developer Intern"],
  cloud: ["Cloud Engineer Intern", "DevOps Intern", "Infrastructure Intern"],
  css: ["Frontend Developer Intern", "UI Developer", "Web Designer Intern"],
  html: ["Web Developer Intern", "Frontend Intern"],
  c: ["Systems Programmer Intern", "Embedded Systems Intern"],
  "c++": ["Systems Programmer Intern", "Game Developer Intern", "Software Engineer Trainee"],
};

export function getEventRecommendations(student: Student): string[] {
  const events = new Set<string>();
  student.skills.forEach((skill) => {
    const key = skill.toLowerCase();
    (EVENT_MAP[key] || []).forEach((e) => events.add(e));
  });
  return events.size > 0 ? Array.from(events) : ["General Tech Fest", "Career Fair"];
}

export function getJobRecommendations(student: Student): string[] {
  const jobs = new Set<string>();
  student.skills.forEach((skill) => {
    const key = skill.toLowerCase();
    (JOB_MAP[key] || []).forEach((j) => jobs.add(j));
  });
  return jobs.size > 0 ? Array.from(jobs) : ["General Intern", "Campus Ambassador"];
}

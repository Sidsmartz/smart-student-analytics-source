export interface SubjectMarks {
  assignment: number;
  descriptive: number;
  tot: number;
}

export interface Student {
  _id?: string;
  slNo: number;
  htno: string;
  computerOrientedStatisticalMethods: SubjectMarks;
  businessEconomicsAndFinancialAnalysis: SubjectMarks;
  dataAnalyticsUsingR: SubjectMarks;
  objectOrientedProgrammingThroughJava: SubjectMarks;
  designAndAnalysisOfAlgorithms: SubjectMarks;
  dataAnalyticsUsingRLab: SubjectMarks;
  objectOrientedProgrammingThroughJavaLab: SubjectMarks;
  realTimeResearchProject: SubjectMarks;
}

export const SUBJECT_KEYS = [
  "computerOrientedStatisticalMethods",
  "businessEconomicsAndFinancialAnalysis",
  "dataAnalyticsUsingR",
  "objectOrientedProgrammingThroughJava",
  "designAndAnalysisOfAlgorithms",
  "dataAnalyticsUsingRLab",
  "objectOrientedProgrammingThroughJavaLab",
  "realTimeResearchProject",
] as const;

export type SubjectKey = typeof SUBJECT_KEYS[number];

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  computerOrientedStatisticalMethods: "Computer Oriented Statistical Methods",
  businessEconomicsAndFinancialAnalysis: "Business Economics and Financial Analysis",
  dataAnalyticsUsingR: "Data Analytics using R",
  objectOrientedProgrammingThroughJava: "Object Oriented Programming through Java",
  designAndAnalysisOfAlgorithms: "Design and Analysis of Algorithms",
  dataAnalyticsUsingRLab: "Data Analytics using R Lab",
  objectOrientedProgrammingThroughJavaLab: "Object Oriented Programming through Java Lab",
  realTimeResearchProject: "Real Time Research Project / Societal Related Project",
};

export function emptySubject(): SubjectMarks {
  return { assignment: 0, descriptive: 0, tot: 0 };
}

export function emptyStudent(slNo = 1): Student {
  return {
    slNo,
    htno: "",
    computerOrientedStatisticalMethods: emptySubject(),
    businessEconomicsAndFinancialAnalysis: emptySubject(),
    dataAnalyticsUsingR: emptySubject(),
    objectOrientedProgrammingThroughJava: emptySubject(),
    designAndAnalysisOfAlgorithms: emptySubject(),
    dataAnalyticsUsingRLab: emptySubject(),
    objectOrientedProgrammingThroughJavaLab: emptySubject(),
    realTimeResearchProject: emptySubject(),
  };
}

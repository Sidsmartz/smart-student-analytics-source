import * as XLSX from "xlsx";
import { Student, emptySubject } from "@/types/student";

// Column order in CSD-2.xlsx matches this subject order × [assignment, descriptive, tot]
const SUBJECT_FIELD_ORDER = [
  "computerOrientedStatisticalMethods",
  "businessEconomicsAndFinancialAnalysis",
  "dataAnalyticsUsingR",
  "objectOrientedProgrammingThroughJava",
  "designAndAnalysisOfAlgorithms",
  "dataAnalyticsUsingRLab",
  "objectOrientedProgrammingThroughJavaLab",
  "realTimeResearchProject",
] as const;

export function parseExcel(buffer: ArrayBuffer): Omit<Student, "_id">[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // Get raw rows as arrays (header rows are row 0 and 1, data starts at row 2)
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });

  const students: Omit<Student, "_id">[] = [];

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i] as (string | number)[];
    // Skip empty rows
    if (!row[0] && !row[1]) continue;

    const slNo = Number(row[0]) || i - 1;
    const htno = String(row[1] ?? "").trim().toUpperCase();
    if (!htno) continue;

    const student: Omit<Student, "_id"> = {
      slNo,
      htno,
      computerOrientedStatisticalMethods: emptySubject(),
      businessEconomicsAndFinancialAnalysis: emptySubject(),
      dataAnalyticsUsingR: emptySubject(),
      objectOrientedProgrammingThroughJava: emptySubject(),
      designAndAnalysisOfAlgorithms: emptySubject(),
      dataAnalyticsUsingRLab: emptySubject(),
      objectOrientedProgrammingThroughJavaLab: emptySubject(),
      realTimeResearchProject: emptySubject(),
    };

    // Columns start at index 2, each subject takes 3 columns: assignment, descriptive, tot
    SUBJECT_FIELD_ORDER.forEach((key, idx) => {
      const base = 2 + idx * 3;
      student[key] = {
        assignment: Number(row[base]) || 0,
        descriptive: Number(row[base + 1]) || 0,
        tot: Number(row[base + 2]) || 0,
      };
    });

    students.push(student);
  }

  return students;
}

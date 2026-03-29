import { Student } from "@/types/student";

export function parseCSV(text: string): Student[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const nameIdx = headers.findIndex((h) => h.includes("name"));
  const mid1Idx = headers.findIndex((h) => h.includes("mid1") || h === "mid 1");
  const mid2Idx = headers.findIndex((h) => h.includes("mid2") || h === "mid 2");
  // fallback: single marks column split 50/50
  const marksIdx = headers.findIndex((h) => h.includes("mark") && !h.includes("mid"));
  const attendanceIdx = headers.findIndex((h) => h.includes("attend"));
  const skillsIdx = headers.findIndex((h) => h.includes("skill"));
  const eventIdx = headers.findIndex((h) => h.includes("event"));
  const resumeIdx = headers.findIndex((h) => h.includes("resume"));

  return lines.slice(1).filter((line) => line.trim()).map((line) => {
    const cols = line.split(",").map((c) => c.trim());

    let mid1 = 0;
    let mid2 = 0;
    if (mid1Idx !== -1 && mid2Idx !== -1) {
      mid1 = parseFloat(cols[mid1Idx]) || 0;
      mid2 = parseFloat(cols[mid2Idx]) || 0;
    } else if (marksIdx !== -1) {
      const total = parseFloat(cols[marksIdx]) || 0;
      mid1 = total;
      mid2 = total;
    }

    return {
      name: cols[nameIdx] || "Unknown",
      mid1,
      mid2,
      attendance: parseFloat(cols[attendanceIdx]) || 0,
      skills: cols[skillsIdx] ? cols[skillsIdx].split(";").map((s) => s.trim()).filter(Boolean) : [],
      eventParticipation: cols[eventIdx] ? cols[eventIdx].split(";").map((s) => s.trim()).filter(Boolean) : [],
      resumeDetails: cols[resumeIdx] || "",
    };
  });
}

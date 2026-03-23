import { Student } from "@/types/student";

export function parseCSV(text: string): Student[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const nameIdx = headers.findIndex((h) => h.includes("name"));
  const marksIdx = headers.findIndex((h) => h.includes("mark"));
  const attendanceIdx = headers.findIndex((h) => h.includes("attend"));
  const skillsIdx = headers.findIndex((h) => h.includes("skill"));
  const eventIdx = headers.findIndex((h) => h.includes("event"));
  const resumeIdx = headers.findIndex((h) => h.includes("resume"));

  return lines.slice(1).filter(line => line.trim()).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      name: cols[nameIdx] || "Unknown",
      marks: parseFloat(cols[marksIdx]) || 0,
      attendance: parseFloat(cols[attendanceIdx]) || 0,
      skills: cols[skillsIdx] ? cols[skillsIdx].split(";").map((s) => s.trim()).filter(Boolean) : [],
      eventParticipation: cols[eventIdx] ? cols[eventIdx].split(";").map((s) => s.trim()).filter(Boolean) : [],
      resumeDetails: cols[resumeIdx] || "",
    };
  });
}

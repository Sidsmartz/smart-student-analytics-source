import { Student } from "@/types/student";

const BASE = import.meta.env.VITE_API_URL || "";

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${BASE}/api/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function createStudent(data: Omit<Student, "_id">): Promise<Student> {
  const res = await fetch(`${BASE}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create student");
  }
  return res.json();
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  const res = await fetch(`${BASE}/api/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update student");
  }
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/students/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
}

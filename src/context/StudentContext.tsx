import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Student } from "@/types/student";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/lib/api";

interface StudentContextType {
  students: Student[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addStudent: (data: Omit<Student, "_id">) => Promise<void>;
  editStudent: (id: string, data: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addStudent = async (data: Omit<Student, "_id">) => {
    const created = await createStudent(data);
    setStudents((prev) => [...prev, created].sort((a, b) => a.slNo - b.slNo));
  };

  const editStudent = async (id: string, data: Partial<Student>) => {
    const updated = await updateStudent(id, data);
    setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
  };

  const removeStudent = async (id: string) => {
    await deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <StudentContext.Provider value={{ students, loading, error, reload: load, addStudent, editStudent, removeStudent }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudents must be used within StudentProvider");
  return ctx;
};

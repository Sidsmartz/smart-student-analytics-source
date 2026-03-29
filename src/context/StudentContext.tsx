import React, { createContext, useContext, useState } from "react";
import { Student, StudentClass } from "@/types/student";

interface StudentContextType {
  students: Student[];
  setStudents: (students: Student[]) => void;
  assignClass: (name: string, cls: StudentClass) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);

  const assignClass = (name: string, cls: StudentClass) => {
    setStudents((prev) => prev.map((s) => s.name === name ? { ...s, class: cls } : s));
  };

  return (
    <StudentContext.Provider value={{ students, setStudents, assignClass }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudents must be used within StudentProvider");
  return ctx;
};

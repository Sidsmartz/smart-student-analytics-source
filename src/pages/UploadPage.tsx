import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/context/StudentContext";
import { useToast } from "@/hooks/use-toast";
import { Student, SUBJECT_KEYS, SUBJECT_LABELS, SubjectKey } from "@/types/student";
import StudentForm from "@/components/StudentForm";

export default function UploadPage() {
  const { students, loading, error, removeStudent } = useStudents();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | undefined>();

  const openAdd = () => { setEditing(undefined); setFormOpen(true); };
  const openEdit = (s: Student) => { setEditing(s); setFormOpen(true); };

  const handleDelete = async (s: Student) => {
    if (!confirm(`Delete ${s.htno}?`)) return;
    try {
      await removeStudent(s._id!);
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const nextSlNo = students.length > 0 ? Math.max(...students.map((s) => s.slNo)) + 1 : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive mb-2 font-medium">Could not connect to server</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="mt-4 text-xs text-muted-foreground">Make sure the backend is running: <code>node server/index.js</code></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Marks — CSD</h1>
          <p className="text-sm text-muted-foreground">{students.length} students</p>
        </div>
        <div className="flex gap-2">
          {students.length > 0 && (
            <Button variant="outline" onClick={() => navigate("/analysis")}>
              <BarChart3 className="mr-2 h-4 w-4" /> Analysis
            </Button>
          )}
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground mb-4">No students yet. Add the first one.</p>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted">
                <th rowSpan={2} className="border px-2 py-2 text-center font-medium">Sl No</th>
                <th rowSpan={2} className="border px-2 py-2 text-center font-medium">HTNO</th>
                {SUBJECT_KEYS.map((key) => (
                  <th key={key} colSpan={3} className="border px-2 py-1 text-center font-medium text-[10px]">
                    {SUBJECT_LABELS[key as SubjectKey]}
                  </th>
                ))}
                <th rowSpan={2} className="border px-2 py-2 text-center font-medium">Actions</th>
              </tr>
              <tr className="bg-muted/60">
                {SUBJECT_KEYS.map((key) => (
                  <>
                    <th key={`${key}-a`} className="border px-1 py-1 text-center font-medium text-[10px]">ASSIGN<br/>MENT<br/>(R22)</th>
                    <th key={`${key}-d`} className="border px-1 py-1 text-center font-medium text-[10px]">DESCRI<br/>PTIVE<br/>(R22)</th>
                    <th key={`${key}-t`} className="border px-1 py-1 text-center font-medium text-[10px]">TOT</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                  <td className="border px-2 py-1.5 text-center">{s.slNo}</td>
                  <td className="border px-2 py-1.5 text-center font-medium">{s.htno}</td>
                  {SUBJECT_KEYS.map((key) => {
                    const sub = s[key as SubjectKey];
                    return (
                      <>
                        <td key={`${key}-a`} className="border px-2 py-1.5 text-center">{sub.assignment}</td>
                        <td key={`${key}-d`} className="border px-2 py-1.5 text-center">{sub.descriptive}</td>
                        <td key={`${key}-t`} className="border px-2 py-1.5 text-center font-medium">{sub.tot}</td>
                      </>
                    );
                  })}
                  <td className="border px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editing}
        nextSlNo={nextSlNo}
      />
    </div>
  );
}

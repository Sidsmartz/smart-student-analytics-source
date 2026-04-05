import { useState, useEffect } from "react";
import { Student, SubjectKey, SUBJECT_KEYS, SUBJECT_LABELS, emptyStudent, SECTIONS, Section } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStudents } from "@/context/StudentContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: Student;
  nextSlNo?: number;
}

export default function StudentForm({ open, onClose, existing, nextSlNo = 1 }: Props) {
  const { addStudent, editStudent } = useStudents();
  const { toast } = useToast();
  const [form, setForm] = useState<Student>(existing ?? emptyStudent(nextSlNo));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(existing ?? emptyStudent(nextSlNo));
  }, [existing, nextSlNo, open]);

  const setSubject = (key: SubjectKey, field: "assignment" | "descriptive" | "tot", val: string) => {
    const num = parseFloat(val) || 0;
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: num },
    }));
  };

  const handleSubmit = async () => {
    if (!form.htno.trim()) {
      toast({ title: "HTNO required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (existing?._id) {
        await editStudent(existing._id, form);
        toast({ title: "Student updated" });
      } else {
        await addStudent(form);
        toast({ title: "Student added" });
      }
      onClose();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sl No</Label>
              <Input
                type="number"
                value={form.slNo}
                onChange={(e) => setForm((p) => ({ ...p, slNo: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label>HTNO</Label>
              <Input
                value={form.htno}
                onChange={(e) => setForm((p) => ({ ...p, htno: e.target.value.toUpperCase() }))}
                placeholder="e.g. 22B91A6201"
              />
            </div>
            <div>
              <Label>Section</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.section ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, section: e.target.value as Section }))}
              >
                <option value="">— Select —</option>
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Subjects */}
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium min-w-[220px]">Subject</th>
                  <th className="px-3 py-2 text-center font-medium w-28">Assignment (R22)</th>
                  <th className="px-3 py-2 text-center font-medium w-28">Descriptive (R22)</th>
                  <th className="px-3 py-2 text-center font-medium w-20">TOT</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECT_KEYS.map((key) => (
                  <tr key={key} className="border-t">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{SUBJECT_LABELS[key as SubjectKey]}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={form[key as SubjectKey].assignment}
                        onChange={(e) => setSubject(key as SubjectKey, "assignment", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={form[key as SubjectKey].descriptive}
                        onChange={(e) => setSubject(key as SubjectKey, "descriptive", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center"
                        value={form[key as SubjectKey].tot}
                        onChange={(e) => setSubject(key as SubjectKey, "tot", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : existing ? "Update" : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

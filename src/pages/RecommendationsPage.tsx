import { Link } from "react-router-dom";
import { Lightbulb, Loader2 } from "lucide-react";
import { useStudents } from "@/context/StudentContext";
import { Student, SUBJECT_KEYS, SUBJECT_LABELS, SubjectKey } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function totalMarks(s: Student) {
  return SUBJECT_KEYS.reduce((sum, key) => sum + (s[key as SubjectKey].tot || 0), 0);
}

export default function RecommendationsPage() {
  const { students, loading } = useStudents();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
        <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
        <p className="mb-4 text-muted-foreground">Add students first to see recommendations.</p>
        <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Recommendations</h1>
      <p className="mb-6 text-muted-foreground text-sm">Subject-wise performance and improvement suggestions.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const total = totalMarks(s);
          const weakSubjects = SUBJECT_KEYS.filter((k) => s[k as SubjectKey].tot < 50);
          return (
            <Card key={s._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{s.htno}</span>
                  <span className={`text-sm font-normal ${total < 300 ? "text-destructive" : "text-success"}`}>
                    Total: {total}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {SUBJECT_KEYS.map((k) => {
                  const sub = s[k as SubjectKey];
                  return (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {SUBJECT_LABELS[k as SubjectKey].split(" ").slice(0, 3).join(" ")}
                      </span>
                      <span className={`font-medium text-xs ${sub.tot < 50 ? "text-destructive" : ""}`}>
                        {sub.tot}
                      </span>
                    </div>
                  );
                })}
                {weakSubjects.length > 0 && (
                  <div className="mt-2 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
                    Needs improvement: {weakSubjects.map((k) => SUBJECT_LABELS[k as SubjectKey].split(" ")[0]).join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Loader2, Search } from "lucide-react";
import { useStudents } from "@/context/StudentContext";
import { Student, SUBJECT_KEYS, SUBJECT_LABELS, SubjectKey, SECTIONS } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAX_TOT = 35;

function totalMarks(s: Student) {
  return SUBJECT_KEYS.reduce((sum, k) => sum + (s[k as SubjectKey].tot || 0), 0);
}

function pct(val: number, max = MAX_TOT) {
  return +((val / max) * 100).toFixed(1);
}

function grade(tot: number) {
  const p = pct(tot);
  if (p >= 90) return { label: "O",  color: "text-emerald-600" };
  if (p >= 80) return { label: "A+", color: "text-green-600" };
  if (p >= 70) return { label: "A",  color: "text-blue-600" };
  if (p >= 60) return { label: "B+", color: "text-sky-600" };
  if (p >= 50) return { label: "B",  color: "text-yellow-600" };
  return           { label: "F",  color: "text-red-600" };
}

export default function RecommendationsPage() {
  const { students, loading } = useStudents();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("");

  const filtered = useMemo(() => {
    let s = students;
    if (section) s = s.filter((st) => st.section === section);
    if (query)   s = s.filter((st) => st.htno.toLowerCase().includes(query.toLowerCase()));
    return s;
  }, [students, section, query]);

  const maxPossible = SUBJECT_KEYS.length * MAX_TOT;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (students.length === 0) return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
      <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
      <p className="mb-4 text-muted-foreground">Add students first to see recommendations.</p>
      <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Go to Students
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Recommendations</h1>
      <p className="mb-5 text-muted-foreground text-sm">Subject-wise performance and improvement suggestions.</p>

      {/* ── Search + Section Filter ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search HTNO..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 w-48 h-9"
          />
        </div>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm h-9"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(query || section) && (
          <button
            onClick={() => { setQuery(""); setSection(""); }}
            className="rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-muted"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {students.length} students
          {section ? ` · ${section}` : ""}
        </span>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No students match the current filters.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const total = totalMarks(s);
          const totalPct = pct(total, maxPossible);
          const weakSubjects = SUBJECT_KEYS.filter((k) => pct(s[k as SubjectKey].tot) < 50);
          const g = grade(total / SUBJECT_KEYS.length);

          return (
            <Card key={s._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{s.htno}</span>
                    {s.section && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {s.section}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${g.color}`}>{g.label}</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Total: {total}/{maxPossible} ({totalPct}%)
                </p>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {SUBJECT_KEYS.map((k) => {
                  const sub = s[k as SubjectKey];
                  const sg = grade(sub.tot);
                  const subPct = pct(sub.tot);
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-16 text-xs text-muted-foreground shrink-0 truncate">
                        {SUBJECT_LABELS[k as SubjectKey].split(" ").slice(0, 2).join(" ")}
                      </span>
                      <div className="flex-1 rounded-full bg-muted h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${subPct < 50 ? "bg-red-500" : subPct < 70 ? "bg-yellow-500" : "bg-emerald-500"}`}
                          style={{ width: `${subPct}%` }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right text-muted-foreground">{sub.tot}/35</span>
                      <span className={`text-xs font-bold w-5 ${sg.color}`}>{sg.label}</span>
                    </div>
                  );
                })}
                {weakSubjects.length > 0 && (
                  <div className="mt-2 rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                    Needs improvement in: {weakSubjects.map((k) => SUBJECT_LABELS[k as SubjectKey]).join(", ")}
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

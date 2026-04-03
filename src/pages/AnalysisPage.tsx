import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Award, AlertTriangle, BarChart3, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStudents } from "@/context/StudentContext";
import { Student, SUBJECT_KEYS, SUBJECT_LABELS, SubjectKey } from "@/types/student";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function totalMarks(s: Student) {
  return SUBJECT_KEYS.reduce((sum, key) => sum + (s[key as SubjectKey].tot || 0), 0);
}

function avgTot(s: Student) {
  return totalMarks(s) / SUBJECT_KEYS.length;
}

export default function AnalysisPage() {
  const { students, loading } = useStudents();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => students.filter((s) => s.htno.toLowerCase().includes(query.toLowerCase())),
    [students, query]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => totalMarks(b) - totalMarks(a)), [filtered]);

  const subjectAverages = useMemo(
    () =>
      SUBJECT_KEYS.map((key) => ({
        name: SUBJECT_LABELS[key as SubjectKey].split(" ").slice(0, 3).join(" "),
        "Avg TOT": students.length
          ? +(students.reduce((s, st) => s + st[key as SubjectKey].tot, 0) / students.length).toFixed(1)
          : 0,
      })),
    [students]
  );

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
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
        <p className="mb-4 text-muted-foreground">Add students first to see analysis.</p>
        <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to Students
        </Link>
      </div>
    );
  }

  const avgTotal = students.reduce((s, st) => s + totalMarks(st), 0) / students.length;
  const topPerformers = [...students].sort((a, b) => totalMarks(b) - totalMarks(a)).slice(0, 5);
  const weakStudents = students.filter((s) => avgTot(s) < 50);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Analysis Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Students", value: students.length, icon: Users },
          { label: "Avg Total Marks", value: avgTotal.toFixed(1), icon: BarChart3 },
          { label: "Top Performers", value: topPerformers.length, icon: Award },
          { label: "Need Attention", value: weakStudents.length, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject averages chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Average TOT per Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectAverages} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" interval={0} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Avg TOT" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>All Students</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search HTNO..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-48 h-8"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">HTNO</th>
                  {SUBJECT_KEYS.map((k) => (
                    <th key={k} className="pb-3 font-medium text-xs">
                      {SUBJECT_LABELS[k as SubjectKey].split(" ").slice(0, 2).join(" ")}
                    </th>
                  ))}
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => (
                  <tr key={s._id} className="border-b last:border-0">
                    <td className="py-2 font-bold text-primary">#{i + 1}</td>
                    <td className="py-2 font-medium">{s.htno}</td>
                    {SUBJECT_KEYS.map((k) => (
                      <td key={k} className={`py-2 ${s[k as SubjectKey].tot < 50 ? "text-destructive font-semibold" : ""}`}>
                        {s[k as SubjectKey].tot}
                      </td>
                    ))}
                    <td className="py-2 font-bold">{totalMarks(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

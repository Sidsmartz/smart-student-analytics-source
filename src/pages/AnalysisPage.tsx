import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Award, AlertTriangle, BarChart3, Search, Loader2, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStudents } from "@/context/StudentContext";
import { Student, SUBJECT_KEYS, SUBJECT_LABELS, SubjectKey, SECTIONS } from "@/types/student";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell,
} from "recharts";

// Short labels for charts
const SHORT: Record<SubjectKey, string> = {
  computerOrientedStatisticalMethods: "COSM",
  businessEconomicsAndFinancialAnalysis: "BEFA",
  dataAnalyticsUsingR: "DAR",
  objectOrientedProgrammingThroughJava: "OOPJ",
  designAndAnalysisOfAlgorithms: "DAA",
  dataAnalyticsUsingRLab: "DAR Lab",
  objectOrientedProgrammingThroughJavaLab: "OOPJ Lab",
  realTimeResearchProject: "RTRP",
};

const COLORS = [
  "hsl(220,70%,50%)", "hsl(160,60%,45%)", "hsl(38,92%,50%)",
  "hsl(0,72%,55%)",   "hsl(280,60%,55%)", "hsl(200,70%,50%)",
  "hsl(340,70%,55%)", "hsl(100,55%,45%)",
];

const MAX_TOT = 35; // each subject TOT is out of 35

function totalMarks(s: Student) {
  return SUBJECT_KEYS.reduce((sum, k) => sum + (s[k as SubjectKey].tot || 0), 0);
}
function avgTot(s: Student) {
  return totalMarks(s) / SUBJECT_KEYS.length;
}
function pct(val: number, max = MAX_TOT) {
  return +((val / max) * 100).toFixed(1);
}

// Grade based on /35
function grade(tot: number) {
  const p = pct(tot);
  if (p >= 90) return { label: "O",  color: "text-emerald-600" };
  if (p >= 80) return { label: "A+", color: "text-green-600" };
  if (p >= 70) return { label: "A",  color: "text-blue-600" };
  if (p >= 60) return { label: "B+", color: "text-sky-600" };
  if (p >= 50) return { label: "B",  color: "text-yellow-600" };
  return           { label: "F",  color: "text-red-600" };
}

export default function AnalysisPage() {
  const { students, loading } = useStudents();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("");
  const [selectedHtno, setSelectedHtno] = useState<string>("");

  // Base pool filtered by section + search
  const base = useMemo(() => {
    let s = students;
    if (section) s = s.filter((st) => st.section === section);
    if (query)   s = s.filter((st) => st.htno.toLowerCase().includes(query.toLowerCase()));
    return s;
  }, [students, section, query]);

  const sorted = useMemo(() => [...base].sort((a, b) => totalMarks(b) - totalMarks(a)), [base]);

  // ── Derived metrics ──────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!base.length) return null;
    const n = base.length;
    const totals = base.map(totalMarks);
    const avgTotal = totals.reduce((a, b) => a + b, 0) / n;
    const maxTotal = Math.max(...totals);
    const minTotal = Math.min(...totals);
    const passCount = base.filter((s) => avgTot(s) >= MAX_TOT * 0.4).length;
    const weakCount = base.filter((s) => avgTot(s) < MAX_TOT * 0.5).length;

    const subjectAvg = SUBJECT_KEYS.map((k) => ({
      key: k,
      short: SHORT[k as SubjectKey],
      label: SUBJECT_LABELS[k as SubjectKey],
      avgTot:    +(base.reduce((s, st) => s + st[k as SubjectKey].tot, 0) / n).toFixed(2),
      avgAssign: +(base.reduce((s, st) => s + st[k as SubjectKey].assignment, 0) / n).toFixed(2),
      avgDesc:   +(base.reduce((s, st) => s + st[k as SubjectKey].descriptive, 0) / n).toFixed(2),
    }));

    const gradeDist: Record<string, number> = { O: 0, "A+": 0, A: 0, "B+": 0, B: 0, F: 0 };
    base.forEach((s) => SUBJECT_KEYS.forEach((k) => { gradeDist[grade(s[k as SubjectKey].tot).label]++; }));

    const buckets = [
      { range: "0–7",   count: 0 },
      { range: "8–14",  count: 0 },
      { range: "15–21", count: 0 },
      { range: "22–28", count: 0 },
      { range: "29–35", count: 0 },
    ];
    base.forEach((s) => SUBJECT_KEYS.forEach((k) => {
      const t = s[k as SubjectKey].tot;
      if (t <= 7)       buckets[0].count++;
      else if (t <= 14) buckets[1].count++;
      else if (t <= 21) buckets[2].count++;
      else if (t <= 28) buckets[3].count++;
      else              buckets[4].count++;
    }));

    const scatterData = base.map((s) => ({
      htno: s.htno,
      assign: +(SUBJECT_KEYS.reduce((a, k) => a + s[k as SubjectKey].assignment, 0) / SUBJECT_KEYS.length).toFixed(1),
      desc:   +(SUBJECT_KEYS.reduce((a, k) => a + s[k as SubjectKey].descriptive, 0) / SUBJECT_KEYS.length).toFixed(1),
      total:  totalMarks(s),
    }));

    const top5    = [...base].sort((a, b) => totalMarks(b) - totalMarks(a)).slice(0, 5);
    const bottom5 = [...base].sort((a, b) => totalMarks(a) - totalMarks(b)).slice(0, 5);

    return { n, avgTotal, maxTotal, minTotal, passCount, weakCount, subjectAvg, gradeDist, buckets, scatterData, top5, bottom5 };
  }, [base]);

  // Per-student radar data
  const selectedStudent = useMemo(
    () => base.find((s) => s.htno === selectedHtno),
    [base, selectedHtno]
  );
  const radarData = useMemo(() => {
    if (!selectedStudent) return [];
    return SUBJECT_KEYS.map((k) => ({
      subject: SHORT[k as SubjectKey],
      score: selectedStudent[k as SubjectKey].tot,
      fullMark: MAX_TOT,
    }));
  }, [selectedStudent]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!students.length) return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
      <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
      <p className="mb-4 text-muted-foreground">Add students first to see analysis.</p>
      <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go to Students</Link>
    </div>
  );

  const m = metrics;
  const maxPossible = SUBJECT_KEYS.length * MAX_TOT;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analysis Dashboard</h1>

      {/* ── Search + Section Filter ── */}
      <div className="flex flex-wrap items-center gap-3">
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
          Showing {base.length} of {students.length} students
          {section ? ` · ${section}` : ""}
        </span>
      </div>

      {!m ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No students match the current filters.</p>
      ) : (<>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Total Students",   value: m.n,                          icon: Users,        color: "text-blue-600" },
          { label: "Class Avg",        value: `${m.avgTotal.toFixed(1)}/${maxPossible}`, icon: BarChart3,    color: "text-indigo-600" },
          { label: "Avg %",            value: `${pct(m.avgTotal, maxPossible)}%`,        icon: TrendingUp,   color: "text-emerald-600" },
          { label: "Highest Total",    value: `${m.maxTotal}/${maxPossible}`,            icon: Award,        color: "text-green-600" },
          { label: "Lowest Total",     value: `${m.minTotal}/${maxPossible}`,            icon: TrendingDown, color: "text-orange-500" },
          { label: "Need Attention",   value: m.weakCount,                  icon: AlertTriangle, color: "text-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-muted p-2">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 1: Subject Avg TOT + Assignment vs Descriptive ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg TOT per Subject (out of {MAX_TOT})</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={m.subjectAvg} margin={{ bottom: 10, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="short" fontSize={11}
                  label={{ value: "Subject", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  domain={[0, MAX_TOT]} fontSize={11}
                  label={{ value: "Avg TOT (out of 35)", angle: -90, position: "insideLeft", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip formatter={(v: number) => [`${v} / ${MAX_TOT}`, "Avg TOT"]} />
                <Legend verticalAlign="top" formatter={() => "Avg TOT"} />
                <Bar dataKey="avgTot" name="Avg TOT" radius={[4, 4, 0, 0]}>
                  {m.subjectAvg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Assignment vs Descriptive per Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={m.subjectAvg} margin={{ bottom: 10, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="short" fontSize={11}
                  label={{ value: "Subject", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  fontSize={11}
                  label={{ value: "Avg Marks", angle: -90, position: "insideLeft", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip formatter={(v: number, name: string) => [`${v}`, name]} />
                <Legend verticalAlign="top" />
                <Bar dataKey="avgAssign" name="Assignment" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgDesc"   name="Descriptive" fill="hsl(160,60%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Subject pass rate ── */}
      <Card>
          <CardHeader><CardTitle className="text-sm">Subject-wise Pass Rate (≥40% of 35)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={SUBJECT_KEYS.map((k) => ({
                  subject: SHORT[k as SubjectKey],
                  "Pass %": +(base.filter((s) => pct(s[k as SubjectKey].tot) >= 40).length / (base.length || 1) * 100).toFixed(1),
                  "Fail %": +(base.filter((s) => pct(s[k as SubjectKey].tot) < 40).length / (base.length || 1) * 100).toFixed(1),
                }))}
                margin={{ bottom: 10, left: 16, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subject" fontSize={11}
                  label={{ value: "Subject", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  domain={[0, 100]} fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: "% of Students", angle: -90, position: "insideLeft", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Legend verticalAlign="top" />
                <Bar dataKey="Pass %" stackId="a" fill="hsl(160,60%,45%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Fail %" stackId="a" fill="hsl(0,72%,55%)"   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
      </Card>

      {/* ── Row 4: Top 5 vs Bottom 5 total marks ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-emerald-600" /> Top 5 Students</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={m.top5.map((s) => ({ htno: s.htno, Total: totalMarks(s) }))} layout="vertical" margin={{ right: 20, left: 0, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number" domain={[0, maxPossible]} fontSize={11}
                  label={{ value: `Total Marks (out of ${maxPossible})`, position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis type="category" dataKey="htno" fontSize={10} width={95} />
                <Tooltip formatter={(v: number) => [`${v} / ${maxPossible}`, "Total Marks"]} />
                <Legend verticalAlign="top" formatter={() => "Total Marks"} />
                <Bar dataKey="Total" name="Total Marks" fill="hsl(160,60%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Bottom 5 Students</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={m.bottom5.map((s) => ({ htno: s.htno, Total: totalMarks(s) }))} layout="vertical" margin={{ right: 20, left: 0, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number" domain={[0, maxPossible]} fontSize={11}
                  label={{ value: `Total Marks (out of ${maxPossible})`, position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis type="category" dataKey="htno" fontSize={10} width={95} />
                <Tooltip formatter={(v: number) => [`${v} / ${maxPossible}`, "Total Marks"]} />
                <Legend verticalAlign="top" formatter={() => "Total Marks"} />
                <Bar dataKey="Total" name="Total Marks" fill="hsl(0,72%,55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Per-student Radar ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Student Subject Radar</span>
            <select
              className="rounded border bg-background px-2 py-1 text-xs"
              value={selectedHtno}
              onChange={(e) => setSelectedHtno(e.target.value)}
            >
              <option value="">Select student...</option>
              {base.map((s) => <option key={s._id} value={s.htno}>{s.htno}</option>)}
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedStudent ? (
            <div className="grid gap-6 md:grid-cols-2">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, MAX_TOT]} fontSize={9} tickCount={4} tickFormatter={(v) => `${v}`} />
                  <Radar name={selectedStudent.htno} dataKey="score" stroke="hsl(220,70%,50%)" fill="hsl(220,70%,50%)" fillOpacity={0.35} />
                  <Tooltip formatter={(v: number) => [`${v} / ${MAX_TOT}`, "TOT Score"]} />
                  <Legend verticalAlign="bottom" formatter={(value) => `${value} — TOT out of ${MAX_TOT}`} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {SUBJECT_KEYS.map((k) => {
                  const sub = selectedStudent[k as SubjectKey];
                  const g = grade(sub.tot);
                  const percentage = pct(sub.tot);
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-muted-foreground shrink-0">{SHORT[k as SubjectKey]}</span>
                      <div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs w-14 text-right">{sub.tot}/{MAX_TOT}</span>
                      <span className={`text-xs font-bold w-6 ${g.color}`}>{g.label}</span>
                    </div>
                  );
                })}
                <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  Total: <span className="font-bold">{totalMarks(selectedStudent)}/{maxPossible}</span>
                  <span className="ml-2 text-muted-foreground">({pct(totalMarks(selectedStudent), maxPossible)}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Select a student to view their subject-wise radar.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Full Rankings Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Full Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">HTNO</th>
                  {SUBJECT_KEYS.map((k) => (
                    <th key={k} className="pb-2 font-medium text-center">{SHORT[k as SubjectKey]}</th>
                  ))}
                  <th className="pb-2 font-medium text-center">Total</th>
                  <th className="pb-2 font-medium text-center">%</th>
                  <th className="pb-2 font-medium text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => {
                  const tot = totalMarks(s);
                  const percentage = pct(tot, maxPossible);
                  const g = grade(tot / SUBJECT_KEYS.length);
                  return (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 font-bold text-primary">#{i + 1}</td>
                      <td className="py-2 font-medium">{s.htno}</td>
                      {SUBJECT_KEYS.map((k) => {
                        const t = s[k as SubjectKey].tot;
                        return (
                          <td key={k} className={`py-2 text-center ${t < MAX_TOT * 0.4 ? "text-red-600 font-semibold" : ""}`}>
                            {t}
                          </td>
                        );
                      })}
                      <td className="py-2 text-center font-bold">{tot}/{maxPossible}</td>
                      <td className="py-2 text-center">{percentage}%</td>
                      <td className={`py-2 text-center font-bold ${g.color}`}>{g.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </>)}
    </div>
  );
}

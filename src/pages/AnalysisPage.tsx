import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingDown, Award, AlertTriangle, BarChart3, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents } from "@/context/StudentContext";
import { analyzeStudents } from "@/lib/analytics";
import { StudentClass } from "@/types/student";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(220, 70%, 45%)",
  "hsl(172, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
  "hsl(280, 60%, 50%)",
  "hsl(152, 60%, 40%)",
];

const CLASSES: Array<StudentClass | "All"> = ["All", "CSD-A", "CSD-B", "CSD-C", "CSD-D"];

const AnalysisPage = () => {
  const { students } = useStudents();
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<StudentClass | "All">("All");
  const [attendanceMin, setAttendanceMin] = useState("");
  const [attendanceMax, setAttendanceMax] = useState("");
  const [marksMin, setMarksMin] = useState("");
  const [marksMax, setMarksMax] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const classFiltered = useMemo(
    () => (selectedClass === "All" ? students : students.filter((s) => s.class === selectedClass)),
    [students, selectedClass]
  );

  const analysis = useMemo(() => analyzeStudents(classFiltered), [classFiltered]);

  // Combined filter for tables
  const fullyFiltered = useMemo(() => {
    const attMin = attendanceMin !== "" ? parseFloat(attendanceMin) : 0;
    const attMax = attendanceMax !== "" ? parseFloat(attendanceMax) : 100;
    const mMin = marksMin !== "" ? parseFloat(marksMin) : 0;
    const mMax = marksMax !== "" ? parseFloat(marksMax) : 200;
    return classFiltered.filter((s) => {
      const avg = (s.mid1 + s.mid2) / 2;
      return s.attendance >= attMin && s.attendance <= attMax && avg >= mMin && avg <= mMax;
    });
  }, [classFiltered, attendanceMin, attendanceMax, marksMin, marksMax]);

  const matchesQuery = (name: string) => name.toLowerCase().includes(query.toLowerCase());

  if (students.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
        <p className="mb-4 text-muted-foreground">Upload student data first to see analysis.</p>
        <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to Upload
        </Link>
      </div>
    );
  }

  // Chart data
  const mid1Distribution = [
    { range: "0-30", count: classFiltered.filter((s) => s.mid1 < 30).length },
    { range: "30-50", count: classFiltered.filter((s) => s.mid1 >= 30 && s.mid1 < 50).length },
    { range: "50-70", count: classFiltered.filter((s) => s.mid1 >= 50 && s.mid1 < 70).length },
    { range: "70-90", count: classFiltered.filter((s) => s.mid1 >= 70 && s.mid1 < 90).length },
    { range: "90-100", count: classFiltered.filter((s) => s.mid1 >= 90).length },
  ];

  const mid2Distribution = [
    { range: "0-30", count: classFiltered.filter((s) => s.mid2 < 30).length },
    { range: "30-50", count: classFiltered.filter((s) => s.mid2 >= 30 && s.mid2 < 50).length },
    { range: "50-70", count: classFiltered.filter((s) => s.mid2 >= 50 && s.mid2 < 70).length },
    { range: "70-90", count: classFiltered.filter((s) => s.mid2 >= 70 && s.mid2 < 90).length },
    { range: "90-100", count: classFiltered.filter((s) => s.mid2 >= 90).length },
  ];

  const midComparisonData = mid1Distribution.map((d, i) => ({
    range: d.range,
    "Mid-1": d.count,
    "Mid-2": mid2Distribution[i].count,
  }));

  const attendanceDistribution = [
    { range: "<50%", count: classFiltered.filter((s) => s.attendance < 50).length },
    { range: "50-65%", count: classFiltered.filter((s) => s.attendance >= 50 && s.attendance < 65).length },
    { range: "65-75%", count: classFiltered.filter((s) => s.attendance >= 65 && s.attendance < 75).length },
    { range: "75-90%", count: classFiltered.filter((s) => s.attendance >= 75 && s.attendance < 90).length },
    { range: "≥90%", count: classFiltered.filter((s) => s.attendance >= 90).length },
  ];

  const skillData = Object.entries(analysis.skillDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const selectedStudentData = students.find((s) => s.name === selectedStudent);

  const statCards = [
    { label: "Total Students", value: analysis.totalStudents, icon: Users, color: "text-primary" },
    { label: "Weak Students", value: analysis.weakStudents.length, icon: AlertTriangle, color: "text-warning" },
    { label: "Avg Mid-1", value: analysis.averageMid1.toFixed(1), icon: TrendingDown, color: "text-accent" },
    { label: "Avg Mid-2", value: analysis.averageMid2.toFixed(1), icon: TrendingDown, color: "text-primary" },
    { label: "Avg Attendance", value: `${analysis.averageAttendance.toFixed(1)}%`, icon: Award, color: "text-success" },
  ];

  const filteredTopPerformers = analysis.topPerformers.filter((s) => matchesQuery(s.name));
  const filteredWeakStudents = analysis.weakStudents
    .filter((s) => matchesQuery(s.name))
    .filter((s) => {
      const attMin = attendanceMin !== "" ? parseFloat(attendanceMin) : 0;
      const attMax = attendanceMax !== "" ? parseFloat(attendanceMax) : 100;
      return s.attendance >= attMin && s.attendance <= attMax;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Student Analysis Dashboard</h1>

      {/* Top bar: search + class only */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as StudentClass | "All")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            {CLASSES.map((c) => (
              <SelectItem key={c} value={c}>{c === "All" ? "All Classes" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[var(--shadow-card)]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg bg-muted p-2 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mid-1 vs Mid-2 Comparison */}
      <Card className="mb-6 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Mid-1 vs Mid-2 Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={midComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
              <XAxis dataKey="range" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Mid-1" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Mid-2" fill="hsl(172, 55%, 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Skills Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={skillData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                  {skillData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Lookup */}
      <Card className="mb-8 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base">Student Performance Across Mids</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a student..." />
            </SelectTrigger>
            <SelectContent>
              {[...students].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStudentData ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Class</span>
                  <span className="font-medium">{selectedStudentData.class || "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Mid-1 Score</span>
                  <span className={`font-bold ${selectedStudentData.mid1 < 50 ? "text-destructive" : "text-success"}`}>
                    {selectedStudentData.mid1}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Mid-2 Score</span>
                  <span className={`font-bold ${selectedStudentData.mid2 < 50 ? "text-destructive" : "text-success"}`}>
                    {selectedStudentData.mid2}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <span className="font-bold">
                    {((selectedStudentData.mid1 + selectedStudentData.mid2) / 2).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Attendance</span>
                  <span className={`font-bold ${selectedStudentData.attendance < 75 ? "text-warning" : "text-success"}`}>
                    {selectedStudentData.attendance}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Trend</span>
                  <span className={`font-medium ${selectedStudentData.mid2 > selectedStudentData.mid1 ? "text-success" : selectedStudentData.mid2 < selectedStudentData.mid1 ? "text-destructive" : "text-muted-foreground"}`}>
                    {selectedStudentData.mid2 > selectedStudentData.mid1
                      ? `▲ +${(selectedStudentData.mid2 - selectedStudentData.mid1).toFixed(1)} improved`
                      : selectedStudentData.mid2 < selectedStudentData.mid1
                      ? `▼ ${(selectedStudentData.mid2 - selectedStudentData.mid1).toFixed(1)} declined`
                      : "→ No change"}
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{ name: selectedStudentData.name.split(" ")[0], "Mid-1": selectedStudentData.mid1, "Mid-2": selectedStudentData.mid2 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Mid-1" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Mid-2" fill="hsl(172, 55%, 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a student to view their performance breakdown.</p>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="mb-8 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-success" /> Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Class</th>
                  <th className="pb-3 font-medium">Mid-1</th>
                  <th className="pb-3 font-medium">Mid-2</th>
                  <th className="pb-3 font-medium">Avg</th>
                  <th className="pb-3 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopPerformers.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-bold text-primary">#{i + 1}</td>
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3">
                      {s.class ? <Badge variant="outline" className="text-xs">{s.class}</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3">{s.mid1}</td>
                    <td className="py-3">{s.mid2}</td>
                    <td className="py-3 font-medium">{((s.mid1 + s.mid2) / 2).toFixed(1)}</td>
                    <td className="py-3">{s.attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Students Table */}
      <Card className="mb-8 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" /> Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters inline */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Attendance:</span>
              <Input placeholder="Min%" value={attendanceMin} onChange={(e) => setAttendanceMin(e.target.value)} className="w-16 h-8" type="number" min={0} max={100} />
              <span className="text-muted-foreground text-xs">–</span>
              <Input placeholder="Max%" value={attendanceMax} onChange={(e) => setAttendanceMax(e.target.value)} className="w-16 h-8" type="number" min={0} max={100} />
              <button onClick={() => { setAttendanceMin("75"); setAttendanceMax("100"); }} className="rounded-md bg-background border px-2 py-1 text-xs hover:bg-muted">&gt;75%</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Avg Marks:</span>
              <Input placeholder="Min" value={marksMin} onChange={(e) => setMarksMin(e.target.value)} className="w-16 h-8" type="number" min={0} />
              <span className="text-muted-foreground text-xs">–</span>
              <Input placeholder="Max" value={marksMax} onChange={(e) => setMarksMax(e.target.value)} className="w-16 h-8" type="number" min={0} />
            </div>
            {(attendanceMin || attendanceMax || marksMin || marksMax) && (
              <button
                onClick={() => { setAttendanceMin(""); setAttendanceMax(""); setMarksMin(""); setMarksMax(""); }}
                className="rounded-md bg-background border px-2 py-1 text-xs hover:bg-muted"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {fullyFiltered.filter((s) => matchesQuery(s.name)).length} of {classFiltered.length} students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Class</th>
                  <th className="pb-3 font-medium">Mid-1</th>
                  <th className="pb-3 font-medium">Mid-2</th>
                  <th className="pb-3 font-medium">Avg</th>
                  <th className="pb-3 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {fullyFiltered.filter((s) => matchesQuery(s.name)).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No students match the current filters.</td>
                  </tr>
                ) : (
                  fullyFiltered.filter((s) => matchesQuery(s.name)).map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3">
                        {s.class ? <Badge variant="outline" className="text-xs">{s.class}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3">{s.mid1}</td>
                      <td className="py-3">{s.mid2}</td>
                      <td className="py-3">{((s.mid1 + s.mid2) / 2).toFixed(1)}</td>
                      <td className={`py-3 ${s.attendance < 75 ? "font-semibold text-warning" : ""}`}>{s.attendance}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weak Students */}
      {filteredWeakStudents.length > 0 && (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Weak Students (Avg &lt; 50 or Attendance &lt; 75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Class</th>
                    <th className="pb-3 font-medium">Mid-1</th>
                    <th className="pb-3 font-medium">Mid-2</th>
                    <th className="pb-3 font-medium">Attendance</th>
                    <th className="pb-3 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWeakStudents.map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className="py-3">
                        {s.class ? <Badge variant="outline" className="text-xs">{s.class}</Badge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className={`py-3 ${s.mid1 < 50 ? "font-semibold text-destructive" : ""}`}>{s.mid1}</td>
                      <td className={`py-3 ${s.mid2 < 50 ? "font-semibold text-destructive" : ""}`}>{s.mid2}</td>
                      <td className={`py-3 ${s.attendance < 75 ? "font-semibold text-warning" : ""}`}>{s.attendance}%</td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(s.mid1 + s.mid2) / 2 < 50 && <Badge variant="destructive" className="text-xs">Low Marks</Badge>}
                          {s.attendance < 75 && <Badge className="bg-warning text-warning-foreground text-xs">Low Attendance</Badge>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisPage;

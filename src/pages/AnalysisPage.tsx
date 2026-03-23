import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingDown, Award, AlertTriangle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/context/StudentContext";
import { analyzeStudents } from "@/lib/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(220, 70%, 45%)",
  "hsl(172, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
  "hsl(280, 60%, 50%)",
  "hsl(152, 60%, 40%)",
];

const AnalysisPage = () => {
  const { students } = useStudents();
  const analysis = useMemo(() => analyzeStudents(students), [students]);

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

  const marksDistribution = [
    { range: "0-30", count: students.filter((s) => s.marks < 30).length },
    { range: "30-50", count: students.filter((s) => s.marks >= 30 && s.marks < 50).length },
    { range: "50-70", count: students.filter((s) => s.marks >= 50 && s.marks < 70).length },
    { range: "70-90", count: students.filter((s) => s.marks >= 70 && s.marks < 90).length },
    { range: "90-100", count: students.filter((s) => s.marks >= 90).length },
  ];

  const skillData = Object.entries(analysis.skillDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const statCards = [
    { label: "Total Students", value: analysis.totalStudents, icon: Users, color: "text-primary" },
    { label: "Weak Students", value: analysis.weakStudents.length, icon: AlertTriangle, color: "text-warning" },
    { label: "Avg Marks", value: analysis.averageMarks.toFixed(1), icon: TrendingDown, color: "text-accent" },
    { label: "Avg Attendance", value: `${analysis.averageAttendance.toFixed(1)}%`, icon: Award, color: "text-success" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Student Analysis Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-[var(--shadow-card)]">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Marks Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={marksDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 90%)" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220, 70%, 45%)" radius={[6, 6, 0, 0]} />
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
                  <th className="pb-3 font-medium">Marks</th>
                  <th className="pb-3 font-medium">Attendance</th>
                  <th className="pb-3 font-medium">Skills</th>
                </tr>
              </thead>
              <tbody>
                {analysis.topPerformers.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-bold text-primary">#{i + 1}</td>
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3">{s.marks}</td>
                    <td className="py-3">{s.attendance}%</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.skills.map((sk) => (
                          <Badge key={sk} variant="secondary" className="text-xs">{sk}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weak Students */}
      {analysis.weakStudents.length > 0 && (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Weak Students (Marks &lt; 50 or Attendance &lt; 75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Marks</th>
                    <th className="pb-3 font-medium">Attendance</th>
                    <th className="pb-3 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.weakStudents.map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-medium">{s.name}</td>
                      <td className={`py-3 ${s.marks < 50 ? "font-semibold text-destructive" : ""}`}>{s.marks}</td>
                      <td className={`py-3 ${s.attendance < 75 ? "font-semibold text-warning" : ""}`}>{s.attendance}%</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {s.marks < 50 && <Badge variant="destructive" className="text-xs">Low Marks</Badge>}
                          {s.attendance < 75 && (
                            <Badge className="bg-warning text-warning-foreground text-xs">Low Attendance</Badge>
                          )}
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

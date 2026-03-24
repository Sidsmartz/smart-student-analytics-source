import { useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, CalendarDays, Briefcase, Sparkles, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStudents } from "@/context/StudentContext";
import { getEventRecommendations, getJobRecommendations } from "@/lib/analytics";

const RecommendationsPage = () => {
  const { students } = useStudents();
  const [query, setQuery] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(query.toLowerCase()))
  );

  if (students.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
        <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Data Available</h2>
        <p className="mb-4 text-muted-foreground">Upload student data first to see recommendations.</p>
        <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Recommendations</h1>
      <p className="mb-4 text-muted-foreground">Personalized event and career suggestions based on each student's skills.</p>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground">No students match "{query}".</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((student, i) => {
          const events = getEventRecommendations(student);
          const jobs = getJobRecommendations(student);

          return (
            <Card key={i} className="shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base">{student.name}</span>
                  <Badge variant={student.marks >= 50 && student.attendance >= 75 ? "secondary" : "destructive"} className="text-xs">
                    {student.marks}% | {student.attendance}%
                  </Badge>
                </CardTitle>
                <div className="flex flex-wrap gap-1 pt-1">
                  {student.skills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Recommended Events
                  </div>
                  <ul className="space-y-1">
                    {events.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Briefcase className="h-3.5 w-3.5" />
                    Job / Internship Suggestions
                  </div>
                  <ul className="space-y-1">
                    {jobs.map((j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-3 w-3 text-accent" />
                        {j}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPage;

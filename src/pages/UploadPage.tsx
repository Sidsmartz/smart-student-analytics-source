import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents } from "@/context/StudentContext";
import { parseCSV } from "@/lib/csvParser";
import { useToast } from "@/hooks/use-toast";
import { StudentClass } from "@/types/student";

const CLASSES: StudentClass[] = ["CSD-A", "CSD-B", "CSD-C", "CSD-D"];

const SAMPLE_CSV = `Name,Mid1,Mid2,Attendance,Skills,Events,Resume
Alice Johnson,82,88,92,Python;React;ML,Hackathon;Workshop,Experienced in web development and machine learning
Bob Smith,40,45,68,Java;SQL,Code Sprint,Java developer with database skills
Carol Williams,70,76,88,JavaScript;CSS;HTML,Frontend Fest;Design Sprint,Frontend developer with design skills
David Brown,89,93,95,Python;Data Science;ML,Kaggle;AI Bootcamp,Data scientist with strong analytics background
Eve Davis,35,42,55,Communication;Leadership,,Strong communication and team management skills
Frank Miller,65,70,78,C++;Java;Cloud,Hackathon,Systems programmer with cloud experience
Grace Lee,52,58,82,React;JavaScript;Design,UI Hackathon;Web Dev,Creative frontend developer
Henry Wilson,45,50,71,Python;SQL,Workshop,Backend developer learning data science
Ivy Taylor,76,82,90,ML;Python;Cloud,AI Bootcamp;Cloud Workshop,ML engineer with cloud deployment skills
Jack Anderson,30,38,60,HTML;CSS,,Web design enthusiast`;

const UploadPage = () => {
  const { students, setStudents, assignClass } = useStudents();
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast({ title: "No data found", description: "CSV appears empty or malformed.", variant: "destructive" });
          return;
        }
        setStudents(parsed);
        toast({ title: "Success!", description: `Loaded ${parsed.length} students.` });
      };
      reader.readAsText(file);
    },
    [setStudents, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const loadSample = () => {
    const parsed = parseCSV(SAMPLE_CSV).map((s) => ({
      ...s,
      class: CLASSES[Math.floor(Math.random() * CLASSES.length)],
    }));
    setStudents(parsed);
    toast({ title: "Sample loaded!", description: `Loaded ${parsed.length} sample students.` });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Upload Student Data</h1>
        <p className="text-muted-foreground">
          Upload a CSV file with student information to generate analytics and recommendations.
        </p>
      </div>

      <Card className="shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            CSV File Upload
          </CardTitle>
          <CardDescription>
            Expected columns: Name, Mid1, Mid2, Attendance, Skills (semicolon-separated), Events, Resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium">Drag & drop your CSV file here</p>
            <p className="mb-4 text-xs text-muted-foreground">or click to browse</p>
            <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload">
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="secondary" className="w-full" onClick={loadSample}>
            Load Sample Data
          </Button>

          {students.length > 0 && (
            <>
              <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{students.length} students loaded successfully</span>
                </div>
                <Button onClick={() => navigate("/analysis")}>
                  View Analysis →
                </Button>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Assign students to a class</p>
                <div className="max-h-64 overflow-y-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Student</th>
                        <th className="px-4 py-2 text-left font-medium">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.name} className="border-t">
                          <td className="px-4 py-2">{s.name}</td>
                          <td className="px-4 py-2">
                            <Select
                              value={s.class || ""}
                              onValueChange={(val) => assignClass(s.name, val as StudentClass)}
                            >
                              <SelectTrigger className="h-8 w-36">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {CLASSES.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {students.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-4 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">No data loaded yet. Upload a CSV or use sample data.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;

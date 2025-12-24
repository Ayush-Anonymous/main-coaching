import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, FileText, ClipboardList, Award } from "lucide-react";

type Test = {
  id: string;
  name: string;
  course_id: string | null;
  batch_id: string | null;
  max_marks: number;
  passing_marks: number;
  test_date: string | null;
  description: string | null;
  is_active: boolean | null;
  courses?: { name: string } | null;
  batches?: { name: string } | null;
};

type Mark = {
  id: string;
  student_id: string;
  test_id: string;
  marks_obtained: number;
  remarks: string | null;
  students?: { full_name: string; enrollment_number: string } | null;
  tests?: { name: string; max_marks: number } | null;
};

type Course = { id: string; name: string };
type Batch = { id: string; name: string; course_id: string | null };
type Student = { id: string; full_name: string; enrollment_number: string };

const initialTestForm = {
  name: "",
  course_id: "",
  batch_id: "",
  max_marks: 100,
  passing_marks: 40,
  test_date: "",
  description: "",
  is_active: true,
};

const Tests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tests, setTests] = useState<Test[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tests");

  const [showTestForm, setShowTestForm] = useState(false);
  const [showMarksForm, setShowMarksForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [testForm, setTestForm] = useState(initialTestForm);
  const [marksForm, setMarksForm] = useState({ test_id: "", student_id: "", marks_obtained: 0, remarks: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [coursesRes, batchesRes, studentsRes] = await Promise.all([
        supabase.from("courses").select("id, name").eq("is_active", true),
        supabase.from("batches").select("id, name, course_id").eq("is_active", true),
        supabase.from("students").select("id, full_name, enrollment_number").eq("status", "active"),
      ]);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
      if (studentsRes.data) setStudents(studentsRes.data);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchTests = async () => {
      if (!user) return;
      setLoading(true);

      let query = supabase.from("tests").select("*, courses(name), batches(name)");
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("test_date", { ascending: false });
      if (error) {
        toast({ title: "Error fetching tests", description: error.message, variant: "destructive" });
      } else {
        setTests(data || []);
      }
      setLoading(false);
    };

    const fetchMarks = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("marks")
        .select("*, students(full_name, enrollment_number), tests(name, max_marks)")
        .order("created_at", { ascending: false });
      if (!error && data) setMarks(data);
    };

    fetchTests();
    fetchMarks();
  }, [user, searchQuery, toast]);

  const handleAddTest = () => {
    setSelectedTest(null);
    setTestForm(initialTestForm);
    setShowTestForm(true);
  };

  const handleEditTest = (t: Test) => {
    setSelectedTest(t);
    setTestForm({
      name: t.name,
      course_id: t.course_id || "",
      batch_id: t.batch_id || "",
      max_marks: t.max_marks,
      passing_marks: t.passing_marks,
      test_date: t.test_date || "",
      description: t.description || "",
      is_active: t.is_active ?? true,
    });
    setShowTestForm(true);
  };

  const handleDeleteTest = (t: Test) => {
    setTestToDelete(t);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    const { error } = await supabase.from("tests").delete().eq("id", testToDelete.id);
    if (error) {
      toast({ title: "Error deleting test", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Test deleted" });
      setTests((prev) => prev.filter((t) => t.id !== testToDelete.id));
    }
    setTestToDelete(null);
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const testData = {
      ...testForm,
      course_id: testForm.course_id || null,
      batch_id: testForm.batch_id || null,
      max_marks: Number(testForm.max_marks),
      passing_marks: Number(testForm.passing_marks),
    };

    if (selectedTest?.id) {
      const { error } = await supabase.from("tests").update(testData).eq("id", selectedTest.id);
      if (error) {
        toast({ title: "Error updating test", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Test updated" });
        setTests((prev) => prev.map((t) => (t.id === selectedTest.id ? { ...t, ...testData } : t)));
        setShowTestForm(false);
      }
    } else {
      const { data, error } = await supabase.from("tests").insert([testData]).select("*, courses(name), batches(name)").single();
      if (error) {
        toast({ title: "Error creating test", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Test created" });
        setTests((prev) => [data, ...prev]);
        setShowTestForm(false);
      }
    }
    setIsSubmitting(false);
  };

  const handleAddMarks = () => {
    setMarksForm({ test_id: "", student_id: "", marks_obtained: 0, remarks: "" });
    setShowMarksForm(true);
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("marks")
      .insert([{
        test_id: marksForm.test_id,
        student_id: marksForm.student_id,
        marks_obtained: Number(marksForm.marks_obtained),
        remarks: marksForm.remarks || null,
      }])
      .select("*, students(full_name, enrollment_number), tests(name, max_marks)")
      .single();

    if (error) {
      if (error.message.includes("duplicate")) {
        toast({ title: "Marks already entered", description: "This student already has marks for this test.", variant: "destructive" });
      } else {
        toast({ title: "Error recording marks", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Marks recorded" });
      setMarks((prev) => [data, ...prev]);
      setShowMarksForm(false);
    }
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Tests &" titleHighlight="Marks" subtitle="Manage examinations and student marks.">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="tests" className="gap-2">
            <FileText className="w-4 h-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="marks" className="gap-2">
            <Award className="w-4 h-4" />
            Marks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button onClick={handleAddTest} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Test
            </Button>
          </div>

          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Test Name</TableHead>
                  <TableHead>Course / Batch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : tests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tests.map((t) => (
                    <TableRow key={t.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-secondary-foreground" />
                          </div>
                          <div className="font-medium">{t.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{t.courses?.name || "-"}</div>
                          <div className="text-muted-foreground">{t.batches?.name || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{t.test_date ? new Date(t.test_date).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Max: {t.max_marks}</div>
                          <div className="text-muted-foreground">Pass: {t.passing_marks}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.is_active ? "default" : "secondary"}>
                          {t.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTest(t)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTest(t)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="marks" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleAddMarks} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Marks
            </Button>
          </div>

          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Student</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No marks recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  marks.map((m) => {
                    const test = tests.find(t => t.id === m.test_id);
                    const isPassed = test ? m.marks_obtained >= test.passing_marks : false;
                    return (
                      <TableRow key={m.id} className="border-border">
                        <TableCell>
                          <div>
                            <div className="font-medium">{m.students?.full_name}</div>
                            <div className="text-sm text-muted-foreground">{m.students?.enrollment_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{m.tests?.name}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{m.marks_obtained}</span>
                          <span className="text-muted-foreground">/{m.tests?.max_marks}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isPassed ? "default" : "destructive"}>
                            {isPassed ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{m.remarks || "-"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Form Dialog */}
      <Dialog open={showTestForm} onOpenChange={setShowTestForm}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>{selectedTest ? "Edit Test" : "Add Test"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                required
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={testForm.course_id} onValueChange={(v) => setTestForm({ ...testForm, course_id: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select value={testForm.batch_id} onValueChange={(v) => setTestForm({ ...testForm, batch_id: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {batches.filter(b => !testForm.course_id || b.course_id === testForm.course_id).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test_date">Test Date</Label>
                <Input
                  id="test_date"
                  type="date"
                  value={testForm.test_date}
                  onChange={(e) => setTestForm({ ...testForm, test_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_marks">Max Marks</Label>
                <Input
                  id="max_marks"
                  type="number"
                  value={testForm.max_marks}
                  onChange={(e) => setTestForm({ ...testForm, max_marks: parseInt(e.target.value) || 100 })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passing_marks">Pass Marks</Label>
                <Input
                  id="passing_marks"
                  type="number"
                  value={testForm.passing_marks}
                  onChange={(e) => setTestForm({ ...testForm, passing_marks: parseInt(e.target.value) || 40 })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testForm.description}
                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={testForm.is_active}
                onCheckedChange={(checked) => setTestForm({ ...testForm, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTestForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedTest ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Marks Form Dialog */}
      <Dialog open={showMarksForm} onOpenChange={setShowMarksForm}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Marks</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarksSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Test *</Label>
              <Select value={marksForm.test_id} onValueChange={(v) => setMarksForm({ ...marksForm, test_id: v })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select test" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {tests.filter(t => t.is_active).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select value={marksForm.student_id} onValueChange={(v) => setMarksForm({ ...marksForm, student_id: v })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.enrollment_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marks_obtained">Marks Obtained *</Label>
              <Input
                id="marks_obtained"
                type="number"
                value={marksForm.marks_obtained}
                onChange={(e) => setMarksForm({ ...marksForm, marks_obtained: parseInt(e.target.value) || 0 })}
                required
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={marksForm.remarks}
                onChange={(e) => setMarksForm({ ...marksForm, remarks: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowMarksForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !marksForm.test_id || !marksForm.student_id}>
                {isSubmitting ? "Saving..." : "Add Marks"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Test Confirmation */}
      <AlertDialog open={!!testToDelete} onOpenChange={() => setTestToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {testToDelete?.name}? This will also delete all associated marks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTest} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Tests;

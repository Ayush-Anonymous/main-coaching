import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Calendar, Users } from "lucide-react";

type Batch = {
  id: string;
  name: string;
  course_id: string | null;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  is_active: boolean | null;
  courses?: { name: string } | null;
};

type Course = {
  id: string;
  name: string;
};

const initialFormData = {
  name: "",
  course_id: "",
  start_date: "",
  end_date: "",
  capacity: 30,
  is_active: true,
};

const Batches = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      const { data } = await supabase.from("courses").select("id, name").eq("is_active", true);
      if (data) setCourses(data);
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user) return;
      setLoading(true);

      let query = supabase.from("batches").select("*, courses(name)");

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error fetching batches", description: error.message, variant: "destructive" });
      } else {
        setBatches(data || []);
      }
      setLoading(false);
    };

    fetchBatches();
  }, [user, searchQuery, toast]);

  const handleAdd = () => {
    setSelectedBatch(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleEdit = (b: Batch) => {
    setSelectedBatch(b);
    setFormData({
      name: b.name,
      course_id: b.course_id || "",
      start_date: b.start_date || "",
      end_date: b.end_date || "",
      capacity: b.capacity || 30,
      is_active: b.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = (b: Batch) => {
    setBatchToDelete(b);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;

    const { error } = await supabase.from("batches").delete().eq("id", batchToDelete.id);

    if (error) {
      toast({ title: "Error deleting batch", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch deleted", description: `${batchToDelete.name} has been removed.` });
      setBatches((prev) => prev.filter((b) => b.id !== batchToDelete.id));
    }
    setBatchToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const batchData = {
      ...formData,
      course_id: formData.course_id || null,
      capacity: Number(formData.capacity),
    };

    if (selectedBatch?.id) {
      const { error } = await supabase.from("batches").update(batchData).eq("id", selectedBatch.id);

      if (error) {
        toast({ title: "Error updating batch", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Batch updated", description: `${formData.name} has been updated.` });
        const course = courses.find(c => c.id === formData.course_id);
        setBatches((prev) =>
          prev.map((b) => (b.id === selectedBatch.id ? { ...b, ...batchData, courses: course ? { name: course.name } : null } : b))
        );
        setShowForm(false);
      }
    } else {
      const { data, error } = await supabase.from("batches").insert([batchData]).select("*, courses(name)").single();

      if (error) {
        toast({ title: "Error adding batch", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Batch added", description: `${formData.name} has been added.` });
        setBatches((prev) => [data, ...prev]);
        setShowForm(false);
      }
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
    <DashboardLayout title="Batches" titleHighlight="Management" subtitle="Manage batches and their schedules.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Batch
          </Button>
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Batch Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Capacity</TableHead>
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
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No batches found.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((b) => (
                  <TableRow key={b.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        <div className="font-medium">{b.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{b.courses?.name || "-"}</TableCell>
                    <TableCell>
                      {b.start_date && b.end_date
                        ? `${new Date(b.start_date).toLocaleDateString()} - ${new Date(b.end_date).toLocaleDateString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {b.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.is_active ? "default" : "secondary"}>
                        {b.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b)} className="text-destructive hover:text-destructive">
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
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>{selectedBatch ? "Edit Batch" : "Add Batch"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Batch Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_id">Course</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedBatch ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!batchToDelete} onOpenChange={() => setBatchToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {batchToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Batches;

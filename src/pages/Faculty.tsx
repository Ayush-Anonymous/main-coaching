import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Eye, GraduationCap } from "lucide-react";

type Faculty = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  qualification: string | null;
  specialization: string | null;
  experience_years: number | null;
  joining_date: string | null;
  salary: number | null;
  address: string | null;
  is_active: boolean | null;
  bio: string | null;
  avatar_url: string | null;
};

const initialFormData = {
  full_name: "",
  email: "",
  phone: "",
  qualification: "",
  specialization: "",
  experience_years: 0,
  joining_date: "",
  salary: 0,
  address: "",
  is_active: true,
  bio: "",
};

const Faculty = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return;
      setLoading(true);

      let query = supabase.from("faculty").select("*");

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error fetching faculty", description: error.message, variant: "destructive" });
      } else {
        setFaculty(data || []);
      }
      setLoading(false);
    };

    fetchFaculty();
  }, [user, searchQuery, toast]);

  const handleAdd = () => {
    setSelectedFaculty(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleView = (f: Faculty) => {
    setSelectedFaculty(f);
    setShowDetails(true);
  };

  const handleEdit = (f: Faculty) => {
    setSelectedFaculty(f);
    setFormData({
      full_name: f.full_name,
      email: f.email,
      phone: f.phone || "",
      qualification: f.qualification || "",
      specialization: f.specialization || "",
      experience_years: f.experience_years || 0,
      joining_date: f.joining_date || "",
      salary: f.salary || 0,
      address: f.address || "",
      is_active: f.is_active ?? true,
      bio: f.bio || "",
    });
    setShowForm(true);
  };

  const handleDelete = (f: Faculty) => {
    setFacultyToDelete(f);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    const { error } = await supabase.from("faculty").delete().eq("id", facultyToDelete.id);

    if (error) {
      toast({ title: "Error deleting faculty", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Faculty deleted", description: `${facultyToDelete.full_name} has been removed.` });
      setFaculty((prev) => prev.filter((f) => f.id !== facultyToDelete.id));
    }
    setFacultyToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const facultyData = {
      ...formData,
      experience_years: Number(formData.experience_years),
      salary: Number(formData.salary),
    };

    if (selectedFaculty?.id) {
      const { error } = await supabase.from("faculty").update(facultyData).eq("id", selectedFaculty.id);

      if (error) {
        toast({ title: "Error updating faculty", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Faculty updated", description: `${formData.full_name} has been updated.` });
        setFaculty((prev) =>
          prev.map((f) => (f.id === selectedFaculty.id ? { ...f, ...facultyData } : f))
        );
        setShowForm(false);
      }
    } else {
      const { data, error } = await supabase.from("faculty").insert([facultyData]).select().single();

      if (error) {
        toast({ title: "Error adding faculty", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Faculty added", description: `${formData.full_name} has been added.` });
        setFaculty((prev) => [data, ...prev]);
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
    <DashboardLayout title="Faculty" titleHighlight="Management" subtitle="Manage faculty members and their profiles.">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Faculty
          </Button>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Experience</TableHead>
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
              ) : faculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No faculty members found.
                  </TableCell>
                </TableRow>
              ) : (
                faculty.map((f) => (
                  <TableRow key={f.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{f.full_name}</div>
                          <div className="text-sm text-muted-foreground">{f.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{f.specialization || "-"}</TableCell>
                    <TableCell>{f.qualification || "-"}</TableCell>
                    <TableCell>{f.experience_years ? `${f.experience_years} years` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={f.is_active ? "default" : "secondary"}>
                        {f.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(f)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(f)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f)} className="text-destructive hover:text-destructive">
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

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>{selectedFaculty ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                {isSubmitting ? "Saving..." : selectedFaculty ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Faculty Details</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedFaculty.full_name}</h3>
                  <p className="text-muted-foreground">{selectedFaculty.specialization || "No specialization"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p>{selectedFaculty.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p>{selectedFaculty.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Qualification:</span>
                  <p>{selectedFaculty.qualification || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Experience:</span>
                  <p>{selectedFaculty.experience_years ? `${selectedFaculty.experience_years} years` : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Joining Date:</span>
                  <p>{selectedFaculty.joining_date || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>
                    <Badge variant={selectedFaculty.is_active ? "default" : "secondary"}>
                      {selectedFaculty.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </div>
              </div>
              {selectedFaculty.bio && (
                <div>
                  <span className="text-muted-foreground text-sm">Bio:</span>
                  <p className="text-sm mt-1">{selectedFaculty.bio}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button onClick={() => { setShowDetails(false); handleEdit(selectedFaculty); }}>
                  Edit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!facultyToDelete} onOpenChange={() => setFacultyToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {facultyToDelete?.full_name}? This action cannot be undone.
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

export default Faculty;

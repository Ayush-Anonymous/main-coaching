import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StudentList from "@/components/students/StudentList";
import StudentForm from "@/components/students/StudentForm";
import StudentDetails from "@/components/students/StudentDetails";
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

type Student = {
  id: string;
  enrollment_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  course_id: string | null;
  batch_id: string | null;
  status: "active" | "inactive" | "dropped" | "graduated";
  admission_date: string | null;
  total_fee: number | null;
  paid_fee: number | null;
  fee_status: "paid" | "pending" | "overdue" | "partial";
  notes: string | null;
  courses?: { name: string } | null;
  batches?: { name: string } | null;
};

type Course = {
  id: string;
  name: string;
};

type Batch = {
  id: string;
  name: string;
  course_id: string;
};

const ITEMS_PER_PAGE = 10;

const Students = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isStaff } = useAuth();
  const { toast } = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch courses and batches
  useEffect(() => {
    const fetchCoursesAndBatches = async () => {
      const [coursesRes, batchesRes] = await Promise.all([
        api.get<{ data: Course[] }>('/courses'),
        api.get<{ data: Batch[] }>('/batches'),
      ]);

      if (coursesRes.data?.data) setCourses(coursesRes.data.data);
      if (batchesRes.data?.data) setBatches(batchesRes.data.data);
    };

    if (user) fetchCoursesAndBatches();
  }, [user]);

  // Fetch students with filters
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (feeStatusFilter !== 'all') params.append('fee_status', feeStatusFilter);
      params.append('page', String(currentPage));
      params.append('limit', String(ITEMS_PER_PAGE));

      const { data, error } = await api.get<{ data: Student[]; total: number }>(
        `/students?${params.toString()}`
      );

      if (error) {
        toast({
          title: "Error fetching students",
          description: error,
          variant: "destructive",
        });
      } else if (data) {
        setStudents(data.data);
        setTotalCount(data.total);
      }

      setLoading(false);
    };

    fetchStudents();
  }, [user, searchQuery, statusFilter, feeStatusFilter, currentPage, toast]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleAdd = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(false);
    setShowForm(true);
  };

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    const { error } = await api.delete(`/students/${studentToDelete.id}`);

    if (error) {
      toast({
        title: "Error deleting student",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Student deleted",
        description: `${studentToDelete.full_name} has been removed.`,
      });
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setTotalCount((prev) => prev - 1);
    }

    setStudentToDelete(null);
  };

  const handleSubmit = async (data: {
    enrollment_number: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    guardian_name?: string;
    guardian_phone?: string;
    course_id?: string;
    batch_id?: string;
    status: "active" | "inactive" | "dropped" | "graduated";
    total_fee: number;
    notes?: string;
  }) => {
    setIsSubmitting(true);

    const studentData = {
      ...data,
      course_id: data.course_id || null,
      batch_id: data.batch_id || null,
    };

    if (selectedStudent?.id) {
      // Update
      const { error } = await api.put(`/students/${selectedStudent.id}`, studentData);

      if (error) {
        toast({
          title: "Error updating student",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Student updated",
          description: `${data.full_name} has been updated.`,
        });
        // Refresh list
        setCurrentPage(1);
        setShowForm(false);
      }
    } else {
      // Create
      const { error } = await api.post('/students', studentData);

      if (error) {
        if (error.includes("duplicate")) {
          toast({
            title: "Duplicate enrollment number",
            description: "A student with this enrollment number already exists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error adding student",
            description: error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Student added",
          description: `${data.full_name} has been added.`,
        });
        setCurrentPage(1);
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
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold font-display mb-2">
                Student <span className="gradient-text">Management</span>
              </h1>
              <p className="text-muted-foreground">
                Add, edit, and manage student records.
              </p>
            </div>

            <StudentList
              students={students}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              feeStatusFilter={feeStatusFilter}
              onFeeStatusFilterChange={(s) => {
                setFeeStatusFilter(s);
                setCurrentPage(1);
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        </main>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <StudentForm
            student={selectedStudent ? {
              id: selectedStudent.id,
              enrollment_number: selectedStudent.enrollment_number,
              full_name: selectedStudent.full_name,
              email: selectedStudent.email,
              phone: selectedStudent.phone || "",
              address: selectedStudent.address || "",
              date_of_birth: selectedStudent.date_of_birth || "",
              guardian_name: selectedStudent.guardian_name || "",
              guardian_phone: selectedStudent.guardian_phone || "",
              course_id: selectedStudent.course_id || "",
              batch_id: selectedStudent.batch_id || "",
              status: selectedStudent.status,
              total_fee: selectedStudent.total_fee || 0,
              notes: selectedStudent.notes || "",
            } : undefined}
            courses={courses}
            batches={batches}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        )}

        {showDetails && selectedStudent && (
          <StudentDetails
            student={selectedStudent}
            onClose={() => setShowDetails(false)}
            onEdit={() => handleEdit(selectedStudent)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {studentToDelete?.full_name}? This action cannot be undone.
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
    </div>
  );
};

export default Students;

import { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const studentSchema = z.object({
  enrollment_number: z.string().trim().min(1, "Enrollment number is required").max(50),
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(500).optional(),
  date_of_birth: z.string().optional(),
  guardian_name: z.string().trim().max(100).optional(),
  guardian_phone: z.string().trim().max(20).optional(),
  course_id: z.string().optional(),
  batch_id: z.string().optional(),
  status: z.enum(["active", "inactive", "dropped", "graduated"]),
  total_fee: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(1000).optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface Course {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  name: string;
  course_id: string;
}

interface StudentFormProps {
  student?: Partial<StudentFormData> & { id?: string };
  courses: Course[];
  batches: Batch[];
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const generateEnrollmentNumber = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `STU${year}${random}`;
};

const StudentForm = ({ 
  student, 
  courses, 
  batches, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: StudentFormProps) => {
  const isEditing = !!student?.id;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    enrollment_number: student?.enrollment_number || generateEnrollmentNumber(),
    full_name: student?.full_name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    date_of_birth: student?.date_of_birth || "",
    guardian_name: student?.guardian_name || "",
    guardian_phone: student?.guardian_phone || "",
    course_id: student?.course_id || "",
    batch_id: student?.batch_id || "",
    status: student?.status || "active",
    total_fee: student?.total_fee || 0,
    notes: student?.notes || "",
  });

  const filteredBatches = batches.filter(
    (b) => !formData.course_id || b.course_id === formData.course_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = studentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card variant="glass" className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-display">
              {isEditing ? "Edit Student" : "Add New Student"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment_number">Enrollment Number *</Label>
                  <Input
                    id="enrollment_number"
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, enrollment_number: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                    disabled={isEditing}
                  />
                  {errors.enrollment_number && <p className="text-xs text-destructive">{errors.enrollment_number}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as StudentFormData["status"] }))}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              {/* Course & Batch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_id">Course</Label>
                  <Select 
                    value={formData.course_id || "none"} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      course_id: value === "none" ? "" : value,
                      batch_id: "" 
                    }))}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No course</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_id">Batch</Label>
                  <Select 
                    value={formData.batch_id || "none"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, batch_id: value === "none" ? "" : value }))}
                    disabled={!formData.course_id}
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No batch</SelectItem>
                      {filteredBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fee & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_fee">Total Fee (₹)</Label>
                  <Input
                    id="total_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_fee: parseFloat(e.target.value) || 0 }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-muted/50 border-border/50 min-h-[80px]"
                  placeholder="Additional notes about the student..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Add Student"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StudentForm;

import { motion } from "framer-motion";
import { X, Mail, Phone, Calendar, MapPin, User, BookOpen, GraduationCap, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Student {
  id: string;
  enrollment_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: "active" | "inactive" | "dropped" | "graduated";
  admission_date: string | null;
  total_fee: number | null;
  paid_fee: number | null;
  fee_status: "paid" | "pending" | "overdue" | "partial";
  notes: string | null;
  courses?: { name: string } | null;
  batches?: { name: string } | null;
}

interface StudentDetailsProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  dropped: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  graduated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const feeStatusColors: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  overdue: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  partial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  </div>
);

const StudentDetails = ({ student, onClose, onEdit }: StudentDetailsProps) => {
  const feeProgress = student.total_fee ? ((student.paid_fee || 0) / student.total_fee) * 100 : 0;

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
            <div>
              <CardTitle className="text-xl font-display">{student.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{student.enrollment_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[student.status]}>
                {student.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email" value={student.email} />
                <InfoItem icon={Phone} label="Phone" value={student.phone} />
                <InfoItem icon={MapPin} label="Address" value={student.address} />
                <InfoItem 
                  icon={Calendar} 
                  label="Date of Birth" 
                  value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : null} 
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Guardian Info */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Guardian Name" value={student.guardian_name} />
                <InfoItem icon={Phone} label="Guardian Phone" value={student.guardian_phone} />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Academic Info */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={BookOpen} label="Course" value={student.courses?.name} />
                <InfoItem icon={GraduationCap} label="Batch" value={student.batches?.name} />
                <InfoItem 
                  icon={Calendar} 
                  label="Admission Date" 
                  value={student.admission_date ? new Date(student.admission_date).toLocaleDateString() : null} 
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Fee Info */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Fee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground">Total Fee</p>
                  <p className="text-lg font-bold">₹{(student.total_fee || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-lg font-bold text-emerald-400">₹{(student.paid_fee || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-lg font-bold text-amber-400">
                    ₹{((student.total_fee || 0) - (student.paid_fee || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${feeProgress}%` }}
                  />
                </div>
                <Badge variant="outline" className={feeStatusColors[student.fee_status]}>
                  {student.fee_status}
                </Badge>
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <>
                <Separator className="bg-border/50" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{student.notes}</p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="gradient" onClick={onEdit}>
                Edit Student
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StudentDetails;

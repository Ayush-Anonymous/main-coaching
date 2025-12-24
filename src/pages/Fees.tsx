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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, CreditCard, TrendingUp, AlertTriangle, CheckCircle, IndianRupee } from "lucide-react";

type FeePayment = {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  notes: string | null;
  students?: { full_name: string; enrollment_number: string } | null;
};

type Student = {
  id: string;
  full_name: string;
  enrollment_number: string;
  total_fee: number | null;
  paid_fee: number | null;
  fee_status: string | null;
};

const initialFormData = {
  student_id: "",
  amount: 0,
  payment_date: new Date().toISOString().split("T")[0],
  payment_method: "cash",
  receipt_number: "",
  notes: "",
};

const Fees = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingAmount: 0,
    totalStudents: 0,
    overdueCount: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("students")
        .select("id, full_name, enrollment_number, total_fee, paid_fee, fee_status")
        .eq("status", "active");
      if (data) {
        setStudents(data);
        // Calculate stats
        const totalCollected = data.reduce((sum, s) => sum + (s.paid_fee || 0), 0);
        const pendingAmount = data.reduce((sum, s) => sum + ((s.total_fee || 0) - (s.paid_fee || 0)), 0);
        const overdueCount = data.filter((s) => s.fee_status === "overdue").length;
        setStats({
          totalCollected,
          pendingAmount,
          totalStudents: data.length,
          overdueCount,
        });
      }
    };
    fetchStudents();
  }, [user]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      setLoading(true);

      let query = supabase
        .from("fee_payments")
        .select("*, students(full_name, enrollment_number)");

      if (searchQuery) {
        // Search in related student name
        const { data: studentIds } = await supabase
          .from("students")
          .select("id")
          .or(`full_name.ilike.%${searchQuery}%,enrollment_number.ilike.%${searchQuery}%`);
        
        if (studentIds && studentIds.length > 0) {
          query = query.in("student_id", studentIds.map(s => s.id));
        }
      }

      const { data, error } = await query.order("payment_date", { ascending: false });

      if (error) {
        toast({ title: "Error fetching payments", description: error.message, variant: "destructive" });
      } else {
        setPayments(data || []);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [user, searchQuery, toast]);

  const handleAdd = () => {
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const paymentData = {
      student_id: formData.student_id,
      amount: Number(formData.amount),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      receipt_number: formData.receipt_number || null,
      notes: formData.notes || null,
    };

    const { data, error } = await supabase
      .from("fee_payments")
      .insert([paymentData])
      .select("*, students(full_name, enrollment_number)")
      .single();

    if (error) {
      toast({ title: "Error recording payment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment recorded", description: `₹${formData.amount} payment recorded successfully.` });
      setPayments((prev) => [data, ...prev]);
      
      // Update student's paid_fee
      const student = students.find(s => s.id === formData.student_id);
      if (student) {
        const newPaidFee = (student.paid_fee || 0) + Number(formData.amount);
        const totalFee = student.total_fee || 0;
        const newFeeStatus = newPaidFee >= totalFee ? "paid" : newPaidFee > 0 ? "partial" : "pending";
        
        await supabase
          .from("students")
          .update({ paid_fee: newPaidFee, fee_status: newFeeStatus })
          .eq("id", formData.student_id);
      }
      
      setShowForm(false);
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
    <DashboardLayout title="Fees" titleHighlight="Management" subtitle="Track and manage fee payments.">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
              <IndianRupee className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalCollected.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>

        {/* Payments Table */}
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Receipt #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{p.students?.full_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{p.students?.enrollment_number}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {p.payment_method || "cash"}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.receipt_number || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.enrollment_number}) - Due: ₹{((s.total_fee || 0) - (s.paid_fee || 0)).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.student_id}>
                {isSubmitting ? "Saving..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Fees;

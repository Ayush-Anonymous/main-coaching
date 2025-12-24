import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Users, BookOpen, IndianRupee, TrendingUp, GraduationCap, Calendar, Award, AlertTriangle } from "lucide-react";

const COLORS = ["hsl(199, 89%, 48%)", "hsl(260, 60%, 55%)", "hsl(172, 66%, 50%)", "hsl(45, 93%, 58%)", "hsl(0, 84%, 60%)"];

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState("month");

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingFees: 0,
    totalFaculty: 0,
    totalEnquiries: 0,
    conversionRate: 0,
  });

  const [courseData, setCourseData] = useState<{ name: string; students: number }[]>([]);
  const [feeStatusData, setFeeStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; admissions: number; revenue: number }[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      // Fetch all data in parallel
      const [studentsRes, coursesRes, facultyRes, enquiriesRes, paymentsRes] = await Promise.all([
        supabase.from("students").select("id, status, fee_status, total_fee, paid_fee, course_id, admission_date, courses(name)"),
        supabase.from("courses").select("id, name").eq("is_active", true),
        supabase.from("faculty").select("id").eq("is_active", true),
        supabase.from("enquiries").select("id, status"),
        supabase.from("fee_payments").select("amount, payment_date"),
      ]);

      const students = studentsRes.data || [];
      const courses = coursesRes.data || [];
      const faculty = facultyRes.data || [];
      const enquiries = enquiriesRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate stats
      const activeStudents = students.filter(s => s.status === "active").length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingFees = students.reduce((sum, s) => sum + ((s.total_fee || 0) - (s.paid_fee || 0)), 0);
      const convertedEnquiries = enquiries.filter(e => e.status === "converted").length;
      const conversionRate = enquiries.length > 0 ? Math.round((convertedEnquiries / enquiries.length) * 100) : 0;

      setStats({
        totalStudents: students.length,
        activeStudents,
        totalCourses: courses.length,
        totalRevenue,
        pendingFees,
        totalFaculty: faculty.length,
        totalEnquiries: enquiries.length,
        conversionRate,
      });

      // Course-wise student distribution
      const courseMap = new Map<string, number>();
      students.forEach(s => {
        const courseName = (s.courses as { name: string } | null)?.name || "Unassigned";
        courseMap.set(courseName, (courseMap.get(courseName) || 0) + 1);
      });
      setCourseData(Array.from(courseMap.entries()).map(([name, students]) => ({ name, students })));

      // Fee status distribution
      const feeStatusMap = new Map<string, number>();
      students.forEach(s => {
        const status = s.fee_status || "pending";
        feeStatusMap.set(status, (feeStatusMap.get(status) || 0) + 1);
      });
      setFeeStatusData(Array.from(feeStatusMap.entries()).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Monthly admissions and revenue (last 6 months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const today = new Date();
      const monthlyStats: { month: string; admissions: number; revenue: number }[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = monthNames[date.getMonth()];

        const admissions = students.filter(s => {
          if (!s.admission_date) return false;
          return s.admission_date.startsWith(monthStr);
        }).length;

        const revenue = payments
          .filter(p => p.payment_date?.startsWith(monthStr))
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        monthlyStats.push({ month: monthLabel, admissions, revenue });
      }
      setMonthlyData(monthlyStats);
    };

    fetchAnalytics();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Analytics" titleHighlight="Dashboard" subtitle="Overview of institute performance and metrics.">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{stats.activeStudents} active</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <IndianRupee className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">₹{stats.pendingFees.toLocaleString()} pending</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
              <BookOpen className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">{stats.totalFaculty} faculty</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enquiry Conversion</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">{stats.totalEnquiries} total enquiries</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Admissions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" />
                  <YAxis stroke="hsl(215, 20%, 65%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="hsl(199, 89%, 48%)"
                    fill="url(#colorAdmissions)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" />
                  <YAxis stroke="hsl(215, 20%, 65%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(172, 66%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Students by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
                  <XAxis type="number" stroke="hsl(215, 20%, 65%)" />
                  <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 65%)" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="students" fill="hsl(260, 60%, 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fee Status Distribution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Fee Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {feeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

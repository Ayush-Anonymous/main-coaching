import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const admissionData = [
  { month: "Jan", admissions: 45, dropouts: 3 },
  { month: "Feb", admissions: 52, dropouts: 2 },
  { month: "Mar", admissions: 78, dropouts: 4 },
  { month: "Apr", admissions: 85, dropouts: 2 },
  { month: "May", admissions: 65, dropouts: 5 },
  { month: "Jun", admissions: 92, dropouts: 3 },
  { month: "Jul", admissions: 110, dropouts: 2 },
  { month: "Aug", admissions: 125, dropouts: 4 },
  { month: "Sep", admissions: 95, dropouts: 3 },
  { month: "Oct", admissions: 88, dropouts: 2 },
  { month: "Nov", admissions: 75, dropouts: 4 },
  { month: "Dec", admissions: 68, dropouts: 3 },
];

const revenueData = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 220000 },
  { month: "Mar", revenue: 310000 },
  { month: "Apr", revenue: 280000 },
  { month: "May", revenue: 250000 },
  { month: "Jun", revenue: 320000 },
  { month: "Jul", revenue: 380000 },
  { month: "Aug", revenue: 420000 },
  { month: "Sep", revenue: 350000 },
  { month: "Oct", revenue: 300000 },
  { month: "Nov", revenue: 280000 },
  { month: "Dec", revenue: 260000 },
];

const courseDistribution = [
  { name: "JEE Advanced", value: 35, color: "hsl(199, 89%, 48%)" },
  { name: "NEET Medical", value: 28, color: "hsl(260, 60%, 55%)" },
  { name: "Foundation", value: 22, color: "hsl(172, 66%, 50%)" },
  { name: "UPSC", value: 15, color: "hsl(45, 93%, 58%)" },
];

const DashboardCharts = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Admissions Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={admissionData}>
                  <defs>
                    <linearGradient id="admissionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={2}
                    fill="url(#admissionsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(260, 60%, 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Course Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 40%, 18%)",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value}%`, "Students"]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: "hsl(215, 20%, 65%)" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New student enrolled", name: "Arjun Sharma", course: "JEE Advanced", time: "2 min ago", type: "admission" },
                { action: "Fee payment received", name: "Priya Patel", amount: "₹15,000", time: "15 min ago", type: "payment" },
                { action: "Test scheduled", name: "Physics Weekly Test", batch: "JEE Batch A", time: "1 hour ago", type: "test" },
                { action: "Enquiry received", name: "Contact Form", phone: "+91 98765 XXXXX", time: "2 hours ago", type: "enquiry" },
                { action: "New faculty joined", name: "Dr. Rahul Verma", subject: "Chemistry", time: "3 hours ago", type: "faculty" },
              ].map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "admission" ? "bg-accent" :
                      activity.type === "payment" ? "bg-primary" :
                      activity.type === "test" ? "bg-secondary" :
                      activity.type === "enquiry" ? "bg-yellow-500" :
                      "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.name} {activity.course && `• ${activity.course}`}
                      {activity.amount && `• ${activity.amount}`}
                      {activity.batch && `• ${activity.batch}`}
                      {activity.subject && `• ${activity.subject}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardCharts;

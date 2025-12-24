import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  UserMinus,
  Calendar
} from "lucide-react";
import AnimatedCounter from "@/components/landing/AnimatedCounter";

const stats = [
  {
    title: "Total Students",
    value: 5247,
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "primary",
  },
  {
    title: "New Admissions",
    value: 328,
    change: "+8%",
    trend: "up",
    icon: UserPlus,
    color: "accent",
  },
  {
    title: "Total Revenue",
    value: 2450000,
    prefix: "₹",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
    color: "secondary",
  },
  {
    title: "Active Batches",
    value: 42,
    change: "+3",
    trend: "up",
    icon: Calendar,
    color: "primary",
  },
  {
    title: "Total Faculty",
    value: 156,
    change: "+5",
    trend: "up",
    icon: GraduationCap,
    color: "accent",
  },
  {
    title: "Courses Offered",
    value: 54,
    change: "+2",
    trend: "up",
    icon: BookOpen,
    color: "secondary",
  },
  {
    title: "Pending Fees",
    value: 450000,
    prefix: "₹",
    change: "-8%",
    trend: "down",
    icon: DollarSign,
    color: "destructive",
  },
  {
    title: "Dropouts",
    value: 23,
    change: "-15%",
    trend: "down",
    icon: UserMinus,
    color: "destructive",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Card variant="glass" className="hover-lift relative overflow-hidden">
            {/* Background Glow */}
            <div 
              className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${
                stat.color === "primary" ? "bg-primary" :
                stat.color === "accent" ? "bg-accent" :
                stat.color === "secondary" ? "bg-secondary" :
                "bg-destructive"
              }`}
            />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold font-display">
                    {stat.prefix}
                    <AnimatedCounter 
                      value={stat.value} 
                      duration={1500}
                    />
                  </p>
                </div>
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === "primary" ? "bg-primary/10" :
                    stat.color === "accent" ? "bg-accent/10" :
                    stat.color === "secondary" ? "bg-secondary/10" :
                    "bg-destructive/10"
                  }`}
                >
                  <stat.icon 
                    className={`w-6 h-6 ${
                      stat.color === "primary" ? "text-primary" :
                      stat.color === "accent" ? "text-accent" :
                      stat.color === "secondary" ? "text-secondary" :
                      "text-destructive"
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span 
                  className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-accent" : "text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;

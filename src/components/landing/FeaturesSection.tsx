import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Trophy, 
  Lightbulb,
  BookOpen,
  HeartHandshake
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Result-Oriented Approach",
    description: "Our teaching methodology focuses on conceptual clarity and practical application for guaranteed results.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from IIT, NIT, and AIIMS alumni with 10+ years of teaching excellence.",
  },
  {
    icon: Trophy,
    title: "Proven Track Record",
    description: "Over 5000+ students placed in top institutions with consistent top ranks year after year.",
  },
  {
    icon: Lightbulb,
    title: "Personalized Learning",
    description: "Small batch sizes and individual attention ensure every student reaches their full potential.",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Study Material",
    description: "Meticulously designed study resources, practice tests, and doubt-clearing sessions.",
  },
  {
    icon: HeartHandshake,
    title: "Student-First Philosophy",
    description: "Dedicated mentorship, counseling, and continuous support throughout your journey.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-muted/30">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-accent/50 text-accent">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4">
            What Makes Us <span className="gradient-text-accent">Different</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine traditional teaching excellence with modern learning techniques to deliver exceptional results.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover-lift group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

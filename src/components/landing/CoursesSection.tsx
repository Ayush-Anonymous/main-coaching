import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  BookOpen,
  Sparkles
} from "lucide-react";

const courses = [
  {
    id: 1,
    title: "JEE Advanced Complete Course",
    category: "Engineering",
    description: "Comprehensive preparation for IIT JEE Advanced with expert faculty guidance and extensive practice.",
    duration: "12 Months",
    students: 2500,
    rating: 4.9,
    price: "₹45,000",
    featured: true,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "NEET Medical Preparation",
    category: "Medical",
    description: "Master Biology, Physics & Chemistry with our proven methodology for NEET success.",
    duration: "12 Months",
    students: 1800,
    rating: 4.8,
    price: "₹42,000",
    featured: true,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Foundation Course (Class 9-10)",
    category: "Foundation",
    description: "Build a strong foundation in Science and Mathematics for future competitive exams.",
    duration: "24 Months",
    students: 3200,
    rating: 4.7,
    price: "₹30,000",
    featured: false,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "UPSC Civil Services",
    category: "Government",
    description: "Complete guidance for UPSC CSE with current affairs, answer writing, and interview prep.",
    duration: "18 Months",
    students: 950,
    rating: 4.9,
    price: "₹55,000",
    featured: true,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
  },
];

const CoursesSection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/50 text-primary">
            <Sparkles className="w-3 h-3 mr-2" />
            Our Programs
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4">
            Popular <span className="gradient-text">Courses</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our wide range of courses designed to help you achieve your academic and career goals.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover-lift group overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  {course.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm">
                    {course.category}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      {course.students.toLocaleString()}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">{course.price}</span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/courses">
            <Button variant="outline" size="lg" className="group">
              <BookOpen className="w-4 h-4 mr-2" />
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;

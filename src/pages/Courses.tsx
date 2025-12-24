import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const allCourses = [
  {
    id: 1,
    title: "JEE Advanced Complete Course",
    category: "Engineering",
    description: "Comprehensive preparation for IIT JEE Advanced with expert faculty guidance and extensive practice material.",
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
  {
    id: 5,
    title: "JEE Main Crash Course",
    category: "Engineering",
    description: "Intensive preparation for JEE Main with focus on high-yield topics and problem solving.",
    duration: "6 Months",
    students: 1500,
    rating: 4.6,
    price: "₹25,000",
    featured: false,
    image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "CBSE Board Excellence",
    category: "Board Exams",
    description: "Comprehensive coverage of CBSE syllabus for Class 11-12 with focus on board exam patterns.",
    duration: "12 Months",
    students: 2200,
    rating: 4.8,
    price: "₹20,000",
    featured: false,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
  },
];

const categories = ["All", "Engineering", "Medical", "Foundation", "Government", "Board Exams"];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container-custom relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/50 text-primary">
                Explore Programs
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">
                Our <span className="gradient-text">Courses</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Choose from our comprehensive range of courses designed to help you succeed in your academic journey.
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row items-center gap-4 mb-12"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="glass" className="h-full hover-lift group overflow-hidden">
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

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Linkedin,
  Mail
} from "lucide-react";

const faculty = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    subject: "Physics",
    qualification: "Ph.D. IIT Delhi",
    experience: "15+ Years",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop",
    students: "3000+",
  },
  {
    id: 2,
    name: "Prof. Priya Sharma",
    subject: "Chemistry",
    qualification: "M.Sc. IIT Bombay",
    experience: "12+ Years",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop",
    students: "2500+",
  },
  {
    id: 3,
    name: "Dr. Amit Singh",
    subject: "Mathematics",
    qualification: "Ph.D. IIT Kanpur",
    experience: "18+ Years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    students: "4000+",
  },
  {
    id: 4,
    name: "Dr. Neha Gupta",
    subject: "Biology",
    qualification: "MBBS, AIIMS",
    experience: "10+ Years",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop",
    students: "2000+",
  },
];

const FacultySection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-secondary/50 text-secondary">
            Meet Our Team
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4">
            Expert <span className="gradient-text">Faculty</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn from the best minds in education who are passionate about nurturing the next generation of achievers.
          </p>
        </motion.div>

        {/* Faculty Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {faculty.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover-lift group text-center overflow-hidden">
                {/* Image */}
                <div className="relative pt-6 px-6">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <Badge className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {member.subject}
                  </Badge>
                </div>

                <CardContent className="p-6 pt-8">
                  <h3 className="text-lg font-bold font-display mb-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {member.qualification}
                  </p>
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="px-2 py-1 rounded-full bg-muted">
                      {member.experience}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-muted">
                      {member.students} Students
                    </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultySection;

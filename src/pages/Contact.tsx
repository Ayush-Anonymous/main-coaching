import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/landing/ContactSection";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container-custom relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4 px-4 py-1.5 border-accent/50 text-accent">
                Get In Touch
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">
                Contact <span className="gradient-text-accent">Us</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Have questions about our courses or want to schedule a visit? We're here to help!
              </p>
            </motion.div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

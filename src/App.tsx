import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import CoursesManagement from "./pages/CoursesManagement";
import Batches from "./pages/Batches";
import Fees from "./pages/Fees";
import Tests from "./pages/Tests";
import Enquiries from "./pages/Enquiries";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/students" element={<Students />} />
            <Route path="/dashboard/faculty" element={<Faculty />} />
            <Route path="/dashboard/courses" element={<CoursesManagement />} />
            <Route path="/dashboard/batches" element={<Batches />} />
            <Route path="/dashboard/fees" element={<Fees />} />
            <Route path="/dashboard/tests" element={<Tests />} />
            <Route path="/dashboard/enquiries" element={<Enquiries />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/students" element={<Students />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Positions from "./pages/Positions";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import TrackApplication from "./pages/TrackApplication";
import Team from "./pages/Team";
import Teams from "./pages/Teams";
import Community from "./pages/Community";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventCheckIn from "./pages/EventCheckIn";
import Hidden from "./pages/Hidden";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track" element={<TrackApplication />} />
          <Route path="/team" element={<Team />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/community" element={<Community />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/check-in/:token" element={<EventCheckIn />} />
          <Route path="/hidden" element={<Hidden />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

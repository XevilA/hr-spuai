import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spu-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-midnight-blue py-20 pt-32">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-white hover:text-spu-pink"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Our{" "}
              <span className="text-spu-pink">
                Projects
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              สำรวจโครงการและกิจกรรมต่างๆ ของชมรม AI ที่เราได้พัฒนาและดำเนินการ
            </p>
          </motion.div>
        </div>
      </div>

      {/* Projects List */}
      <div className="container mx-auto px-4 py-16">
        {projects.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">ยังไม่มีโครงการ</h3>
              <p className="text-muted-foreground">
                กำลังพัฒนาโครงการใหม่ๆ โปรดติดตามเร็วๆ นี้!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-spu-pink/50 overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden bg-muted">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="md:w-2/3">
                      <CardHeader>
                        <CardTitle className="text-3xl mb-2 text-spu-pink">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-3 py-1 text-sm font-medium bg-spu-pink/10 text-spu-pink rounded-full border border-spu-pink/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Projects;

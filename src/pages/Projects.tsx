import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FolderOpen, Search, Filter, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [projects]);

  // Filter projects based on search and selected tag
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === null || project.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [projects, searchQuery, selectedTag]);

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

      {/* Header with enhanced design */}
      <div className="bg-gradient-to-br from-midnight-blue via-midnight-blue to-midnight-blue-light py-24 pt-32 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-spu-pink/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-white hover:text-spu-pink hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-spu-pink/20 border border-spu-pink/30 backdrop-blur-sm"
            >
              <FolderOpen className="w-4 h-4 text-spu-pink" />
              <span className="text-sm font-semibold text-white">Our Portfolio</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white">
              Innovative{" "}
              <span className="text-gradient bg-gradient-to-r from-spu-pink via-spu-pink-light to-primary bg-clip-text text-transparent">
                AI Projects
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl leading-relaxed">
              สำรวจโครงการและนวัตกรรม AI ที่พัฒนาโดยทีมงานและสมาชิกของเรา พร้อมเรียนรู้เทคโนโลยีและแนวทางที่นำไปใช้
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20"
          >
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-spu-pink focus:ring-spu-pink h-12"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-white hover:text-spu-pink hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-medium text-white/80">Filter by tag:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className={`rounded-full ${
                      selectedTag === null
                        ? "bg-spu-pink hover:bg-spu-pink/90 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    All Projects
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`rounded-full ${
                        selectedTag === tag
                          ? "bg-spu-pink hover:bg-spu-pink/90 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }`}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Projects List */}
      <div className="container mx-auto px-4 py-20">
        {/* Results count */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <p className="text-muted-foreground">
              Showing <span className="font-bold text-spu-pink">{filteredProjects.length}</span> of{" "}
              <span className="font-bold">{projects.length}</span> projects
            </p>
          </motion.div>
        )}

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-2xl mx-auto border-2">
              <CardContent className="py-20 text-center">
                <FolderOpen className="h-20 w-20 mx-auto mb-6 text-spu-pink/50" />
                <h3 className="text-3xl font-bold mb-3 text-foreground">ยังไม่มีโครงการ</h3>
                <p className="text-lg text-muted-foreground">
                  กำลังพัฒนาโครงการใหม่ๆ โปรดติดตามเร็วๆ นี้!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-2xl mx-auto border-2">
              <CardContent className="py-20 text-center">
                <Search className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-3xl font-bold mb-3 text-foreground">No projects found</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag(null);
                  }}
                  className="bg-spu-pink hover:bg-spu-pink/90"
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-10 max-w-6xl mx-auto">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-spu-pink/50 transition-all duration-500 hover:shadow-2xl">
                    <div className="md:flex">
                      {/* Image Section */}
                      <div className="md:w-2/5 aspect-[16/10] md:aspect-auto relative overflow-hidden bg-muted">
                        <div className="absolute inset-0 bg-gradient-to-br from-spu-pink/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                      </div>

                      {/* Content Section */}
                      <div className="md:w-3/5 flex flex-col">
                        <CardHeader className="flex-1">
                          <CardTitle className="text-3xl md:text-4xl mb-4 text-foreground group-hover:text-spu-pink transition-colors duration-300">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="text-base md:text-lg leading-relaxed">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, tagIndex) => (
                              <motion.button
                                key={tagIndex}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                                  selectedTag === tag
                                    ? "bg-spu-pink text-white shadow-lg"
                                    : "bg-spu-pink/10 text-spu-pink border border-spu-pink/20 hover:bg-spu-pink/20 hover:border-spu-pink/40"
                                }`}
                              >
                                {tag}
                              </motion.button>
                            ))}
                          </div>
                        </CardContent>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="h-1 bg-gradient-to-r from-spu-pink via-primary to-spu-pink-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Projects;

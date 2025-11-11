import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: "AI Chatbot Assistant",
      description: "ระบบแชทบอทที่ใช้ AI ในการตอบคำถามและให้คำแนะนำสมาชิกอัตโนมัติ",
      image: "/src/assets/project-1.jpg",
      tags: ["AI", "NLP", "Chatbot"],
    },
    {
      id: 2,
      title: "Machine Learning Workshop",
      description: "โครงการจัดอบรมเชิงปฏิบัติการด้าน Machine Learning สำหรับนักศึกษา",
      image: "/src/assets/project-2.jpg",
      tags: ["ML", "Education", "Workshop"],
    },
    {
      id: 3,
      title: "Image Recognition System",
      description: "ระบบจำแนกภาพอัตโนมัติด้วย Deep Learning และ Computer Vision",
      image: "/src/assets/project-3.jpg",
      tags: ["Computer Vision", "Deep Learning"],
    },
    {
      id: 4,
      title: "AI Hackathon 2024",
      description: "การแข่งขันพัฒนาโครงการ AI เพื่อแก้ปัญหาในชีวิตประจำวัน",
      image: "/src/assets/project-4.jpg",
      tags: ["Competition", "Innovation"],
    },
    {
      id: 5,
      title: "Data Analytics Dashboard",
      description: "แดชบอร์ดวิเคราะห์ข้อมูลแบบ Real-time ด้วย AI",
      image: "/src/assets/project-5.jpg",
      tags: ["Data Science", "Analytics", "Visualization"],
    },
    {
      id: 6,
      title: "Smart Campus Project",
      description: "โครงการพัฒนามหาวิทยาลัยอัจฉริยะด้วยเทคโนโลยี AI และ IoT",
      image: "/src/assets/project-6.jpg",
      tags: ["IoT", "AI", "Smart City"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gradient">
              Our Projects
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              สำรวจโครงการและกิจกรรมต่างๆ ของชมรม AI ที่เราได้พัฒนาและดำเนินการ
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Projects;

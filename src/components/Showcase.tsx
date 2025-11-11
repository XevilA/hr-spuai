import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";

const projects = [
  {
    title: "AI Chatbot Platform",
    description: "Intelligent conversational AI for customer service",
    image: project1,
    tags: ["NLP", "Machine Learning"],
  },
  {
    title: "Computer Vision System",
    description: "Advanced image recognition and analysis",
    image: project2,
    tags: ["Computer Vision", "Deep Learning"],
  },
  {
    title: "Data Analytics Dashboard",
    description: "Real-time ML-powered insights",
    image: project3,
    tags: ["Analytics", "Visualization"],
  },
  {
    title: "AI Assistant Robot",
    description: "Autonomous robotic assistance system",
    image: project4,
    tags: ["Robotics", "AI"],
  },
  {
    title: "NLP Text Analyzer",
    description: "Advanced natural language processing",
    image: project5,
    tags: ["NLP", "Sentiment Analysis"],
  },
  {
    title: "Neural Network Viz",
    description: "Deep learning architecture visualization",
    image: project6,
    tags: ["Deep Learning", "Visualization"],
  },
];

export const Showcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore groundbreaking AI projects built by our talented members
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl glass-card hover-lift cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-blue via-midnight-blue/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-spu-pink/80 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-white/80 mb-4">{project.description}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

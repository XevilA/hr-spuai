import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Tiger",
    role: "VP of Developer",
    content: "Leading the developer team has been an incredible journey. SPU AI Club provides the perfect platform to push technical boundaries and mentor talented students.",
    initials: "TG",
  },
  {
    name: "New",
    role: "VP of Content Creator",
    content: "Creating content for SPU AI Club allows me to share our amazing projects with the world. The creative freedom and support here are unmatched.",
    initials: "NW",
  },
  {
    name: "M",
    role: "VP of General Affairs (GA)",
    content: "Managing operations and ensuring smooth events has taught me invaluable leadership skills. This club is where innovation meets execution.",
    initials: "M",
  },
  {
    name: "Krit S.",
    role: "IT '24",
    content: "The hands-on projects and expert mentors accelerated my learning. Highly recommend to anyone interested in AI.",
    initials: "KS",
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-midnight-blue text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="text-gradient">Members Say</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Real stories from students who transformed their careers
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto h-96 flex items-center">
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;
            const offset = index - activeIndex;

            return (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={false}
                animate={{
                  x: `${offset * 100}%`,
                  scale: isActive ? 1 : 0.8,
                  opacity: isActive ? 1 : 0.3,
                  zIndex: isActive ? 10 : 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                <div className="glass-card p-8 md:p-12 rounded-3xl h-full flex flex-col justify-center">
                  <Quote className="w-12 h-12 text-spu-pink mb-6" />
                  <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-spu-pink">
                      <AvatarFallback className="bg-spu-pink text-white text-lg font-bold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-white/70">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-spu-pink w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

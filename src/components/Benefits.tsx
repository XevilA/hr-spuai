import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Rocket, Users } from "lucide-react";
import { useRef } from "react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Exclusive Workshops",
    description: "Access cutting-edge AI workshops taught by industry leaders and academics",
    gradient: "from-spu-pink to-spu-pink-light",
  },
  {
    icon: Rocket,
    title: "Startup Funding",
    description: "Get funding opportunities and mentorship to launch your AI startup",
    gradient: "from-spu-pink-light to-primary",
  },
  {
    icon: Users,
    title: "Elite Mentorship",
    description: "Connect with AI experts, researchers, and successful entrepreneurs",
    gradient: "from-primary to-midnight-blue-light",
  },
];

const BenefitCard = ({ benefit, index }: { benefit: typeof benefits[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 15]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.8 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group"
    >
      <div className="glass-card p-8 rounded-3xl hover-lift">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-lg`}
        >
          <benefit.icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-foreground">{benefit.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-spu-pink/20 to-transparent blur-xl -z-10" />
      </div>
    </motion.div>
  );
};

export const Benefits = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Member <span className="text-gradient">Benefits</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock exclusive opportunities and accelerate your AI journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

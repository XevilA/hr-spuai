import { motion, useScroll, useTransform } from "framer-motion";
import { 
  GraduationCap, 
  Rocket, 
  Users, 
  Trophy, 
  Network, 
  BookOpen, 
  Briefcase, 
  Code, 
  Lightbulb,
  Award,
  Globe,
  Zap
} from "lucide-react";
import { useRef } from "react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Exclusive Workshops",
    description: "เข้าถึง workshop AI ล้ำสมัยโดยผู้เชี่ยวชาญและนักวิชาการชั้นนำ",
    gradient: "from-spu-pink to-spu-pink-light",
  },
  {
    icon: Rocket,
    title: "Startup Funding",
    description: "รับโอกาสทุนสนับสนุนและคำปรึกษาเพื่อเปิดตัว AI startup ของคุณ",
    gradient: "from-spu-pink-light to-primary",
  },
  {
    icon: Users,
    title: "Elite Mentorship",
    description: "เชื่อมต่อกับผู้เชี่ยวชาญ AI นักวิจัย และผู้ประกอบการที่ประสบความสำเร็จ",
    gradient: "from-primary to-midnight-blue-light",
  },
  {
    icon: Trophy,
    title: "Hackathon Opportunities",
    description: "เข้าร่วม hackathon และแข่งขันระดับชาติและนานาชาติ พร้อมรางวัลมากมาย",
    gradient: "from-midnight-blue to-spu-pink",
  },
  {
    icon: Network,
    title: "Networking Events",
    description: "พบปะสร้างเครือข่ายกับนักพัฒนา researcher และ entrepreneur ในวงการ AI",
    gradient: "from-spu-pink to-midnight-blue-light",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "เข้าถึงแหล่งเรียนรู้ คอร์สออนไลน์ และสื่อการสอน AI คุณภาพสูงฟรี",
    gradient: "from-primary to-spu-pink-light",
  },
  {
    icon: Briefcase,
    title: "Career Opportunities",
    description: "โอกาสฝึกงานและทำงานกับบริษัทชั้นนำด้าน AI และเทคโนโลยี",
    gradient: "from-midnight-blue-light to-primary",
  },
  {
    icon: Code,
    title: "Project Collaboration",
    description: "ร่วมพัฒนาโปรเจกต์จริงกับทีมงานและนำไปใช้งานได้จริง",
    gradient: "from-spu-pink-light to-midnight-blue",
  },
  {
    icon: Lightbulb,
    title: "Innovation Support",
    description: "สนับสนุนไอเดียและนวัตกรรมของคุณด้วยทรัพยากรและคำแนะนำจากผู้เชี่ยวชาญ",
    gradient: "from-primary to-midnight-blue-light",
  },
  {
    icon: Award,
    title: "Certification Programs",
    description: "รับใบรับรองและ certificate จากการเข้าร่วมโครงการและ workshop ต่างๆ",
    gradient: "from-midnight-blue to-spu-pink-light",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "เป็นส่วนหนึ่งของชุมชน AI ระดับโลกและแลกเปลี่ยนความรู้กับนานาชาติ",
    gradient: "from-spu-pink to-primary",
  },
  {
    icon: Zap,
    title: "Exclusive Tools Access",
    description: "ใช้งาน AI tools และ platforms พรีเมียมฟรีสำหรับสมาชิกชมรม",
    gradient: "from-midnight-blue-light to-spu-pink",
  },
];

const BenefitCard = ({ benefit, index }: { benefit: typeof benefits[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, 10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      className="relative group"
    >
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-border/50 group-hover:border-spu-pink/50 transition-all duration-500">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-5`} />
        </div>

        {/* Icon container with pulse effect */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-xl relative z-10 group-hover:shadow-2xl transition-shadow duration-300`}
        >
          <benefit.icon className="w-8 h-8 text-white" />

          {/* Pulse ring effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-spu-pink/30 to-transparent animate-ping opacity-0 group-hover:opacity-75" style={{ animationDuration: '2s' }} />
        </motion.div>

        <h3 className="text-2xl font-bold mb-4 text-foreground relative z-10 group-hover:text-spu-pink transition-colors duration-300">
          {benefit.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed relative z-10 group-hover:text-foreground/80 transition-colors duration-300">
          {benefit.description}
        </p>

        {/* Enhanced glow effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-spu-pink/10 via-transparent to-primary/10 blur-2xl -z-10" />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
        </div>
      </div>
    </motion.div>
  );
};

export const Benefits = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-spu-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-spu-pink/10 border border-spu-pink/20"
          >
            <Trophy className="w-4 h-4 text-spu-pink" />
            <span className="text-sm font-semibold text-spu-pink">Premium Membership Benefits</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-foreground"
          >
            Unlock Your{" "}
            <span className="text-gradient bg-gradient-to-r from-spu-pink via-primary to-spu-pink-light bg-clip-text text-transparent">
              AI Potential
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Join Thailand's premier AI community and gain access to exclusive resources, mentorship, and opportunities
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12"
          >
            {[
              { value: "12+", label: "Exclusive Benefits" },
              { value: "500+", label: "Active Members" },
              { value: "50+", label: "Events Per Year" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-spu-pink mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

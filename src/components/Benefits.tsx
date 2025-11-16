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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

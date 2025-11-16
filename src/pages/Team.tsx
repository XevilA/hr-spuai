import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Users, Award, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Team = () => {
  const teamMembers = [
    {
      name: "ถิรวัฒน์ นันตมาศ",
      position: "ผู้ก่อตั้งและที่ปรึกษา",
      role: "Founder & Advisor",
      description: "ถิรวัฒน์คือผู้ก่อตั้ง SPU AI CLUB และทำหน้าที่เป็น \"ที่ปรึกษาสูงสุด\" ของชมรม บทบาทคือกำหนดทิศทางใหญ่ กรอบกลยุทธ์ วิสัยทัศน์ และตรวจสอบคุณภาพงานสำคัญทั้งหมด รวมถึงช่วยแก้ปัญหาระดับโครงสร้าง ดูแลการเติบโตของชมรม และเชื่อมต่อกับคณาจารย์–ผู้บริหารมหาวิทยาลัย บทบาทนี้จึงเป็นเสาหลักของชมรมทั้งด้านกลยุทธ์ เทคโนโลยี และค่านิยมองค์กร",
      icon: Lightbulb,
      gradient: "from-purple-500 via-purple-600 to-pink-500",
      cardBg: "from-purple-50/80 via-purple-50/60 to-pink-50/80",
      glowColor: "purple",
    },
    {
      name: "วิลาสินี พ่วงจีน",
      position: "ประธานชมรม",
      role: "President",
      description: "วิลาสินีทำหน้าที่เป็นผู้นำสูงสุดของชมรมในเชิงปฏิบัติ (President) ดูแลการดำเนินงานทั้งสามฝ่ายคือ Creator, ฝ่ายบริหารทั่วไป และ Developer คอยประสานงานทั้งหมดให้เดินไปในทิศทางเดียวกัน ควบคุมคุณภาพงาน กำหนดเป้าหมายรายไตรมาส จัดการประชุมทีม และเป็นตัวแทนชมรมในงานภายใน–ภายนอกมหาวิทยาลัย บทบาทสำคัญคือทำให้แนวคิดจากผู้ก่อตั้งเกิดขึ้นจริงอย่างมีระบบ",
      icon: Award,
      gradient: "from-blue-500 via-blue-600 to-cyan-500",
      cardBg: "from-blue-50/80 via-blue-50/60 to-cyan-50/80",
      glowColor: "blue",
    },
    {
      name: "ธีรเดช มีปัญญา",
      position: "รองประธานฝ่ายบริหารทั่วไป",
      role: "Vice President of General Administration",
      description: "ธีรเดชดูแล \"ฝ่ายบริหารทั่วไป\" ซึ่งเป็นหัวใจสำคัญของการจัดการภายในชมรม บทบาทคือควบคุมงานสายสนับสนุน เช่น บัญชี เอกสาร สวัสดิการสมาชิก การพัฒนาสมาชิก งานกิจกรรม ประสานงาน 6 คณะ / 3 วิทยาเขต รวมถึงกำกับทีม AE และฝ่ายที่เกี่ยวข้องทั้งหมด ตำแหน่งนี้ทำให้ทุกระบบหลังบ้านของชมรมทำงานได้ราบรื่นและเป็นมือขวาที่ประธานไว้ใจในการบริหารงานองค์กรทั้งหมด",
      icon: Users,
      gradient: "from-green-500 via-green-600 to-emerald-500",
      cardBg: "from-green-50/80 via-green-50/60 to-emerald-50/80",
      glowColor: "green",
    },
  ];

  return (
    <div className="min-h-screen scroll-smooth bg-white">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-midnight-blue via-midnight-blue/95 to-spu-pink/20">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-spu-pink/20 blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white font-semibold text-sm tracking-wider uppercase flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4" />
                Meet Our Leadership
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              ทีมผู้นำ{" "}
              <span className="text-gradient bg-gradient-to-r from-spu-pink to-purple-400 bg-clip-text text-transparent">
                SPU AI CLUB
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              พบกับผู้นำและผู้ก่อตั้งที่ขับเคลื่อนชมรม AI
              <br className="hidden md:block" />
              ให้เติบโตและพัฒนาอย่างต่อเนื่อง
            </motion.p>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-24 fill-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="space-y-12 md:space-y-16">
            {teamMembers.map((member, index) => {
              const IconComponent = member.icon;
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${member.cardBg} backdrop-blur-sm border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500`}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    {/* Decorative Glow Effect */}
                    <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${member.gradient} rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700`} />

                    <div className="relative p-8 md:p-12">
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: 0.3 + index * 0.2,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          }}
                          className="flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                          <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${member.gradient} text-white shadow-lg`}>
                            <IconComponent className="w-8 h-8" />
                          </div>
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.2 }}
                          >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                              {member.name}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                              <p className={`text-lg font-bold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent`}>
                                {member.position}
                              </p>
                              <span className="hidden sm:block text-gray-300 text-xl">•</span>
                              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {member.role}
                              </p>
                            </div>
                          </motion.div>

                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + index * 0.2 }}
                            className="text-gray-700 leading-relaxed text-base md:text-lg"
                          >
                            {member.description}
                          </motion.p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className={`h-1 bg-gradient-to-r ${member.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-midnight-blue via-midnight-blue to-spu-pink/20 p-12 md:p-16 text-center shadow-2xl">
              {/* Decorative Elements */}
              <motion.div
                className="absolute top-10 left-10 w-24 h-24 rounded-full bg-spu-pink/20 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-block mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                  <Sparkles className="w-8 h-8 text-spu-pink" />
                </motion.div>

                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  พร้อมที่จะเข้าร่วมทีมแล้วหรือยัง?
                </h3>
                <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  มาเป็นส่วนหนึ่งของชมรม AI ที่ทันสมัยและก้าวหน้าที่สุดในประเทศไทย
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-midnight-blue px-10 py-7 text-lg font-bold rounded-full shadow-2xl transition-all duration-300 group"
                    onClick={() => {
                      window.location.href = "/#signup";
                    }}
                  >
                    สมัครเข้าร่วม
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Team;

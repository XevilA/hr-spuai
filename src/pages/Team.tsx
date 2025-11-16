import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Award, Lightbulb } from "lucide-react";

const Team = () => {
  const teamMembers = [
    {
      name: "ถิรวัฒน์ นันตมาศ",
      position: "ผู้ก่อตั้งและที่ปรึกษา",
      role: "Founder & Advisor",
      description: "ถิรวัฒน์คือผู้ก่อตั้ง SPU AI CLUB และทำหน้าที่เป็น \"ที่ปรึกษาสูงสุด\" ของชมรม บทบาทคือกำหนดทิศทางใหญ่ กรอบกลยุทธ์ วิสัยทัศน์ และตรวจสอบคุณภาพงานสำคัญทั้งหมด รวมถึงช่วยแก้ปัญหาระดับโครงสร้าง ดูแลการเติบโตของชมรม และเชื่อมต่อกับคณาจารย์–ผู้บริหารมหาวิทยาลัย บทบาทนี้จึงเป็นเสาหลักของชมรมทั้งด้านกลยุทธ์ เทคโนโลยี และค่านิยมองค์กร",
      icon: <Lightbulb className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      name: "วิลาสินี พ่วงจีน",
      position: "ประธานชมรม",
      role: "President",
      description: "วิลาสินีทำหน้าที่เป็นผู้นำสูงสุดของชมรมในเชิงปฏิบัติ (President) ดูแลการดำเนินงานทั้งสามฝ่ายคือ Creator, ฝ่ายบริหารทั่วไป และ Developer คอยประสานงานทั้งหมดให้เดินไปในทิศทางเดียวกัน ควบคุมคุณภาพงาน กำหนดเป้าหมายรายไตรมาส จัดการประชุมทีม และเป็นตัวแทนชมรมในงานภายใน–ภายนอกมหาวิทยาลัย บทบาทสำคัญคือทำให้แนวคิดจากผู้ก่อตั้งเกิดขึ้นจริงอย่างมีระบบ",
      icon: <Award className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      name: "ธีรเดช มีปัญญา",
      position: "รองประธานฝ่ายบริหารทั่วไป",
      role: "Vice President of General Administration",
      description: "ธีรเดชดูแล \"ฝ่ายบริหารทั่วไป\" ซึ่งเป็นหัวใจสำคัญของการจัดการภายในชมรม บทบาทคือควบคุมงานสายสนับสนุน เช่น บัญชี เอกสาร สวัสดิการสมาชิก การพัฒนาสมาชิก งานกิจกรรม ประสานงาน 6 คณะ / 3 วิทยาเขต รวมถึงกำกับทีม AE และฝ่ายที่เกี่ยวข้องทั้งหมด ตำแหน่งนี้ทำให้ทุกระบบหลังบ้านของชมรมทำงานได้ราบรื่นและเป็นมือขวาที่ประธานไว้ใจในการบริหารงานองค์กรทั้งหมด",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200/60 shadow-sm"
            >
              <span className="text-gray-700 font-semibold text-sm tracking-wider">
                OUR LEADERSHIP
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            >
              ทีมผู้นำ SPU AI CLUB
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              พบกับผู้นำและผู้ก่อตั้งที่ขับเคลื่อนชมรม AI ให้เติบโตและพัฒนาอย่างต่อเนื่อง
            </motion.p>
          </motion.div>

          {/* Team Members */}
          <div className="space-y-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + index * 0.15,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br ${member.bgGradient} border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all duration-500`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.6 + index * 0.15,
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                        }}
                        className={`flex-shrink-0 p-6 rounded-2xl bg-gradient-to-br ${member.gradient} text-white shadow-lg`}
                      >
                        {member.icon}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.15 }}
                        >
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {member.name}
                          </h2>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                            <p className={`text-lg font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent`}>
                              {member.position}
                            </p>
                            <span className="hidden md:block text-gray-300">•</span>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                              {member.role}
                            </p>
                          </div>
                        </motion.div>

                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.15 }}
                          className="text-gray-700 leading-relaxed text-lg"
                        >
                          {member.description}
                        </motion.p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`h-1 bg-gradient-to-r ${member.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-20 text-center"
          >
            <div className="p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-[0_20px_60px_rgb(0,0,0,0.15)]">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                พร้อมที่จะเข้าร่วมทีมแล้วหรือยัง?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                มาเป็นส่วนหนึ่งของชมรม AI ที่ทันสมัยและก้าวหน้าที่สุดในประเทศไทย
              </p>
              <motion.a
                href="/#signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                สมัครเข้าร่วม
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;

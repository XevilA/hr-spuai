import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Users, Award, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Team = () => {
  const navigate = useNavigate();
  
  const teamMembers = [
    {
      name: "ถิรวัฒน์ นันตมาศ",
      position: "ผู้ก่อตั้งและที่ปรึกษา",
      role: "Founder & Advisor",
      description: "ถิรวัฒน์คือผู้ก่อตั้ง SPU AI CLUB และทำหน้าที่เป็น \"ที่ปรึกษาสูงสุด\" ของชมรม บทบาทคือกำหนดทิศทางใหญ่ กรอบกลยุทธ์ วิสัยทัศน์ และตรวจสอบคุณภาพงานสำคัญทั้งหมด รวมถึงช่วยแก้ปัญหาระดับโครงสร้าง ดูแลการเติบโตของชมรม และเชื่อมต่อกับคณาจารย์–ผู้บริหารมหาวิทยาลัย",
      responsibilities: "• กำหนดทิศทางและวิสัยทัศน์ขององค์กร\n• ตรวจสอบคุณภาพงานสำคัญ\n• แก้ปัญหาระดับโครงสร้าง\n• เชื่อมต่อกับคณาจารย์และผู้บริหารมหาวิทยาลัย",
      icon: Lightbulb,
    },
    {
      name: "วิลาสินี พ่วงจีน",
      position: "ประธานชมรม",
      role: "President",
      description: "วิลาสินีทำหน้าที่เป็นผู้นำสูงสุดของชมรมในเชิงปฏิบัติ (President) ดูแลการดำเนินงานทั้งสามฝ่ายคือ Creator, ฝ่ายบริหารทั่วไป และ Developer คอยประสานงานทั้งหมดให้เดินไปในทิศทางเดียวกัน ควบคุมคุณภาพงาน กำหนดเป้าหมายรายไตรมาส จัดการประชุมทีม และเป็นตัวแทนชมรมในงานภายใน–ภายนอกมหาวิทยาลัย",
      responsibilities: "• ดูแลการดำเนินงานทั้ง 3 ฝ่าย (Creator, บริหารทั่วไป, Developer)\n• ควบคุมคุณภาพงานและกำหนดเป้าหมายรายไตรมาส\n• จัดการประชุมทีมและประสานงาน\n• เป็นตัวแทนชมรมในงานต่างๆ",
      icon: Award,
    },
    {
      name: "ธีรเดช มีปัญญา",
      position: "รองประธานฝ่ายบริหารทั่วไป",
      role: "Vice President of General Administration",
      description: "ธีรเดชดูแล \"ฝ่ายบริหารทั่วไป\" ซึ่งเป็นหัวใจสำคัญของการจัดการภายในชมรม บทบาทคือควบคุมงานสายสนับสนุน เช่น บัญชี เอกสาร สวัสดิการสมาชิก การพัฒนาสมาชิก งานกิจกรรม ประสานงาน 6 คณะ / 3 วิทยาเขต รวมถึงกำกับทีม AE และฝ่ายที่เกี่ยวข้องทั้งหมด",
      responsibilities: "• ควบคุมงานสายสนับสนุน (บัญชี, เอกสาร, สวัสดิการ)\n• ดูแลการพัฒนาสมาชิก\n• ประสานงาน 6 คณะ / 3 วิทยาเขต\n• กำกับทีม AE และฝ่ายที่เกี่ยวข้อง",
      icon: Users,
    },
  ];

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
              Leadership{" "}
              <span className="text-spu-pink">
                Team
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              Meet the visionary leaders driving innovation and growth at SPU AI CLUB.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-spu-pink/50">
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-2">
                      <div className="p-3 bg-spu-pink/10 rounded-lg">
                        <IconComponent className="w-6 h-6 text-spu-pink" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl mb-2 text-spu-pink">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-base mb-1">
                          <span className="font-semibold text-foreground">{member.position}</span>
                        </CardDescription>
                        <CardDescription className="text-sm">
                          {member.role}
                        </CardDescription>
                      </div>
                    </div>
                    <CardDescription className="text-base mt-4">
                      {member.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Key Responsibilities:</h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                          {member.responsibilities}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-3xl mx-auto border-2 border-spu-pink/20 bg-gradient-to-br from-spu-pink/5 to-transparent">
            <CardContent className="py-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Join Our Team?</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Become part of Thailand's most innovative AI community and work alongside our talented leadership team.
              </p>
              <Button
                size="lg"
                className="bg-spu-pink hover:bg-spu-pink-light text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate("/#signup")}
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Team;

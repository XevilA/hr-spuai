import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CommunityHero } from "@/components/CommunityHero";
import { Showcase } from "@/components/Showcase";
import { Target, Lightbulb, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <CommunityHero />

      {/* Vision & Mission Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-spu-pink to-midnight-blue bg-clip-text text-transparent">
              ปณิธาน SPU AI CLUB
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              สร้างชุมชนแห่งการเรียนรู้และพัฒนาทักษะ AI เพื่ออนาคตที่ดีกว่า
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-spu-pink transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spu-pink to-spu-pink-light flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">วิสัยทัศน์</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    เป็นชมรม AI ชั้นนำที่สร้างสรรค์นวัตกรรมและพัฒนาบุคลากรด้าน AI ที่มีคุณภาพสู่สังคมไทย
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-spu-pink transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-midnight-blue to-midnight-blue-light flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">พันธกิจ</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    จัดกิจกรรมเพื่อส่งเสริมการเรียนรู้ แลกเปลี่ยนความรู้ และพัฒนาโครงการ AI ที่สร้างคุณค่าต่อสังคม
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-spu-pink transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spu-pink via-midnight-blue to-midnight-blue-light flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">ค่านิยม</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    การเรียนรู้ร่วมกัน สร้างสรรค์นวัตกรรม และแบ่งปันความรู้เพื่อพัฒนาสังคม
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">ผลงานของเรา</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              โครงการและผลงาน AI ที่ทีมของเราได้พัฒนาขึ้น
            </p>
          </motion.div>
          <Showcase />
        </div>
      </section>

      {/* Planning Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">แผนการดำเนินงาน</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              กิจกรรมและโครงการที่เราวางแผนไว้สำหรับอนาคต
            </p>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {[
              {
                quarter: "Q1 2025",
                title: "Workshop Series",
                description: "จัด Workshop AI พื้นฐานและขั้นสูงสำหรับสมาชิกทุกระดับ",
                color: "from-spu-pink to-spu-pink-light"
              },
              {
                quarter: "Q2 2025",
                title: "AI Hackathon",
                description: "การแข่งขันพัฒนา AI Solution เพื่อแก้ปัญหาในชีวิตประจำวัน",
                color: "from-midnight-blue to-midnight-blue-light"
              },
              {
                quarter: "Q3 2025",
                title: "Community Projects",
                description: "พัฒนาโครงการ AI เพื่อสังคมและสิ่งแวดล้อม",
                color: "from-spu-pink via-midnight-blue to-midnight-blue-light"
              },
              {
                quarter: "Q4 2025",
                title: "Annual Conference",
                description: "จัดงานประชุมใหญ่ประจำปี แสดงผลงานและแลกเปลี่ยนความรู้",
                color: "from-spu-pink-light to-spu-pink"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 hover:border-spu-pink transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm text-center">
                          {plan.quarter}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">{plan.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">โครงสร้างชมรม</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ทีมงานและบทบาทในการขับเคลื่อนชมรม
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { role: "ประธานชมรม", dept: "ผู้นำและกำหนดทิศทาง" },
              { role: "รองประธาน", dept: "สนับสนุนและประสานงาน" },
              { role: "เลขานุการ", dept: "บริหารจัดการเอกสาร" },
              { role: "เหรัญญิก", dept: "จัดการงบประมาณ" },
              { role: "ฝ่ายเทคนิค", dept: "พัฒนาโครงการ AI" },
              { role: "ฝ่ายประชาสัมพันธ์", dept: "สื่อสารและประชาสัมพันธ์" },
            ].map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 hover:border-spu-pink transition-all duration-300 hover:shadow-lg group">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-spu-pink to-midnight-blue mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{position.role}</h3>
                    <p className="text-muted-foreground">{position.dept}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community;

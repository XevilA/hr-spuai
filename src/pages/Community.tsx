import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Lightbulb, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-midnight-blue py-12 md:py-20 pt-24 md:pt-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 md:mb-8 text-white hover:text-spu-pink"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 text-white">
              โครงสร้าง{" "}
              <span className="text-spu-pink">
                องค์กร
              </span>
            </h1>
            <p className="text-base md:text-xl text-white/80 max-w-3xl mx-auto md:mx-0">
              ระบบการทำงาน 3 สายงานหลัก ภายใต้การนำของประธานชมรม
            </p>
          </motion.div>
        </div>
      </div>

      {/* Organization Structure Section */}
      <section className="py-8 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* President */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-16"
          >
            <Card className="border-2 border-spu-pink hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 md:p-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-spu-pink via-spu-pink-light to-midnight-blue flex items-center justify-center mb-4 md:mb-6">
                    <Target className="w-8 h-8 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">ประธาน (President)</h3>
                  <p className="text-sm md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    ศูนย์กลางของชมรม ผู้กำหนดทิศทาง กลยุทธ์ และภาพรวมทั้งหมด หน้าที่คือวางวิสัยทัศน์ ดูภาพรวมของทั้ง 3 สายงาน และตัดสินใจเชิงกลยุทธ์ว่าชมรมจะเดินไปทางไหน คล้าย CEO ในบริษัทสตาร์ทอัพ แต่โทนสนุกกว่าและคล่องตัวกว่า
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Three VP Sections */}
          <div className="space-y-6 md:space-y-12">
            {/* VP Creator */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 hover:border-spu-pink transition-all duration-300">
                <CardContent className="p-5 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-spu-pink to-spu-pink-light flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <Lightbulb className="w-7 h-7 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg md:text-2xl font-bold mb-2">รองประธานฝั่ง Creator (VP – Creator)</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                        ดูแลงานสื่อ งานภาพลักษณ์ งานคอนเทนต์ทั้งหมด เป็นเสาหลักด้าน "ภาพลักษณ์และการสื่อสาร" ของชมรม
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                        <p className="font-semibold mb-2 text-spu-pink text-sm md:text-base">ทีม Head of CC (Content & Creative)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
                          <span>• Content Creative</span>
                          <span>• Editor</span>
                          <span>• PR & Public Relations</span>
                          <span>• Project Coordinator</span>
                          <span>• Admin</span>
                          <span>• Pitching</span>
                          <span>• Graphic Design</span>
                          <span>• Ads Agency</span>
                          <span>• Copywriter</span>
                          <span>• Web Comic</span>
                          <span>• Influencer Team</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 md:mt-3 italic">
                          สายนี้เปรียบเหมือนฝ่ายการตลาด + ครีเอทีฟของบริษัท
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* VP General Management */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 hover:border-midnight-blue transition-all duration-300">
                <CardContent className="p-5 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-midnight-blue to-midnight-blue-light flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <Users className="w-7 h-7 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg md:text-2xl font-bold mb-2">รองประธานฝ่ายบริหารทั่วไป (VP – General Management)</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                        เป็น "หัวใจการจัดการและระบบหลังบ้าน" ของชมรม ควบคุมฝ่าย Admin ทั้งหมด, ระบบสมาชิก, งานเอกสาร และงานประสานงานกับมหาวิทยาลัย
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                        <p className="font-semibold mb-2 text-midnight-blue text-sm md:text-base">ทีม Head From 6 Faculties / 3 วิทยาเขต</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
                          <span>• Accounting</span>
                          <span>• ตัวแทน 6 คณะ</span>
                          <span>• ฝ่ายจัดการ Event</span>
                          <span>• ฝ่ายกลยุทธ์</span>
                          <span>• ฝ่ายพัฒนาทักษะสมาชิก</span>
                          <span>• ฝ่ายบริหารงาน</span>
                          <span>• ฝ่ายบริหารทรัพยากรบุคคล (HR)</span>
                          <span>• Account Executive (AE)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 md:mt-3 italic">
                          สายนี้ทำหน้าที่เหมือน "COO + HR + Operation" ในบริษัท
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* VP Developer */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 hover:border-spu-pink transition-all duration-300">
                <CardContent className="p-5 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-spu-pink via-midnight-blue to-midnight-blue-light flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <Users className="w-7 h-7 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg md:text-2xl font-bold mb-2">รองประธานสาย Developer (VP – Developer)</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                        รับผิดชอบทุกอย่างที่เป็นโค้ด ระบบ นวัตกรรม และโปรเจกต์เทคโนโลยีของชมรม
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                        <p className="font-semibold mb-2 text-spu-pink text-sm md:text-base">ทีม Head of Developer</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
                          <span>• Sale & Marketing</span>
                          <span>• Planning</span>
                          <span>• Developer</span>
                          <span>• Account Executive (AE)</span>
                          <span>• Project Coordinator</span>
                          <span>• Research & Innovation</span>
                          <span>• UX/UI Designer</span>
                          <span>• Data Analyst</span>
                          <span>• AI Automation</span>
                          <span>• IoT</span>
                          <span>• Hackathon Team</span>
                          <span>• WebApp / Desktop App</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 md:mt-3 italic">
                          สายนี้คือ "Tech Department + R&D Lab" ของชมรม
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-16"
          >
            <Card className="border-2 border-midnight-blue">
              <CardContent className="p-5 md:p-8">
                <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 text-center">ภาพรวมระบบการทำงาน</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 md:mb-4 text-center md:text-left">
                  สามสายนี้ทำงานร่วมกัน โดยประธานจะเป็นคนเชื่อมทุกอย่างเข้าเป็นระบบเดียว
                </p>
                <div className="space-y-2 text-sm md:text-base text-muted-foreground">
                  <p>• <span className="text-spu-pink font-semibold">สาย Creator</span> → ทำสื่อให้โปรเจกต์และกิจกรรม</p>
                  <p>• <span className="text-midnight-blue font-semibold">สายบริหาร</span> → จัดระบบสมาชิก ประสานงานมหาลัย และดูแลการจัดการ</p>
                  <p>• <span className="text-spu-pink font-semibold">สาย Developer</span> → ผลิตระบบจริงให้คณะ หน่วยงาน หรือโปรเจกต์ของชมรม</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Community;

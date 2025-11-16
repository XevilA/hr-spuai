import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Phone, CheckCircle, Clock, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "react-router-dom";

interface Application {
  id: string;
  full_name: string;
  position_id: string;
  status: string;
  created_at: string;
  university: string;
  faculty: string;
  major: string;
  cv_file_path: string | null;
}

interface Position {
  title: string;
}

const TrackApplication = () => {
  const [searchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleSearchByToken(token);
    }
  }, [searchParams]);

  const handleSearchByToken = async (token: string) => {
    setLoading(true);
    setApplication(null);
    setPosition(null);

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*, positions(title)")
        .eq("tracking_token", token)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("ไม่พบใบสมัครจากลิงก์นี้");
        return;
      }

      setApplication(data);
      if (data.positions) {
        setPosition(data.positions as any);
      }
      toast.success("พบข้อมูลใบสมัครของคุณ");
    } catch (error) {
      console.error("Error searching by token:", error);
      toast.error("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          text: "รอการตรวจสอบ",
          description: "ใบสมัครของคุณอยู่ในระหว่างการพิจารณา",
          color: "border-yellow-500 bg-yellow-50"
        };
      case "reviewing":
        return {
          icon: <FileText className="w-8 h-8 text-blue-500" />,
          text: "กำลังพิจารณา",
          description: "ทีมงานกำลังพิจารณาใบสมัครของคุณอย่างละเอียด",
          color: "border-blue-500 bg-blue-50"
        };
      case "accepted":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          text: "ผ่านการคัดเลือก",
          description: "ยินดีด้วย! คุณผ่านการคัดเลือก ทีมงานจะติดต่อกลับเร็วๆ นี้",
          color: "border-green-500 bg-green-50"
        };
      case "rejected":
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          text: "ไม่ผ่านการคัดเลือก",
          description: "ขอบคุณสำหรับการสมัคร เราหวังว่าจะได้พบคุณในโอกาสหน้า",
          color: "border-red-500 bg-red-50"
        };
      default:
        return {
          icon: <Clock className="w-8 h-8 text-gray-500" />,
          text: "ไม่ทราบสถานะ",
          description: "ไม่สามารถระบุสถานะได้",
          color: "border-gray-500 bg-gray-50"
        };
    }
  };

  const handleDownloadCV = async () => {
    if (!application?.cv_file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(application.cv_file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("ไม่สามารถเปิดไฟล์ CV ได้");
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("กรุณากรอกข้อมูลที่ต้องการค้นหา");
      return;
    }

    setLoading(true);
    setApplication(null);
    setPosition(null);

    try {
      const column = searchType === "email" ? "email" : "phone";
      const { data, error } = await supabase
        .from("applications")
        .select("*, positions(title)")
        .eq(column, searchValue.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("ไม่พบใบสมัครที่ตรงกับข้อมูลที่ค้นหา");
        return;
      }

      setApplication(data);
      if (data.positions) {
        setPosition(data.positions as any);
      }
      toast.success("พบข้อมูลใบสมัครของคุณ");
    } catch (error) {
      console.error("Error searching application:", error);
      toast.error("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = application ? getStatusInfo(application.status) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200/60 shadow-sm"
            >
              <span className="text-gray-700 font-semibold text-sm tracking-wider">APPLICATION STATUS</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            >
              ติดตามสถานะใบสมัคร
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              ค้นหาใบสมัครของคุณด้วยอีเมลหรือเบอร์โทรศัพท์
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <Card className="p-8 mb-8 backdrop-blur-xl bg-white/80 border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
              <div className="space-y-6">
                <div className="flex gap-3 mb-6">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={() => setSearchType("email")} variant={searchType === "email" ? "default" : "outline"} className="w-full h-12 font-medium transition-all duration-300">
                      <Mail className="w-4 h-4 mr-2" />ค้นหาด้วยอีเมล
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={() => setSearchType("phone")} variant={searchType === "phone" ? "default" : "outline"} className="w-full h-12 font-medium transition-all duration-300">
                      <Phone className="w-4 h-4 mr-2" />ค้นหาด้วยเบอร์โทร
                    </Button>
                  </motion.div>
                </div>

                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">{searchType === "email" ? "อีเมล" : "เบอร์โทรศัพท์"}</Label>
                  <Input id="search" type={searchType === "email" ? "email" : "tel"} placeholder={searchType === "email" ? "example@email.com" : "0812345678"} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="mt-2 h-12 border-gray-200 focus:border-gray-300 transition-all duration-300" />
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button onClick={handleSearch} disabled={loading || !searchValue} className="w-full h-12 font-medium shadow-md hover:shadow-lg transition-all duration-300">
                    {loading ? <><Search className="w-4 h-4 mr-2 animate-spin" />กำลังค้นหา...</> : <><Search className="w-4 h-4 mr-2" />ค้นหา</>}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {application && statusInfo && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <Card className="p-8 backdrop-blur-xl bg-white/90 border-gray-200/60 shadow-[0_20px_60px_rgb(0,0,0,0.08)] overflow-hidden">
                <div className="space-y-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className={`relative p-8 rounded-3xl border-2 ${statusInfo.color} backdrop-blur-sm transition-all duration-500 overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center gap-6">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}>{statusInfo.icon}</motion.div>
                      <div className="flex-1">
                        <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-2xl font-bold mb-2">{statusInfo.text}</motion.h3>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-gray-600 leading-relaxed">{statusInfo.description}</motion.p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: "ชื่อ-นามสกุล", value: application.full_name },
                      { label: "ตำแหน่งที่สมัคร", value: position?.title || "N/A" },
                      { label: "มหาวิทยาลัย", value: application.university || "N/A" },
                      { label: "คณะ", value: application.faculty },
                      { label: "สาขา", value: application.major },
                      { label: "วันที่สมัคร", value: new Date(application.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) },
                    ].map((item, index) => (
                      <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + index * 0.05 }} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} className="p-5 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-gray-900 text-lg">{item.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {application.cv_file_path && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button onClick={handleDownloadCV} variant="outline" className="w-full h-14 text-base font-medium border-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
                        <Download className="w-5 h-5 mr-2" />ดาวน์โหลด CV
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackApplication;

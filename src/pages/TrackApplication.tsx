import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Phone, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Application {
  id: string;
  full_name: string;
  position_id: string;
  status: string;
  created_at: string;
  university: string;
  faculty: string;
  major: string;
}

interface Position {
  title: string;
}

const TrackApplication = () => {
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-spu-pink to-spu-blue bg-clip-text text-transparent">
              ตรวจสอบสถานะใบสมัคร
            </h1>
            <p className="text-muted-foreground text-lg">
              ค้นหาใบสมัครของคุณด้วยอีเมลหรือเบอร์โทรศัพท์
            </p>
          </div>

          <Card className="p-8 shadow-lg">
            <div className="space-y-6">
              <div className="flex gap-4 justify-center mb-6">
                <Button
                  type="button"
                  variant={searchType === "email" ? "default" : "outline"}
                  onClick={() => setSearchType("email")}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  อีเมล
                </Button>
                <Button
                  type="button"
                  variant={searchType === "phone" ? "default" : "outline"}
                  onClick={() => setSearchType("phone")}
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  เบอร์โทร
                </Button>
              </div>

              <div>
                <Label htmlFor="search">
                  {searchType === "email" ? "อีเมล" : "เบอร์โทรศัพท์"}
                </Label>
                <Input
                  id="search"
                  type={searchType === "email" ? "email" : "tel"}
                  placeholder={
                    searchType === "email"
                      ? "example@email.com"
                      : "0812345678"
                  }
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? "กำลังค้นหา..." : "ค้นหาใบสมัคร"}
              </Button>
            </div>
          </Card>

          {application && statusInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Card className={`p-8 shadow-lg border-2 ${statusInfo.color}`}>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {statusInfo.icon}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {statusInfo.text}
                  </h2>
                  <p className="text-muted-foreground">
                    {statusInfo.description}
                  </p>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ชื่อ-นามสกุล:</span>
                    <span className="font-medium">{application.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ตำแหน่ง:</span>
                    <span className="font-medium">
                      {position?.title || "ไม่ระบุ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">มหาวิทยาลัย:</span>
                    <span className="font-medium">{application.university || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">คณะ:</span>
                    <span className="font-medium">{application.faculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สาขา:</span>
                    <span className="font-medium">{application.major}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">วันที่สมัคร:</span>
                    <span className="font-medium">
                      {new Date(application.created_at).toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackApplication;

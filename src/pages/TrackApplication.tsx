import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Phone, CheckCircle, Clock, XCircle, FileText, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
          text: "สถานะไม่ทราบ",
          description: "กรุณาติดต่อทีมงานเพื่อสอบถามข้อมูลเพิ่มเติม",
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
        toast.error("ไม่พบใบสมัครที่ตรงกับข้อมูลนี้");
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

  const handleDownloadCV = async () => {
    if (!application?.cv_file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(application.cv_file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = application.cv_file_path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("ดาวน์โหลด CV สำเร็จ");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("ไม่สามารถดาวน์โหลด CV ได้");
    }
  };

  const statusInfo = application ? getStatusInfo(application.status) : null;

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
              Track{" "}
              <span className="text-spu-pink">
                Application
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              ตรวจสอบสถานะการสมัครของคุณด้วยอีเมลหรือเบอร์โทรศัพท์
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <Card className="border-2 hover:border-spu-pink/50 transition-colors duration-300 mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={searchType === "email" ? "default" : "outline"}
                    onClick={() => setSearchType("email")}
                    className="flex-1"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    อีเมล
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === "phone" ? "default" : "outline"}
                    onClick={() => setSearchType("phone")}
                    className="flex-1"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    เบอร์โทร
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="search">
                    {searchType === "email" ? "อีเมลของคุณ" : "เบอร์โทรศัพท์"}
                  </Label>
                  <Input
                    id="search"
                    type={searchType === "email" ? "email" : "tel"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      searchType === "email" 
                        ? "example@email.com" 
                        : "0812345678"
                    }
                    className="text-lg py-6"
                  />
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loading || !searchValue}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      กำลังค้นหา...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      ค้นหาใบสมัคร
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          {application && statusInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`border-2 hover:shadow-xl transition-shadow duration-300 ${statusInfo.color}`}>
                <CardContent className="p-8">
                  {/* Status Header */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-border">
                    {statusInfo.icon}
                    <div>
                      <h2 className="text-3xl font-bold">{statusInfo.text}</h2>
                      <p className="text-muted-foreground mt-1">{statusInfo.description}</p>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ชื่อผู้สมัคร</p>
                        <p className="text-lg font-semibold">{application.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ตำแหน่งที่สมัคร</p>
                        <p className="text-lg font-semibold text-spu-pink">
                          {position?.title || "กำลังโหลด..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">มหาวิทยาลัย</p>
                        <p className="text-lg font-semibold">{application.university}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">คณะ</p>
                        <p className="text-lg font-semibold">{application.faculty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">สาขา</p>
                        <p className="text-lg font-semibold">{application.major}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">วันที่สมัคร</p>
                        <p className="text-lg font-semibold">
                          {new Date(application.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CV Download */}
                  {application.cv_file_path && (
                    <div className="mt-6 pt-6 border-t-2 border-border">
                      <Button
                        onClick={handleDownloadCV}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        ดาวน์โหลด CV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackApplication;

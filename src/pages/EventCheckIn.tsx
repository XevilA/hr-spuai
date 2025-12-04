import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  User, 
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface CheckInResult {
  success: boolean;
  message?: string;
  error?: string;
  checked_in_at?: string;
  registration?: {
    id: string;
    full_name: string;
    email: string;
    participant_type: string;
    checked_in?: boolean;
  };
  event?: {
    id: string;
    title: string;
    event_date: string;
    location: string;
  };
}

const EventCheckIn = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("event-check-in", {
        body: { token, action: "verify" }
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Verify error:", error);
      setResult({ success: false, error: "ไม่พบข้อมูลการลงทะเบียน" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("event-check-in", {
        body: { token, action: "checkin" }
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Check-in error:", error);
      setResult({ success: false, error: "เกิดข้อผิดพลาดในการเช็คอิน" });
    } finally {
      setChecking(false);
    }
  };

  const participantTypeLabel = (type: string) => {
    switch (type) {
      case "spu_student": return "นักศึกษา SPU";
      case "student": return "นักศึกษา";
      case "business": return "ภาคธุรกิจ";
      default: return "บุคคลทั่วไป";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-24 min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {loading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">กำลังตรวจสอบข้อมูล...</p>
              </CardContent>
            </Card>
          ) : result?.error && !result?.registration ? (
            <Card className="border-destructive">
              <CardContent className="py-16 text-center">
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูล</h2>
                <p className="text-muted-foreground mb-6">{result.error}</p>
                <Link to="/events">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับไปหน้ากิจกรรม
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : result?.registration?.checked_in || result?.checked_in_at ? (
            // Already checked in or just checked in successfully
            <Card className="border-green-500">
              <CardHeader className="text-center pb-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <CardTitle className="text-2xl text-green-600">
                  {result?.message || "เช็คอินเรียบร้อยแล้ว!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result?.event && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h3 className="font-semibold text-lg">{result.event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(result.event.event_date), "d MMMM yyyy HH:mm น.", { locale: th })}</span>
                    </div>
                    {result.event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{result.event.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {result?.registration && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{result.registration.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{result.registration.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ประเภท: {participantTypeLabel(result.registration.participant_type)}
                    </p>
                    {result.checked_in_at && (
                      <p className="text-xs text-green-600">
                        เช็คอินเมื่อ: {format(new Date(result.checked_in_at), "d MMM yyyy HH:mm:ss น.", { locale: th })}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-center pt-4">
                  <Link to={`/events/${result?.event?.id}`}>
                    <Button variant="outline">
                      ดูรายละเอียดกิจกรรม
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Ready to check in
            <Card>
              <CardHeader className="text-center">
                <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle>ยืนยันการเช็คอิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result?.event && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h3 className="font-semibold text-lg">{result.event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(result.event.event_date), "d MMMM yyyy HH:mm น.", { locale: th })}</span>
                    </div>
                    {result.event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{result.event.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {result?.registration && (
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{result.registration.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{result.registration.email}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleCheckIn} 
                  className="w-full" 
                  size="lg"
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังเช็คอิน...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      เช็คอินเข้างาน
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default EventCheckIn;

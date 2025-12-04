import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  Share2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  image_url: string | null;
  video_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  location_url: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  event_type: string;
  target_audience: string[];
  form_type: string;
  is_featured: boolean;
  tags: string[];
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    participant_type: "general",
    university: "",
    faculty: "",
    major: "",
    university_year: "",
    company_name: "",
    job_title: "",
    dietary_requirements: "",
    notes: ""
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchRegistrationCount();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("ไม่พบกิจกรรมที่ต้องการ");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCount = async () => {
    try {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id);

      setRegistrationCount(count || 0);
    } catch (error) {
      console.error("Error fetching registration count:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast.error("กรุณากรอกชื่อและอีเมล");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          age: formData.age ? parseInt(formData.age) : null,
          participant_type: formData.participant_type,
          university: formData.university || null,
          faculty: formData.faculty || null,
          major: formData.major || null,
          university_year: formData.university_year ? parseInt(formData.university_year) : null,
          company_name: formData.company_name || null,
          job_title: formData.job_title || null,
          dietary_requirements: formData.dietary_requirements || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      setRegistered(true);
      toast.success("ลงทะเบียนสำเร็จ!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description || event?.description,
          url: window.location.href
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("คัดลอกลิงก์แล้ว!");
    }
  };

  const isRegistrationOpen = event?.registration_deadline 
    ? new Date(event.registration_deadline) > new Date()
    : true;

  const isFull = event?.max_participants 
    ? registrationCount >= event.max_participants
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="aspect-video bg-muted rounded-xl" />
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-primary/10 to-background" />
        
        <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
          <Link to="/events">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้ากิจกรรม
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary">{event.event_type}</Badge>
              {event.is_featured && (
                <Badge className="bg-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  แนะนำ
                </Badge>
              )}
              {event.tags?.map((tag, i) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {format(new Date(event.event_date), "EEEE d MMMM yyyy", { locale: th })}
                  {event.end_date && ` - ${format(new Date(event.end_date), "d MMMM yyyy", { locale: th })}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                  {event.location_url && (
                    <a href={event.location_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                  )}
                </div>
              )}
              {event.max_participants && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{registrationCount}/{event.max_participants} คน</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Image/Video */}
            {event.image_url && (
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดกิจกรรม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            {event.target_audience && event.target_audience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>กลุ่มเป้าหมาย</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.target_audience.map((audience, i) => (
                      <Badge key={i} variant="secondary" className="px-4 py-2">
                        {audience === "all" ? "ทุกคน" : 
                         audience === "student" ? "นักศึกษา" :
                         audience === "spu_student" ? "นักศึกษา SPU" :
                         audience === "general" ? "บุคคลทั่วไป" :
                         audience === "business" ? "ภาคธุรกิจ" : audience}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ลงทะเบียน</CardTitle>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                {event.registration_deadline && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    ลงทะเบียนถึง {format(new Date(event.registration_deadline), "d MMMM yyyy", { locale: th })}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {registered ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">ลงทะเบียนสำเร็จ!</h3>
                    <p className="text-muted-foreground">
                      ขอบคุณที่ลงทะเบียน เราจะส่งข้อมูลเพิ่มเติมไปยังอีเมลของคุณ
                    </p>
                  </div>
                ) : !isRegistrationOpen ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">หมดเวลาลงทะเบียน</h3>
                    <p className="text-muted-foreground">
                      ขออภัย การลงทะเบียนสำหรับกิจกรรมนี้ปิดรับแล้ว
                    </p>
                  </div>
                ) : isFull ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">เต็มแล้ว</h3>
                    <p className="text-muted-foreground">
                      ขออภัย กิจกรรมนี้มีผู้ลงทะเบียนเต็มแล้ว
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>ประเภทผู้เข้าร่วม *</Label>
                      <Select 
                        value={formData.participant_type} 
                        onValueChange={(value) => setFormData({...formData, participant_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spu_student">นักศึกษา SPU</SelectItem>
                          <SelectItem value="student">นักศึกษา (มหาวิทยาลัยอื่น)</SelectItem>
                          <SelectItem value="general">บุคคลทั่วไป</SelectItem>
                          <SelectItem value="business">ภาคธุรกิจ/องค์กร</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>ชื่อ-นามสกุล *</Label>
                      <Input 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="กรอกชื่อ-นามสกุล"
                        required
                      />
                    </div>

                    <div>
                      <Label>อีเมล *</Label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>

                    <div>
                      <Label>อายุ</Label>
                      <Input 
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="อายุ"
                      />
                    </div>

                    {/* Student Fields */}
                    {(formData.participant_type === "spu_student" || formData.participant_type === "student") && (
                      <>
                        <div>
                          <Label>มหาวิทยาลัย</Label>
                          <Input 
                            value={formData.university}
                            onChange={(e) => setFormData({...formData, university: e.target.value})}
                            placeholder={formData.participant_type === "spu_student" ? "มหาวิทยาลัยศรีปทุม" : "ชื่อมหาวิทยาลัย"}
                            defaultValue={formData.participant_type === "spu_student" ? "มหาวิทยาลัยศรีปทุม" : ""}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>คณะ</Label>
                            <Input 
                              value={formData.faculty}
                              onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                              placeholder="คณะ"
                            />
                          </div>
                          <div>
                            <Label>ชั้นปี</Label>
                            <Select 
                              value={formData.university_year} 
                              onValueChange={(value) => setFormData({...formData, university_year: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกชั้นปี" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">ปี 1</SelectItem>
                                <SelectItem value="2">ปี 2</SelectItem>
                                <SelectItem value="3">ปี 3</SelectItem>
                                <SelectItem value="4">ปี 4</SelectItem>
                                <SelectItem value="5">ปี 5+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>สาขา</Label>
                          <Input 
                            value={formData.major}
                            onChange={(e) => setFormData({...formData, major: e.target.value})}
                            placeholder="สาขาวิชา"
                          />
                        </div>
                      </>
                    )}

                    {/* Business Fields */}
                    {formData.participant_type === "business" && (
                      <>
                        <div>
                          <Label>ชื่อบริษัท/องค์กร</Label>
                          <Input 
                            value={formData.company_name}
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                            placeholder="ชื่อบริษัท"
                          />
                        </div>
                        <div>
                          <Label>ตำแหน่งงาน</Label>
                          <Input 
                            value={formData.job_title}
                            onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                            placeholder="ตำแหน่ง"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label>หมายเหตุ (ถ้ามี)</Label>
                      <Textarea 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง"
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? "กำลังลงทะเบียน..." : "ลงทะเบียนเข้าร่วม"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetail;

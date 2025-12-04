import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Users, 
  Eye,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  MapPin,
  Search,
  Download,
  Loader2,
  Mail,
  Send,
  QrCode,
  CheckCircle2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  is_active: boolean;
  tags: string[];
  created_at: string;
}

interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  participant_type: string;
  university: string | null;
  faculty: string | null;
  major: string | null;
  university_year: number | null;
  company_name: string | null;
  job_title: string | null;
  status: string;
  check_in_token: string | null;
  checked_in_at: string | null;
  created_at: string;
}

const eventTypes = [
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "seminar", label: "Seminar" },
  { value: "meetup", label: "Meetup" },
  { value: "competition", label: "Competition" },
  { value: "conference", label: "Conference" },
];

const targetAudienceOptions = [
  { value: "all", label: "ทุกคน" },
  { value: "spu_student", label: "นักศึกษา SPU" },
  { value: "student", label: "นักศึกษาทั่วไป" },
  { value: "general", label: "บุคคลทั่วไป" },
  { value: "business", label: "ภาคธุรกิจ" },
];

const formTypes = [
  { value: "general", label: "ฟอร์มทั่วไป" },
  { value: "student", label: "สำหรับนักศึกษา" },
  { value: "business", label: "สำหรับภาคธุรกิจ" },
  { value: "spu_only", label: "เฉพาะ SPU" },
];

export const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Email state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [includeQR, setIncludeQR] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    image_url: "",
    video_url: "",
    event_date: "",
    end_date: "",
    location: "",
    location_url: "",
    max_participants: "",
    registration_deadline: "",
    event_type: "workshop",
    target_audience: ["all"],
    form_type: "general",
    is_featured: false,
    is_active: true,
    tags: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
      toast.error("ไม่สามารถโหลดข้อมูลการลงทะเบียนได้");
    }
  };

  const handleFileUpload = async (file: File, type: "image" | "video") => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("events")
        .getPublicUrl(filePath);

      if (type === "image") {
        setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, video_url: urlData.publicUrl }));
      }

      toast.success(`อัพโหลด${type === "image" ? "รูปภาพ" : "วิดีโอ"}สำเร็จ!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`ไม่สามารถอัพโหลด${type === "image" ? "รูปภาพ" : "วิดีโอ"}ได้`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      short_description: "",
      image_url: "",
      video_url: "",
      event_date: "",
      end_date: "",
      location: "",
      location_url: "",
      max_participants: "",
      registration_deadline: "",
      event_type: "workshop",
      target_audience: ["all"],
      form_type: "general",
      is_featured: false,
      is_active: true,
      tags: ""
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      short_description: event.short_description || "",
      image_url: event.image_url || "",
      video_url: event.video_url || "",
      event_date: event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : "",
      end_date: event.end_date ? format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm") : "",
      location: event.location || "",
      location_url: event.location_url || "",
      max_participants: event.max_participants?.toString() || "",
      registration_deadline: event.registration_deadline ? format(new Date(event.registration_deadline), "yyyy-MM-dd'T'HH:mm") : "",
      event_type: event.event_type,
      target_audience: event.target_audience || ["all"],
      form_type: event.form_type || "general",
      is_featured: event.is_featured,
      is_active: event.is_active,
      tags: event.tags?.join(", ") || ""
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.event_date) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description || null,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        event_date: formData.event_date,
        end_date: formData.end_date || null,
        location: formData.location || null,
        location_url: formData.location_url || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        registration_deadline: formData.registration_deadline || null,
        event_type: formData.event_type,
        target_audience: formData.target_audience,
        form_type: formData.form_type,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t)
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("อัพเดทกิจกรรมสำเร็จ!");
      } else {
        const { error } = await supabase
          .from("events")
          .insert(eventData);

        if (error) throw error;
        toast.success("สร้างกิจกรรมสำเร็จ!");
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("ลบกิจกรรมสำเร็จ!");
      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("ไม่สามารถลบกิจกรรมได้");
    }
  };

  const toggleAudience = (value: string) => {
    setFormData(prev => {
      const current = prev.target_audience;
      if (current.includes(value)) {
        return { ...prev, target_audience: current.filter(v => v !== value) };
      } else {
        return { ...prev, target_audience: [...current, value] };
      }
    });
  };

  const exportRegistrations = () => {
    if (!registrations.length) {
      toast.error("ไม่มีข้อมูลให้ export");
      return;
    }

    const csvContent = [
      ["ชื่อ", "อีเมล", "เบอร์โทร", "อายุ", "ประเภท", "มหาวิทยาลัย", "คณะ", "ปี", "บริษัท", "ตำแหน่ง", "สถานะ", "วันที่ลงทะเบียน"].join(","),
      ...registrations.map(r => [
        r.full_name,
        r.email,
        r.phone || "",
        r.age || "",
        r.participant_type,
        r.university || "",
        r.faculty || "",
        r.university_year || "",
        r.company_name || "",
        r.job_title || "",
        r.status,
        format(new Date(r.created_at), "dd/MM/yyyy HH:mm")
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `registrations-${selectedEventId}.csv`;
    link.click();
    toast.success("Export สำเร็จ!");
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            กิจกรรมทั้งหมด
          </TabsTrigger>
          <TabsTrigger value="registrations" disabled={!selectedEventId}>
            <Users className="w-4 h-4 mr-2" />
            ผู้ลงทะเบียน {selectedEventId && `(${registrations.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหากิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มกิจกรรม
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "แก้ไขกิจกรรม" : "สร้างกิจกรรมใหม่"}
                  </DialogTitle>
                  <DialogDescription>
                    กรอกรายละเอียดกิจกรรมที่ต้องการจัด
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label>ชื่อกิจกรรม *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="เช่น AI Hackathon 2024"
                        required
                      />
                    </div>

                    <div>
                      <Label>คำอธิบายสั้น</Label>
                      <Input
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="คำอธิบายสั้นๆ สำหรับแสดงในหน้ารายการ"
                      />
                    </div>

                    <div>
                      <Label>รายละเอียดกิจกรรม *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="รายละเอียดกิจกรรมอย่างละเอียด..."
                        rows={5}
                        required
                      />
                    </div>
                  </div>

                  {/* Media */}
                  <div className="space-y-4">
                    <Label>สื่อประกอบ</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "image");
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-20"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 mr-2" />
                              อัพโหลดรูปภาพ
                            </>
                          )}
                        </Button>
                        {formData.image_url && (
                          <div className="mt-2">
                            <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded" />
                          </div>
                        )}
                        <Input
                          className="mt-2"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="หรือใส่ URL รูปภาพ"
                        />
                      </div>

                      <div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "video");
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-20"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <Video className="w-6 h-6 mr-2" />
                              อัพโหลดวิดีโอ
                            </>
                          )}
                        </Button>
                        <Input
                          className="mt-2"
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          placeholder="หรือใส่ URL วิดีโอ"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>วันที่จัดกิจกรรม *</Label>
                      <Input
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>วันที่สิ้นสุด</Label>
                      <Input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>สถานที่</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="เช่น ห้อง 11-901 อาคาร 11"
                      />
                    </div>
                    <div>
                      <Label>ลิงก์แผนที่</Label>
                      <Input
                        value={formData.location_url}
                        onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                        placeholder="Google Maps URL"
                      />
                    </div>
                  </div>

                  {/* Registration Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>จำนวนผู้เข้าร่วมสูงสุด</Label>
                      <Input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                        placeholder="เช่น 50"
                      />
                    </div>
                    <div>
                      <Label>วันสิ้นสุดการลงทะเบียน</Label>
                      <Input
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Event Type & Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ประเภทกิจกรรม</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>รูปแบบฟอร์มลงทะเบียน</Label>
                      <Select
                        value={formData.form_type}
                        onValueChange={(value) => setFormData({ ...formData, form_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <Label>กลุ่มเป้าหมาย</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {targetAudienceOptions.map(option => (
                        <Badge
                          key={option.value}
                          variant={formData.target_audience.includes(option.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAudience(option.value)}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags (คั่นด้วย comma)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="เช่น AI, Machine Learning, Workshop"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                        <Label>กิจกรรมแนะนำ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>เปิดใช้งาน</Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button type="submit">
                      {editingEvent ? "บันทึกการแก้ไข" : "สร้างกิจกรรม"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Events Table */}
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ยังไม่มีกิจกรรม</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>กิจกรรม</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>ผู้ลงทะเบียน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{event.title}</p>
                            {event.is_featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                แนะนำ
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.event_date), "d MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          {event.max_participants ? `0/${event.max_participants}` : "-"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.is_active ? "default" : "secondary"}>
                          {event.is_active ? "เปิด" : "ปิด"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(event)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณต้องการลบกิจกรรม "{event.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(event.id)}>
                                  ลบ
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          {selectedEventId && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    ผู้ลงทะเบียน - {events.find(e => e.id === selectedEventId)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ทั้งหมด {registrations.length} คน | เช็คอินแล้ว {registrations.filter(r => r.checked_in_at).length} คน
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEmailSubject(`[${events.find(e => e.id === selectedEventId)?.title}] `);
                      setEmailMessage("");
                      setSelectedRegistrations([]);
                      setEmailDialogOpen(true);
                    }}
                    disabled={registrations.length === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    ส่งอีเมล
                  </Button>
                  <Button variant="outline" onClick={exportRegistrations}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {registrations.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">ยังไม่มีผู้ลงทะเบียน</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedRegistrations.length === registrations.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRegistrations(registrations.map(r => r.id));
                              } else {
                                setSelectedRegistrations([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>สังกัด</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRegistrations.includes(reg.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRegistrations([...selectedRegistrations, reg.id]);
                                } else {
                                  setSelectedRegistrations(selectedRegistrations.filter(id => id !== reg.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{reg.full_name}</TableCell>
                          <TableCell>{reg.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reg.participant_type === "spu_student" ? "นศ. SPU" :
                               reg.participant_type === "student" ? "นักศึกษา" :
                               reg.participant_type === "business" ? "ธุรกิจ" : "ทั่วไป"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reg.university || reg.company_name || "-"}
                          </TableCell>
                          <TableCell>
                            {reg.checked_in_at ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs">
                                  {format(new Date(reg.checked_in_at), "HH:mm")}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">รอ Check-in</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={reg.status === "checked_in" ? "default" : reg.status === "registered" ? "secondary" : "outline"}>
                              {reg.status === "checked_in" ? "เช็คอินแล้ว" : reg.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Email Dialog */}
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      ส่งอีเมลถึงผู้ลงทะเบียน
                    </DialogTitle>
                    <DialogDescription>
                      {selectedRegistrations.length > 0 
                        ? `ส่งถึง ${selectedRegistrations.length} คนที่เลือก`
                        : `ส่งถึงทั้งหมด ${registrations.length} คน`}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>หัวข้ออีเมล</Label>
                      <Input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="เช่น: ยืนยันการลงทะเบียน AI Hackathon"
                      />
                    </div>

                    <div>
                      <Label>เนื้อหาอีเมล</Label>
                      <Textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="เขียนข้อความที่ต้องการส่งถึงผู้ลงทะเบียน..."
                        rows={8}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-qr"
                        checked={includeQR}
                        onCheckedChange={setIncludeQR}
                      />
                      <Label htmlFor="include-qr" className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        แนบ QR Code สำหรับ Check-in
                      </Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (!emailSubject || !emailMessage) {
                          toast.error("กรุณากรอกหัวข้อและเนื้อหา");
                          return;
                        }
                        
                        setSendingEmail(true);
                        try {
                          const { data, error } = await supabase.functions.invoke("send-event-email", {
                            body: {
                              event_id: selectedEventId,
                              subject: emailSubject,
                              message: emailMessage,
                              recipient_ids: selectedRegistrations.length > 0 ? selectedRegistrations : undefined,
                              include_qr: includeQR
                            }
                          });

                          if (error) throw error;

                          toast.success(`ส่งอีเมลสำเร็จ ${data.sent} ฉบับ!`);
                          if (data.failed > 0) {
                            toast.warning(`ส่งไม่สำเร็จ ${data.failed} ฉบับ`);
                          }
                          setEmailDialogOpen(false);
                        } catch (error: any) {
                          console.error("Email error:", error);
                          toast.error("เกิดข้อผิดพลาดในการส่งอีเมล");
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          ส่งอีเมล
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

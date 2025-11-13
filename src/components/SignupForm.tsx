import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Check, Loader2 } from "lucide-react";

interface Position {
  id: string;
  title: string;
  description: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const applicationSchema = z.object({
  position: z.string().min(1, "กรุณาเลือกตำแหน่งที่สมัคร"),
  fullName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  nickname: z.string().min(1, "กรุณากรอกชื่อเล่น"),
  universityYear: z.string().min(1, "กรุณาเลือกชั้นปี"),
  faculty: z.string().min(2, "กรุณากรอกคณะ"),
  major: z.string().min(2, "กรุณากรอกสาขา"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  lineId: z.string().optional(),
  instagram: z.string().optional(),
  portfolioUrl: z.string().url("URL ไม่ถูกต้อง").optional().or(z.literal("")),
  interestsSkills: z.string().min(20, "กรุณาเขียนอย่างน้อย 20 ตัวอักษร").max(300, "ต้องไม่เกิน 300 ตัวอักษร"),
  motivation: z.string().min(50, "กรุณาเขียนอย่างน้อย 50 ตัวอักษร").max(500, "ต้องไม่เกิน 500 ตัวอักษร"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [suggestingPosition, setSuggestingPosition] = useState(false);
  const totalSteps = 3;

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from("positions")
        .select("id, title, description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("ไม่สามารถโหลดตำแหน่งที่เปิดรับสมัครได้");
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleAISuggest = async () => {
    const formData = watch();
    
    // Validate required fields for AI suggestion
    if (!formData.fullName || !formData.faculty || !formData.major || !formData.universityYear) {
      toast.error("กรุณากรอกข้อมูลส่วนตัวให้ครบก่อนใช้ AI แนะนำ");
      return;
    }

    setSuggestingPosition(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-position", {
        body: {
          fullName: formData.fullName,
          faculty: formData.faculty,
          major: formData.major,
          universityYear: formData.universityYear,
          interestsSkills: formData.interestsSkills || "",
          motivation: formData.motivation || "",
        },
      });

      if (error) throw error;

      if (data?.suggestion) {
        setValue("position", data.suggestion.id);
        toast.success(`AI แนะนำตำแหน่ง: ${data.suggestion.title} ✨`);
      } else {
        toast.info("AI ไม่สามารถแนะนำตำแหน่งได้ กรุณาเลือกเอง");
      }
    } catch (error) {
      console.error("Error suggesting position:", error);
      toast.error("ไม่สามารถใช้ AI แนะนำได้ กรุณาลองอีกครั้ง");
    } finally {
      setSuggestingPosition(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
  });

  const motivation = watch("motivation") || "";
  const interestsSkills = watch("interestsSkills") || "";
  const progress = (step / totalSteps) * 100;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        toast.success("อัพโหลดไฟล์สำเร็จ!");
      }
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === "file-too-large") {
            toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 10MB)");
          } else if (err.code === "file-invalid-type") {
            toast.error("ประเภทไฟล์ไม่ถูกต้อง (รองรับ: PDF, DOC, DOCX, JPG, PNG, HEIC)");
          }
        });
      });
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationForm)[] = [];

    if (step === 1) {
      fieldsToValidate = ["interestsSkills", "position", "fullName", "nickname", "universityYear", "faculty", "major"];
    } else if (step === 2) {
      fieldsToValidate = ["email", "phone"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Determine content-type reliably, including HEIC and Word docs
  const getContentType = (file: File, ext?: string) => {
    if (file.type && file.type !== "application/octet-stream") return file.type;
    const e = (ext || "").toLowerCase();
    switch (e) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "heic":
        return "image/heic";
      case "heif":
        return "image/heif";
      default:
        return "application/octet-stream";
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    console.log("Form submit triggered", { hasFile: !!uploadedFile, data });
    
    if (!uploadedFile) {
      toast.error("กรุณาอัพโหลดไฟล์ Resume/CV");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV file
      const fileExt = uploadedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${data.email}.${fileExt}`;
      const contentType = getContentType(uploadedFile, fileExt);
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, uploadedFile, { contentType });

      if (uploadError) throw uploadError;

      // Insert application
      const { data: insertData, error: insertError } = await supabase.from("applications").insert({
        position_id: data.position,
        full_name: data.fullName,
        nickname: data.nickname,
        university_year: parseInt(data.universityYear),
        faculty: data.faculty,
        major: data.major,
        email: data.email,
        phone: data.phone,
        line_id: data.lineId || null,
        instagram: data.instagram || null,
        portfolio_url: data.portfolioUrl || null,
        interests_skills: data.interestsSkills,
        motivation: data.motivation,
        cv_file_path: fileName,
      }).select();

      if (insertError) throw insertError;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-application-email", {
          body: {
            to: data.email,
            fullName: data.fullName,
            status: "pending"
          },
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail the application if email fails
      }

      // Trigger AI evaluation
      try {
        if (insertData && insertData[0]?.id) {
          await supabase.functions.invoke("evaluate-application", {
            body: { applicationId: insertData[0].id },
          });
        }
      } catch (evalError) {
        console.error("Evaluation error:", evalError);
        // Don't fail the application if evaluation fails
      }

      // Success! Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E5007D", "#0A0A2A"],
      });

      toast.success("🎉 ส่งใบสมัครสำเร็จ! เราจะติดต่อกลับเร็วๆ นี้");
      
      // Reset form after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      if (error.code === "23505") {
        toast.error("อีเมลนี้ถูกใช้ไปแล้ว");
      } else {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            ขั้นตอนที่ {step} จาก {totalSteps}
          </span>
          <span className="text-sm font-medium text-spu-pink">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 bg-white p-8 rounded-3xl shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                ข้อมูลส่วนตัว
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="position">ตำแหน่งที่สมัคร *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAISuggest}
                    disabled={suggestingPosition || loadingPositions}
                    className="text-xs"
                  >
                    {suggestingPosition ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        กำลังวิเคราะห์...
                      </>
                    ) : (
                      <>✨ AI แนะนำ</>
                    )}
                  </Button>
                </div>
                {loadingPositions ? (
                  <div className="mt-1 p-3 border rounded-lg text-muted-foreground">
                    กำลังโหลดตำแหน่ง...
                  </div>
                ) : positions.length === 0 ? (
                  <div className="mt-1 p-3 border border-yellow-500 rounded-lg text-yellow-700 bg-yellow-50">
                    ขณะนี้ยังไม่มีตำแหน่งเปิดรับสมัคร กรุณาลองใหม่ภายหลัง
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => setValue("position", value)}
                    value={watch("position")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="เลือกตำแหน่งที่สนใจ หรือกด AI แนะนำ" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{position.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {position.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.position && (
                  <p className="text-destructive text-sm mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="interestsSkills">
                  ความสนใจ/ความสามารถเบื้องต้น *
                </Label>
                <Textarea
                  id="interestsSkills"
                  {...register("interestsSkills")}
                  className="mt-1 min-h-[120px]"
                  placeholder="เช่น: สนใจ Machine Learning, เคยเขียน Python, ชอบทำ Data Visualization, มีประสบการณ์ทำโปรเจกต์ AI..."
                />
                <div className="flex justify-between mt-1">
                  {errors.interestsSkills && (
                    <p className="text-destructive text-sm">{errors.interestsSkills.message}</p>
                  )}
                  <p
                    className={`text-sm ml-auto ${
                      interestsSkills.length > 300
                        ? "text-destructive"
                        : interestsSkills.length > 250
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {interestsSkills.length}/300 ตัวอักษร
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    className="mt-1"
                    placeholder="สมชาย ใจดี"
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nickname">ชื่อเล่น *</Label>
                  <Input
                    id="nickname"
                    {...register("nickname")}
                    className="mt-1"
                    placeholder="ชาย"
                  />
                  {errors.nickname && (
                    <p className="text-destructive text-sm mt-1">{errors.nickname.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="universityYear">ชั้นปี *</Label>
                <Select
                  onValueChange={(value) => setValue("universityYear", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกชั้นปี" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ปี 1</SelectItem>
                    <SelectItem value="2">ปี 2</SelectItem>
                    <SelectItem value="3">ปี 3</SelectItem>
                    <SelectItem value="4">ปี 4</SelectItem>
                    <SelectItem value="5">ปี 5</SelectItem>
                    <SelectItem value="6">ปี 6</SelectItem>
                  </SelectContent>
                </Select>
                {errors.universityYear && (
                  <p className="text-destructive text-sm mt-1">{errors.universityYear.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="faculty">คณะ *</Label>
                  <Input
                    id="faculty"
                    {...register("faculty")}
                    className="mt-1"
                    placeholder="วิศวกรรมศาสตร์"
                  />
                  {errors.faculty && (
                    <p className="text-destructive text-sm mt-1">{errors.faculty.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="major">สาขา *</Label>
                  <Input
                    id="major"
                    {...register("major")}
                    className="mt-1"
                    placeholder="วิศวกรรมคอมพิวเตอร์"
                  />
                  {errors.major && (
                    <p className="text-destructive text-sm mt-1">{errors.major.message}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                แค่อีกนิดเดียว! 🚀
              </p>
            </motion.div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 bg-white p-8 rounded-3xl shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                ข้อมูลติดต่อ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="mt-1"
                    placeholder="example@spu.ac.th"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="mt-1"
                    placeholder="0812345678"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="lineId">Line ID (ถ้ามี)</Label>
                  <Input
                    id="lineId"
                    {...register("lineId")}
                    className="mt-1"
                    placeholder="mylineid"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram (ถ้ามี)</Label>
                  <Input
                    id="instagram"
                    {...register("instagram")}
                    className="mt-1"
                    placeholder="@myinstagram"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL (ถ้ามี)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  {...register("portfolioUrl")}
                  className="mt-1"
                  placeholder="https://myportfolio.com"
                />
                {errors.portfolioUrl && (
                  <p className="text-destructive text-sm mt-1">{errors.portfolioUrl.message}</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                เกือบเสร็จแล้ว! อีกขั้นตอนเดียว 💪
              </p>
            </motion.div>
          )}

          {/* Step 3: Motivation & CV */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 bg-white p-8 rounded-3xl shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                แรงบันดาลใจและเอกสาร
              </h3>

              <div>
                <Label htmlFor="motivation">
                  ทำไมคุณถึงอยากเข้า SPU AI CLUB? *
                </Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  className="mt-1 min-h-[150px]"
                  placeholder="บอกเราเกี่ยวกับความสนใจในด้าน AI และสิ่งที่คุณอยากเรียนรู้..."
                />
                <div className="flex justify-between mt-1">
                  {errors.motivation && (
                    <p className="text-destructive text-sm">{errors.motivation.message}</p>
                  )}
                  <p
                    className={`text-sm ml-auto ${
                      motivation.length > 500
                        ? "text-destructive"
                        : motivation.length > 400
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {motivation.length}/500 ตัวอักษร
                  </p>
                </div>
              </div>

              <div>
                <Label>Resume / CV *</Label>
                <div
                  {...getRootProps()}
                  className={`mt-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-spu-pink bg-spu-pink/5"
                      : "border-border hover:border-spu-pink hover:bg-spu-pink/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-2 text-spu-pink">
                      <Check className="w-6 h-6" />
                      <span className="font-medium">{uploadedFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, JPG, PNG, HEIC (สูงสุด 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                เยี่ยมมาก! พร้อมส่งใบสมัครแล้ว 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between mt-8 mb-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="touch-manipulation"
            >
              ย้อนกลับ
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="ml-auto bg-spu-pink hover:bg-spu-pink-light touch-manipulation min-h-[44px] px-6"
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || !uploadedFile}
              className="ml-auto bg-spu-pink hover:bg-spu-pink-light touch-manipulation min-h-[44px] px-6 relative z-10"
              onClick={(e) => {
                console.log("Submit button clicked", { isSubmitting, uploadedFile: !!uploadedFile });
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                "ส่งใบสมัคร 🚀"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

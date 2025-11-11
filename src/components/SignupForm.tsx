import { useState } from "react";
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const applicationSchema = z.object({
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
  motivation: z.string().min(50, "กรุณาเขียนอย่างน้อย 50 ตัวอักษร").max(500, "ต้องไม่เกิน 500 ตัวอักษร"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const totalSteps = 3;

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
  const progress = (step / totalSteps) * 100;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
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
            toast.error("ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ PDF, DOCX, JPG, PNG)");
          }
        });
      });
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationForm)[] = [];

    if (step === 1) {
      fieldsToValidate = ["fullName", "nickname", "universityYear", "faculty", "major"];
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

  const onSubmit = async (data: ApplicationForm) => {
    if (!uploadedFile) {
      toast.error("กรุณาอัพโหลดไฟล์ Resume/CV");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload CV file
      const fileExt = uploadedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${data.email}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, uploadedFile);

      if (uploadError) throw uploadError;

      // Insert application
      const { data: insertData, error: insertError } = await supabase.from("applications").insert({
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
                        PDF, DOCX, JPG, PNG (สูงสุด 10MB)
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
        <div className="flex gap-4 justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              ย้อนกลับ
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="ml-auto bg-spu-pink hover:bg-spu-pink-light"
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto bg-spu-pink hover:bg-spu-pink-light"
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

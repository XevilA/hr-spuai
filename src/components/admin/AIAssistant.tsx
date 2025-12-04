import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Brain, Mail, MessageSquare, FileText, Loader2, User, FileUp, ExternalLink, FileSearch } from "lucide-react";
import ReactMarkdown from "react-markdown";

type AIModel = 'gemini' | 'deepseek' | 'glm';
type AIAction = 'analyze-application' | 'generate-email' | 'generate-broadcast' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface Application {
  id: string;
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  faculty: string;
  major: string;
  university: string | null;
  university_year: number;
  motivation: string;
  interests_skills: string | null;
  cv_file_path: string | null;
  portfolio_url: string | null;
  status: string;
  position_id: string | null;
  created_at: string;
  positions?: { title: string } | null;
}

export const AIAssistant = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Analyze Application
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [enableCvParsing, setEnableCvParsing] = useState(true);
  const [cvText, setCvText] = useState<string | null>(null);
  const [parsingCv, setParsingCv] = useState(false);
  
  // Generate Email
  const [emailPrompt, setEmailPrompt] = useState('');
  const [emailResult, setEmailResult] = useState<any>(null);
  
  // Generate Broadcast
  const [broadcastPrompt, setBroadcastPrompt] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Update selected application when ID changes
  useEffect(() => {
    if (selectedApplicationId) {
      const app = applications.find(a => a.id === selectedApplicationId);
      setSelectedApplication(app || null);
      setCvText(null); // Clear CV text when changing application
    } else {
      setSelectedApplication(null);
      setCvText(null);
    }
  }, [selectedApplicationId, applications]);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, positions(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('ไม่สามารถโหลดรายชื่อผู้สมัครได้');
    } finally {
      setLoadingApplications(false);
    }
  };

  const getCvUrl = (cvPath: string | null) => {
    if (!cvPath) return null;
    const { data } = supabase.storage.from('cvs').getPublicUrl(cvPath);
    return data?.publicUrl;
  };

  const getModelBadge = (model: AIModel) => {
    const badges = {
      gemini: { label: 'Gemini 2.5', color: 'bg-blue-500' },
      deepseek: { label: 'DeepSeek V3', color: 'bg-purple-500' },
      glm: { label: 'GLM-4 Plus', color: 'bg-green-500' }
    };
    const badge = badges[model];
    return <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>;
  };

  const callAI = async (action: AIAction, prompt: string, context?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          model: selectedModel,
          action,
          prompt,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const parseCvContent = async (cvPath: string): Promise<string | null> => {
    setParsingCv(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-cv', {
        body: { cv_file_path: cvPath }
      });

      if (error) {
        console.error('CV Parse Error:', error);
        toast.error('ไม่สามารถอ่านไฟล์ CV ได้');
        return null;
      }

      if (data.error) {
        console.warn('CV Parse Warning:', data.error);
        return data.text || null;
      }

      return data.text;
    } catch (error: any) {
      console.error('CV Parse Error:', error);
      toast.error(`เกิดข้อผิดพลาดในการอ่าน CV: ${error.message}`);
      return null;
    } finally {
      setParsingCv(false);
    }
  };

  const handleParseCv = async () => {
    if (!selectedApplication?.cv_file_path) {
      toast.error('ผู้สมัครไม่มีไฟล์ CV');
      return;
    }

    const text = await parseCvContent(selectedApplication.cv_file_path);
    if (text) {
      setCvText(text);
      toast.success('อ่านเนื้อหา CV สำเร็จ!');
    }
  };

  const handleAnalyzeApplication = async () => {
    if (!selectedApplication) {
      toast.error('กรุณาเลือกผู้สมัคร');
      return;
    }

    let cvContent = cvText;
    
    // Auto-parse CV if enabled and has CV file
    if (enableCvParsing && selectedApplication.cv_file_path && !cvContent) {
      toast.info('กำลังอ่านเนื้อหาจากไฟล์ CV...');
      cvContent = await parseCvContent(selectedApplication.cv_file_path);
    }

    // Create context with CV content if available
    const analysisContext = {
      ...selectedApplication,
      cv_content: cvContent || '[ไม่มีไฟล์ CV หรือไม่สามารถอ่านได้]'
    };

    const result = await callAI('analyze-application', analysisPrompt || 'วิเคราะห์ใบสมัครนี้อย่างละเอียด รวมถึงข้อมูลจาก CV', analysisContext);
    if (result) {
      setAnalysisResult(result.content);
      toast.success('วิเคราะห์เสร็จสิ้น!');
    }
  };

  const handleGenerateEmail = async () => {
    if (!emailPrompt.trim()) {
      toast.error('กรุณาระบุคำอธิบายอีเมลที่ต้องการ');
      return;
    }

    const result = await callAI('generate-email', emailPrompt);
    if (result) {
      try {
        const emailData = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        setEmailResult(emailData);
        toast.success('สร้างอีเมลสำเร็จ!');
      } catch {
        setEmailResult({ content: result.content });
        toast.success('สร้างอีเมลสำเร็จ!');
      }
    }
  };

  const handleSaveEmailTemplate = async () => {
    if (!emailResult) return;

    try {
      const { error } = await supabase.from('email_templates').insert({
        name: emailResult.subject || 'AI Generated Template',
        subject: emailResult.subject || 'No Subject',
        html_content: emailResult.html_content || emailResult.content,
        variables: emailResult.variables || [],
        description: `สร้างโดย AI (${selectedModel})`,
        is_active: true
      });

      if (error) throw error;
      toast.success('บันทึก Email Template สำเร็จ!');
    } catch (error: any) {
      console.error('Save Error:', error);
      toast.error(`ไม่สามารถบันทึกได้: ${error.message}`);
    }
  };

  const handleGenerateBroadcast = async () => {
    if (!broadcastPrompt.trim()) {
      toast.error('กรุณาระบุคำอธิบายข้อความที่ต้องการ');
      return;
    }

    const result = await callAI('generate-broadcast', broadcastPrompt);
    if (result) {
      setBroadcastResult(result.content);
      toast.success('สร้างข้อความสำเร็จ!');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    const result = await callAI('chat', chatInput);
    if (result) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.content,
        model: result.model
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Assistant
          </h2>
          <p className="text-muted-foreground">
            ใช้ GenAI ช่วยงาน Admin อัจฉริยะและปลอดภัย
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">เลือก AI Model:</span>
          <Select value={selectedModel} onValueChange={(value: AIModel) => setSelectedModel(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">🌟 Gemini 2.5 (แนะนำ)</SelectItem>
              <SelectItem value="deepseek">⚡ DeepSeek V3</SelectItem>
              <SelectItem value="glm">🚀 GLM-4 Plus</SelectItem>
            </SelectContent>
          </Select>
          {getModelBadge(selectedModel)}
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <Brain className="w-4 h-4 mr-2" />
            วิเคราะห์ใบสมัคร
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            สร้าง Email
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <FileText className="w-4 h-4 mr-2" />
            สร้าง Broadcast
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>
                คุยกับ AI เพื่อขอคำแนะนำและความช่วยเหลือ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4 bg-muted/20">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>เริ่มสนทนากับ AI Assistant</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}>
                        {msg.role === 'assistant' && msg.model && (
                          <div className="text-xs text-muted-foreground mb-1">{msg.model}</div>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="พิมพ์ข้อความของคุณ..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  className="min-h-[60px]"
                />
                <Button onClick={handleSendChat} disabled={loading || !chatInput.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ส่ง'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyze Application Tab */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์ใบสมัคร</CardTitle>
              <CardDescription>
                เลือกผู้สมัครและให้ AI วิเคราะห์ข้อมูลจากใบสมัครและ CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Applicant Selector */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  เลือกผู้สมัคร
                </label>
                <Select value={selectedApplicationId} onValueChange={setSelectedApplicationId}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={loadingApplications ? "กำลังโหลด..." : "เลือกผู้สมัครที่ต้องการวิเคราะห์"} />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.full_name} ({app.nickname}) - {app.positions?.title || 'ไม่ระบุตำแหน่ง'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Application Details */}
              {selectedApplication && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                  <h4 className="font-semibold text-sm text-primary">📋 ข้อมูลผู้สมัคร</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">ชื่อ-นามสกุล:</span>
                      <p className="font-medium">{selectedApplication.full_name} ({selectedApplication.nickname})</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ตำแหน่งที่สมัคร:</span>
                      <p className="font-medium">{selectedApplication.positions?.title || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">คณะ/สาขา:</span>
                      <p className="font-medium">{selectedApplication.faculty} / {selectedApplication.major}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ปี:</span>
                      <p className="font-medium">{selectedApplication.university_year}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">สถานะ:</span>
                      <Badge variant="outline">{selectedApplication.status}</Badge>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div className="mt-3">
                    <span className="text-muted-foreground text-sm">แรงจูงใจในการสมัคร:</span>
                    <p className="text-sm mt-1 p-2 bg-background rounded border">{selectedApplication.motivation}</p>
                  </div>

                  {/* Interests & Skills */}
                  {selectedApplication.interests_skills && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-sm">ความสนใจและทักษะ:</span>
                      <p className="text-sm mt-1 p-2 bg-background rounded border">{selectedApplication.interests_skills}</p>
                    </div>
                  )}

                  {/* CV & Portfolio Links */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {selectedApplication.cv_file_path && (
                      <>
                        <a 
                          href={getCvUrl(selectedApplication.cv_file_path) || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileUp className="w-4 h-4" />
                          ดู CV/Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleParseCv}
                          disabled={parsingCv}
                          className="h-7"
                        >
                          {parsingCv ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <FileSearch className="w-3 h-3 mr-1" />
                          )}
                          อ่านเนื้อหา CV
                        </Button>
                      </>
                    )}
                    {selectedApplication.portfolio_url && (
                      <a 
                        href={selectedApplication.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        ดู Portfolio
                      </a>
                    )}
                  </div>

                  {/* CV Content Preview */}
                  {cvText && (
                    <div className="mt-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm text-green-800 dark:text-green-200 flex items-center gap-1">
                          <FileSearch className="w-4 h-4" />
                          เนื้อหาจาก CV ({cvText.length.toLocaleString()} ตัวอักษร)
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCvText(null)}
                          className="h-6 text-xs"
                        >
                          ล้าง
                        </Button>
                      </div>
                      <div className="max-h-40 overflow-y-auto text-xs bg-background p-2 rounded border">
                        <pre className="whitespace-pre-wrap font-sans">{cvText.slice(0, 2000)}{cvText.length > 2000 ? '...' : ''}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analysis Prompt */}
              <div>
                <label className="text-sm font-medium">คำถามเพิ่มเติมสำหรับ AI (ไม่บังคับ)</label>
                <Textarea
                  placeholder="เช่น: ให้ความเห็นเกี่ยวกับความเหมาะสมสำหรับตำแหน่งนี้, วิเคราะห์จุดแข็งจุดอ่อน, แนะนำคำถามสัมภาษณ์"
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* CV Parsing Option */}
              {selectedApplication?.cv_file_path && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/20">
                  <Checkbox
                    id="enableCvParsing"
                    checked={enableCvParsing}
                    onCheckedChange={(checked) => setEnableCvParsing(checked as boolean)}
                  />
                  <label
                    htmlFor="enableCvParsing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <FileSearch className="w-4 h-4 text-primary" />
                    อ่านและวิเคราะห์เนื้อหาจากไฟล์ CV โดยอัตโนมัติ
                  </label>
                </div>
              )}

              <Button 
                onClick={handleAnalyzeApplication} 
                disabled={loading || parsingCv || !selectedApplication} 
                className="w-full"
              >
                {loading || parsingCv ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                {parsingCv ? 'กำลังอ่าน CV...' : 'วิเคราะห์ใบสมัคร'}
              </Button>
              
              {analysisResult && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    ผลการวิเคราะห์:
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สร้าง Email Template</CardTitle>
              <CardDescription>
                ให้ AI สร้างเนื้อหาอีเมลพร้อม HTML formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">อธิบายอีเมลที่ต้องการ</label>
                <Textarea
                  placeholder="เช่น: สร้างอีเมลแจ้งผลการสัมภาษณ์สำหรับผู้สมัครที่ผ่านการคัดเลือก พร้อมรายละเอียดขั้นตอนถัดไป"
                  value={emailPrompt}
                  onChange={(e) => setEmailPrompt(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <Button onClick={handleGenerateEmail} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                สร้างอีเมล
              </Button>
              
              {emailResult && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold mb-2">Subject:</h3>
                    <p>{emailResult.subject}</p>
                    <h3 className="font-semibold mt-4 mb-2">Preview:</h3>
                    <div 
                      className="p-4 bg-white text-black rounded border" 
                      dangerouslySetInnerHTML={{ __html: emailResult.html_content || emailResult.content }}
                    />
                    {emailResult.variables && emailResult.variables.length > 0 && (
                      <>
                        <h3 className="font-semibold mt-4 mb-2">Variables:</h3>
                        <div className="flex flex-wrap gap-2">
                          {emailResult.variables.map((v: string, i: number) => (
                            <Badge key={i} variant="outline">{v}</Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <Button onClick={handleSaveEmailTemplate} className="w-full">
                    บันทึกเป็น Email Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สร้าง LINE Broadcast Message</CardTitle>
              <CardDescription>
                ให้ AI สร้างข้อความ broadcast ที่น่าสนใจ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">อธิบายข้อความที่ต้องการ</label>
                <Textarea
                  placeholder="เช่น: สร้างข้อความแจ้งเปิดรับสมัครสมาชิกใหม่รอบ 2/2568 พร้อมไฮไลท์สิทธิพิเศษ"
                  value={broadcastPrompt}
                  onChange={(e) => setBroadcastPrompt(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <Button onClick={handleGenerateBroadcast} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                สร้างข้อความ
              </Button>
              
              {broadcastResult && (
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold mb-2">ข้อความที่สร้าง:</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    <ReactMarkdown>{broadcastResult}</ReactMarkdown>
                  </div>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(broadcastResult);
                      toast.success('คัดลอกแล้ว!');
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    คัดลอกข้อความ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
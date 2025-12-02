import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Brain, Mail, MessageSquare, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type AIModel = 'gemini' | 'deepseek' | 'glm';
type AIAction = 'analyze-application' | 'generate-email' | 'generate-broadcast' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

export const AIAssistant = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Analyze Application
  const [applicationId, setApplicationId] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  
  // Generate Email
  const [emailPrompt, setEmailPrompt] = useState('');
  const [emailResult, setEmailResult] = useState<any>(null);
  
  // Generate Broadcast
  const [broadcastPrompt, setBroadcastPrompt] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');

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

  const handleAnalyzeApplication = async () => {
    if (!applicationId.trim()) {
      toast.error('กรุณาระบุ Application ID');
      return;
    }

    // Fetch application data
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error || !application) {
      toast.error('ไม่พบใบสมัครที่ระบุ');
      return;
    }

    const result = await callAI('analyze-application', analysisPrompt || 'วิเคราะห์ใบสมัครนี้', application);
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
                ให้ AI วิเคราะห์ใบสมัครและให้คำแนะนำ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Application ID</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="ระบุ ID ของใบสมัคร"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">คำถามเพิ่มเติม (ถ้ามี)</label>
                <Textarea
                  placeholder="เช่น: ให้ความเห็นเกี่ยวกับความเหมาะสมสำหรับตำแหน่ง AI Developer"
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAnalyzeApplication} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                วิเคราะห์ใบสมัคร
              </Button>
              
              {analysisResult && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-semibold mb-2">ผลการวิเคราะห์:</h3>
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
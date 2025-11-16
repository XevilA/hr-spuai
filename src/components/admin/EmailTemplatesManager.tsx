import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Eye, Code, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  variables: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Temporary type assertion until types are regenerated
type EmailTemplatesTable = any;

export const EmailTemplatesManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    html_content: "",
    variables: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates" as EmailTemplatesTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data as unknown) as EmailTemplate[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("ไม่สามารถโหลด email templates ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      variables: template.variables.join(", "),
      description: template.description || "",
      is_active: template.is_active,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedTemplate) return;

      const variablesArray = formData.variables
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const { error } = await supabase
        .from("email_templates" as EmailTemplatesTable)
        .update({
          subject: formData.subject,
          html_content: formData.html_content,
          variables: variablesArray,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast.success("บันทึก template สำเร็จ!");
      setIsEditing(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error("ไม่สามารถบันทึก template ได้");
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    let html = template.html_content;
    // Replace variables with sample data for preview
    const sampleData: Record<string, string> = {
      fullName: "สมชาย ใจดี",
      position: "Marketing Manager",
      email: "somchai@example.com",
      phone: "0812345678",
      trackingToken: "SAMPLE-TOKEN-123",
      trackingUrl: "https://example.com/track",
      applicationId: "app-123",
      adminUrl: "https://example.com/admin",
    };

    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, value);
    }

    setPreviewHtml(html);
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from("email_templates" as EmailTemplatesTable)
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;

      toast.success(
        template.is_active
          ? "ปิดใช้งาน template แล้ว"
          : "เปิดใช้งาน template แล้ว"
      );
      fetchTemplates();
    } catch (error: any) {
      console.error("Error toggling template:", error);
      toast.error("ไม่สามารถเปลี่ยนสถานะ template ได้");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Template Builder</h2>
          <p className="text-muted-foreground">
            จัดการ template อีเมลสำหรับระบบอัตโนมัติ
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ใช้ <code>{"{{variableName}}"}</code> เพื่อแทรกตัวแปร เช่น{" "}
          <code>{"{{fullName}}"}</code>, <code>{"{{position}}"}</code>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    {template.is_active ? (
                      <Badge variant="default" className="ml-2">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Subject:</p>
                <p className="text-sm text-muted-foreground">
                  {template.subject}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Preview: {template.name}</DialogTitle>
                      <DialogDescription>
                        ตัวอย่าง email (ใช้ข้อมูลทดสอบ)
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className="border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditing && selectedTemplate?.id === template.id} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>แก้ไข Template: {template.name}</DialogTitle>
                      <DialogDescription>
                        แก้ไข email template สำหรับระบบอัตโนมัติ
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">
                          <Code className="w-4 h-4 mr-2" />
                          Edit
                        </TabsTrigger>
                        <TabsTrigger value="preview">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="edit" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            placeholder="Email subject line"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="variables">
                            Variables (comma-separated)
                          </Label>
                          <Input
                            id="variables"
                            value={formData.variables}
                            onChange={(e) =>
                              setFormData({ ...formData, variables: e.target.value })
                            }
                            placeholder="fullName, email, position"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="html_content">HTML Content</Label>
                          <Textarea
                            id="html_content"
                            value={formData.html_content}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                html_content: e.target.value,
                              })
                            }
                            placeholder="HTML email template"
                            className="font-mono text-sm min-h-[400px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Template description"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, is_active: checked })
                            }
                          />
                          <Label htmlFor="is_active">Active</Label>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSave} className="flex-1">
                            บันทึก
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setSelectedTemplate(null);
                            }}
                            className="flex-1"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="preview">
                        <div
                          className="border rounded-lg p-4 bg-white min-h-[400px]"
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              let html = formData.html_content;
                              const sampleData: Record<string, string> = {
                                fullName: "สมชาย ใจดี",
                                position: "Marketing Manager",
                                email: "somchai@example.com",
                                phone: "0812345678",
                                trackingToken: "SAMPLE-TOKEN-123",
                                trackingUrl: "https://example.com/track",
                                applicationId: "app-123",
                                adminUrl: "https://example.com/admin",
                              };
                              for (const [key, value] of Object.entries(sampleData)) {
                                const regex = new RegExp(`{{${key}}}`, "g");
                                html = html.replace(regex, value);
                              }
                              return html;
                            })(),
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Status:
                </span>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => handleToggleActive(template)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

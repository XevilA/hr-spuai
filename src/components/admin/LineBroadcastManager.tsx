import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

export const LineBroadcastManager = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "กรุณาใส่ข้อความที่ต้องการส่ง",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-line-notification", {
        body: {
          type: "broadcast",
          customMessage: message,
        },
      });

      if (error) throw error;

      toast({
        title: "ส่งข้อความสำเร็จ",
        description: "ข้อความถูกส่งไปยังผู้ติดตามทั้งหมดแล้ว",
      });
      setMessage("");
    } catch (error: any) {
      console.error("Error sending broadcast:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งข้อความได้",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ส่งข้อความ LINE Broadcast</CardTitle>
        <CardDescription>
          ส่งข้อความไปยังผู้ติดตาม LINE Bot ทั้งหมด
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ข้อความ</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ใส่ข้อความที่ต้องการส่งถึงผู้ติดตามทั้งหมด..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            ข้อความนี้จะถูกส่งไปยังผู้ติดตาม LINE Bot ทั้งหมด
          </p>
        </div>

        <Button
          onClick={handleSendBroadcast}
          disabled={sending || !message.trim()}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังส่ง...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              ส่งข้อความ
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

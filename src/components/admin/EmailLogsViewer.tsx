import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, Search, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface EmailLog {
  id: string;
  queue_id: string | null;
  template_name: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message: string | null;
  retry_attempt: number;
  sent_at: string;
}

interface QueueStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

export const EmailLogsViewer = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<QueueStats>({ pending: 0, processing: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [processingQueue, setProcessingQueue] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchQueueStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLogs();
      fetchQueueStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [searchEmail]);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (searchEmail) {
        query = query.ilike("recipient_email", `%${searchEmail}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data as unknown) as EmailLog[]);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      toast.error("ไม่สามารถโหลด email logs ได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueStats = async () => {
    try {
      const { data, error } = await supabase
        .from("email_queue")
        .select("status");

      if (error) throw error;

      const stats = {
        pending: data?.filter((item: any) => item.status === "pending").length || 0,
        processing: data?.filter((item: any) => item.status === "processing").length || 0,
        sent: data?.filter((item: any) => item.status === "sent").length || 0,
        failed: data?.filter((item: any) => item.status === "failed").length || 0,
      };

      setStats(stats);
    } catch (error: any) {
      console.error("Error fetching queue stats:", error);
    }
  };

  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue");

      if (error) throw error;

      toast.success(`ประมวลผลคิวสำเร็จ: ${data.successful} ส่ง, ${data.failed} ล้มเหลว`);
      fetchLogs();
      fetchQueueStats();
    } catch (error: any) {
      console.error("Error processing queue:", error);
      toast.error("ไม่สามารถประมวลผลคิวได้");
    } finally {
      setProcessingQueue(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Logs & Queue</h2>
        <p className="text-muted-foreground">
          ติดตามสถานะการส่งอีเมลและจัดการคิว
        </p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">รออยู่ในคิว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">กำลังส่ง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">ส่งสำเร็จ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">ล้มเหลว</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>
                ประวัติการส่งอีเมลทั้งหมด (100 รายการล่าสุด)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleProcessQueue}
                disabled={processingQueue}
                variant="default"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${processingQueue ? 'animate-spin' : ''}`} />
                ประมวลผลคิว
              </Button>
              <Button onClick={() => { fetchLogs(); fetchQueueStats(); }} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยอีเมล..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Retry</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      ไม่มี email logs
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.template_name}
                        </code>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.recipient_email}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.subject}
                      </TableCell>
                      <TableCell>
                        {log.retry_attempt > 0 && (
                          <Badge variant="outline">{log.retry_attempt}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {log.error_message && (
                          <span className="text-xs text-red-500 truncate max-w-xs block">
                            {log.error_message}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

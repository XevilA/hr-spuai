import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, Search, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Send, Edit } from "lucide-react";
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

interface QueueItem {
  id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  retry_count: number;
  scheduled_at: string;
  created_at: string;
  variables: any;
}

interface QueueStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

export const EmailLogsViewer = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({ pending: 0, processing: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [processingQueue, setProcessingQueue] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'log' | 'queue' } | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchQueueItems();
    fetchQueueStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLogs();
      fetchQueueItems();
      fetchQueueStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [searchEmail]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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
      
      // Filter only valid email addresses
      const validLogs = ((data as unknown) as EmailLog[]).filter(log => 
        isValidEmail(log.recipient_email)
      );
      setLogs(validLogs);
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      toast.error("ไม่สามารถโหลด email logs ได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueItems = async () => {
    try {
      let query = supabase
        .from("email_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchEmail) {
        query = query.ilike("recipient_email", `%${searchEmail}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter only valid email addresses
      const validQueue = ((data as unknown) as QueueItem[]).filter(item => 
        isValidEmail(item.recipient_email)
      );
      setQueueItems(validQueue);
    } catch (error: any) {
      console.error("Error fetching queue items:", error);
      toast.error("ไม่สามารถโหลด email queue ได้");
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
      fetchQueueItems();
      fetchQueueStats();
      setSelectedEmails(new Set());
    } catch (error: any) {
      console.error("Error processing queue:", error);
      toast.error("ไม่สามารถประมวลผลคิวได้");
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleProcessSelected = async () => {
    if (selectedEmails.size === 0) {
      toast.error("กรุณาเลือกอีเมลที่ต้องการส่ง");
      return;
    }

    setProcessingQueue(true);
    try {
      // Update selected items to processing status
      const selectedIds = Array.from(selectedEmails);
      
      await supabase
        .from("email_queue")
        .update({ status: "pending", scheduled_at: new Date().toISOString() })
        .in("id", selectedIds);

      const { data, error } = await supabase.functions.invoke("process-email-queue");

      if (error) throw error;

      toast.success(`ส่งอีเมลที่เลือกสำเร็จ: ${data.successful} ส่ง, ${data.failed} ล้มเหลว`);
      fetchLogs();
      fetchQueueItems();
      fetchQueueStats();
      setSelectedEmails(new Set());
    } catch (error: any) {
      console.error("Error processing selected emails:", error);
      toast.error("ไม่สามารถส่งอีเมลที่เลือกได้");
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const table = itemToDelete.type === 'log' ? 'email_logs' : 'email_queue';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      toast.success("ลบสำเร็จ");
      
      if (itemToDelete.type === 'log') {
        fetchLogs();
      } else {
        fetchQueueItems();
        fetchQueueStats();
      }
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast.error("ไม่สามารถลบได้");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleToggleEmail = (id: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedEmails.size === queueItems.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(queueItems.map(item => item.id)));
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
        <h2 className="text-2xl font-bold">Email Management</h2>
        <p className="text-muted-foreground">
          จัดการคิวและติดตามประวัติการส่งอีเมล (แสดงเฉพาะอีเมลที่ถูกต้อง)
        </p>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Tabs for Queue and Logs */}
      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Email Queue ({queueItems.length})</TabsTrigger>
          <TabsTrigger value="logs">Email Logs ({logs.length})</TabsTrigger>
        </TabsList>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Queue</CardTitle>
                  <CardDescription>
                    จัดการคิวอีเมลที่รอส่ง - เลือกเฉพาะที่ต้องการหรือส่งทั้งหมด
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcessSelected}
                    disabled={processingQueue || selectedEmails.size === 0}
                    variant="default"
                  >
                    <Send className={`w-4 h-4 mr-2 ${processingQueue ? 'animate-spin' : ''}`} />
                    ส่งที่เลือก ({selectedEmails.size})
                  </Button>
                  <Button
                    onClick={handleProcessQueue}
                    disabled={processingQueue}
                    variant="secondary"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${processingQueue ? 'animate-spin' : ''}`} />
                    ส่งทั้งหมด
                  </Button>
                  <Button onClick={() => { fetchQueueItems(); fetchQueueStats(); }} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEmails.size === queueItems.length && queueItems.length > 0}
                          onCheckedChange={handleToggleAll}
                        />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Retry</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          ไม่มีอีเมลในคิว
                        </TableCell>
                      </TableRow>
                    ) : (
                      queueItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEmails.has(item.id)}
                              onCheckedChange={() => handleToggleEmail(item.id)}
                            />
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {item.template_name}
                            </code>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.recipient_email}
                          </TableCell>
                          <TableCell>
                            {item.retry_count > 0 && (
                              <Badge variant="outline">{item.retry_count}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(item.scheduled_at), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {item.error_message && (
                              <span className="text-xs text-red-500 truncate max-w-xs block">
                                {item.error_message}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ id: item.id, type: 'queue' });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Logs</CardTitle>
                  <CardDescription>
                    ประวัติการส่งอีเมลทั้งหมด (100 รายการล่าสุด)
                  </CardDescription>
                </div>
                <Button onClick={() => { fetchLogs(); }} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ id: log.id, type: 'log' });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

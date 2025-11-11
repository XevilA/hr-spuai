import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Search, Mail } from "lucide-react";

type Application = {
  id: string;
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  university_year: number;
  faculty: string;
  major: string;
  status: string;
  cv_file_path: string | null;
  created_at: string;
  match_percentage: number | null;
  ai_evaluation: string | null;
  position_id: string | null;
  positions?: {
    title: string;
  } | null;
};

export const ApplicationsTable = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          positions (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );

      toast({
        title: "Success",
        description: "Application status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadCV = async (filePath: string, name: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CV_${name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openMessageDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setMessageSubject(`Regarding Your Application to SPU AI CLUB`);
    setMessageContent("");
    setMessageDialogOpen(true);
  };

  const sendMessage = async () => {
    if (!selectedApplicant) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.functions.invoke("send-message-to-applicant", {
        body: {
          to: selectedApplicant.email,
          subject: messageSubject,
          message: messageContent,
          applicantName: selectedApplicant.full_name,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setMessageDialogOpen(false);
      setMessageSubject("");
      setMessageContent("");
      setSelectedApplicant(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or nickname..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Match %</TableHead>
              <TableHead>AI Evaluation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CV</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApps.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.full_name}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-spu-pink">
                    {app.positions?.title || "N/A"}
                  </span>
                </TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>Year {app.university_year}</TableCell>
                <TableCell className="text-sm">{app.faculty}</TableCell>
                <TableCell>
                  <span className={`font-bold ${
                    (app.match_percentage || 0) >= 70 ? 'text-green-600' :
                    (app.match_percentage || 0) >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {app.match_percentage ? `${app.match_percentage}%` : '-'}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {app.ai_evaluation || 'Pending...'}
                  </p>
                </TableCell>
                <TableCell>
                  <Select
                    value={app.status}
                    onValueChange={(value) => updateStatus(app.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {app.cv_file_path && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadCV(app.cv_file_path!, app.full_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openMessageDialog(app)}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(app.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No applications found
        </div>
      )}

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedApplicant?.full_name}</DialogTitle>
            <DialogDescription>
              Send a personalized message to the applicant at {selectedApplicant?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[200px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!messageSubject || !messageContent || sendingMessage}
            >
              {sendingMessage ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

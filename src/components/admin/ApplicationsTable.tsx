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
import { Download, Search, Mail, Eye } from "lucide-react";

type Application = {
  id: string;
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  university_year: number;
  faculty: string;
  major: string;
  line_id: string | null;
  instagram: string | null;
  portfolio_url: string | null;
  motivation: string;
  interests_skills: string | null;
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
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
      // Get application details before updating
      const { data: application, error: fetchError } = await supabase
        .from("applications")
        .select("email, full_name")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );

      // Send status update email for review, approved, and rejected
      if (["review", "approved", "rejected"].includes(status)) {
        try {
          await supabase.functions.invoke("send-application-email", {
            body: {
              to: application.email,
              fullName: application.full_name,
              status: status
            }
          });
          console.log(`Status update email sent for ${status}`);
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
        }
      }

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

  const openDetailsDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setDetailsDialogOpen(true);
  };

  const openMessageDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setMessageSubject(`Regarding Your Application to SPU AI CLUB`);
    setMessageContent("");
    setMessageEmail(applicant.email);
    setMessageDialogOpen(true);
  };

  const sendMessage = async () => {
    if (!selectedApplicant) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.functions.invoke("send-message-to-applicant", {
        body: {
          to: messageEmail,
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
      setMessageEmail("");
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
              <TableHead>Match %</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>
                  <span className={`font-bold ${
                    (app.match_percentage || 0) >= 70 ? 'text-green-600' :
                    (app.match_percentage || 0) >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {app.match_percentage ? `${app.match_percentage}%` : '-'}
                  </span>
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailsDialog(app)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openMessageDialog(app)}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {app.cv_file_path && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadCV(app.cv_file_path!, app.full_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete application information for {selectedApplicant?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                <p className="text-sm">{selectedApplicant?.full_name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Nickname</label>
                <p className="text-sm">{selectedApplicant?.nickname}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Email</label>
                <p className="text-sm">{selectedApplicant?.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                <p className="text-sm">{selectedApplicant?.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Line ID</label>
                <p className="text-sm">{selectedApplicant?.line_id || "-"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Instagram</label>
                <p className="text-sm">{selectedApplicant?.instagram || "-"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">University Year</label>
                <p className="text-sm">Year {selectedApplicant?.university_year}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Faculty</label>
                <p className="text-sm">{selectedApplicant?.faculty}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Major</label>
                <p className="text-sm">{selectedApplicant?.major}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Applied Position</label>
                <p className="text-sm font-medium text-spu-pink">
                  {selectedApplicant?.positions?.title || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Match Score</label>
                <p className={`text-sm font-bold ${
                  (selectedApplicant?.match_percentage || 0) >= 70 ? 'text-green-600' :
                  (selectedApplicant?.match_percentage || 0) >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {selectedApplicant?.match_percentage ? `${selectedApplicant.match_percentage}%` : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Application Date</label>
                <p className="text-sm">
                  {selectedApplicant?.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Interests & Skills</label>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {selectedApplicant?.interests_skills || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Motivation</label>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {selectedApplicant?.motivation || "-"}
              </p>
            </div>

            {selectedApplicant?.portfolio_url && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Portfolio</label>
                <a 
                  href={selectedApplicant.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-spu-pink hover:underline"
                >
                  {selectedApplicant.portfolio_url}
                </a>
              </div>
            )}

            {selectedApplicant?.ai_evaluation && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">AI Evaluation</label>
                <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {selectedApplicant.ai_evaluation}
                </p>
              </div>
            )}

            {selectedApplicant?.cv_file_path && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">CV</label>
                <Button
                  variant="outline"
                  onClick={() => downloadCV(selectedApplicant.cv_file_path!, selectedApplicant.full_name)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download CV
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedApplicant?.full_name}</DialogTitle>
            <DialogDescription>
              Send a personalized message to the applicant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                value={messageEmail}
                onChange={(e) => setMessageEmail(e.target.value)}
                placeholder="recipient@email.com"
                type="email"
              />
              <p className="text-xs text-muted-foreground">
                Default: {selectedApplicant?.email}
              </p>
            </div>
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
              disabled={!messageSubject || !messageContent || !messageEmail || sendingMessage}
            >
              {sendingMessage ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

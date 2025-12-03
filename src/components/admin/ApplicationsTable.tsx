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
} from "@/components/ui/dialog";
import { Download, Search, Mail, Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

type Position = {
  id: string;
  title: string;
};

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
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Application>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveForm, setApproveForm] = useState({
    department: "",
    division: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchPositions();
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

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from("positions")
        .select("id, title")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      setPositions(data || []);
    } catch (error: any) {
      console.error("Error fetching positions:", error);
    }
  };

  const updatePosition = async (id: string, positionId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ position_id: positionId })
        .eq("id", id);

      if (error) throw error;

      // Refresh to get updated position title
      fetchApplications();

      toast({
        title: "สำเร็จ",
        description: "อัพเดทตำแหน่งเรียบร้อยแล้ว",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

      // Send status update email for reviewing, accepted, and rejected
      if (["reviewing", "accepted", "rejected"].includes(status)) {
        try {
          const emailStatus = status === "reviewing" ? "review" : status === "accepted" ? "approved" : status;
          await supabase.functions.invoke("send-application-email", {
            body: {
              to: application.email,
              fullName: application.full_name,
              status: emailStatus
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

  const openEditDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setEditForm({
      full_name: applicant.full_name,
      nickname: applicant.nickname,
      email: applicant.email,
      phone: applicant.phone,
      line_id: applicant.line_id || "",
      instagram: applicant.instagram || "",
      university_year: applicant.university_year,
      faculty: applicant.faculty,
      major: applicant.major,
      motivation: applicant.motivation,
      interests_skills: applicant.interests_skills || "",
      portfolio_url: applicant.portfolio_url || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setDeleteDialogOpen(true);
  };

  const openApproveDialog = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setApproveForm({
      department: "",
      division: "",
      description: "",
    });
    setApproveDialogOpen(true);
  };

  const approveToTeam = async () => {
    if (!selectedApplicant) return;
    if (!approveForm.department) {
      toast({
        title: "Error",
        description: "กรุณาระบุฝ่าย",
        variant: "destructive",
      });
      return;
    }

    setApproving(true);
    try {
      // Insert into team_members
      const { error: insertError } = await supabase.from("team_members").insert([
        {
          application_id: selectedApplicant.id,
          full_name: selectedApplicant.full_name,
          nickname: selectedApplicant.nickname,
          email: selectedApplicant.email,
          phone: selectedApplicant.phone,
          position: selectedApplicant.positions?.title || "Member",
          department: approveForm.department,
          division: approveForm.division || null,
          description: approveForm.description || null,
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      // Update application status to accepted
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("id", selectedApplicant.id);

      if (updateError) throw updateError;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplicant.id ? { ...app, status: "accepted" } : app
        )
      );

      toast({
        title: "สำเร็จ",
        description: `เพิ่ม ${selectedApplicant.full_name} เป็นสมาชิกทีมเรียบร้อยแล้ว`,
      });
      setApproveDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const updateApplicant = async () => {
    if (!selectedApplicant) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          full_name: editForm.full_name,
          nickname: editForm.nickname,
          email: editForm.email,
          phone: editForm.phone,
          line_id: editForm.line_id || null,
          instagram: editForm.instagram || null,
          university_year: editForm.university_year,
          faculty: editForm.faculty,
          major: editForm.major,
          motivation: editForm.motivation,
          interests_skills: editForm.interests_skills || null,
          portfolio_url: editForm.portfolio_url || null,
        })
        .eq("id", selectedApplicant.id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplicant.id ? { ...app, ...editForm } : app
        )
      );

      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
      setEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteApplicant = async () => {
    if (!selectedApplicant) return;
    setDeleting(true);
    try {
      // Delete CV file if exists
      if (selectedApplicant.cv_file_path) {
        await supabase.storage
          .from("cvs")
          .remove([selectedApplicant.cv_file_path]);
      }

      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", selectedApplicant.id);

      if (error) throw error;

      setApplications((prev) =>
        prev.filter((app) => app.id !== selectedApplicant.id)
      );

      toast({
        title: "สำเร็จ",
        description: "ลบข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
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
            <SelectItem value="accepted">Accepted</SelectItem>
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
                  <Select
                    value={app.position_id || "none"}
                    onValueChange={(value) => {
                      if (value !== "none") updatePosition(app.id, value);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue>
                        <span className="text-sm font-medium text-spu-pink">
                          {app.positions?.title || "N/A"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailsDialog(app)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(app)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openMessageDialog(app)}
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {app.cv_file_path && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadCV(app.cv_file_path!, app.full_name)}
                        title="Download CV"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteDialog(app)}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {app.status !== "accepted" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openApproveDialog(app)}
                        className="bg-green-600 hover:bg-green-700"
                        title="Approve to Team"
                      >
                        <UserPlus className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้สมัคร</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของ {selectedApplicant?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ-นามสกุล</Label>
                <Input
                  value={editForm.full_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ชื่อเล่น</Label>
                <Input
                  value={editForm.nickname || ""}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทร</Label>
                <Input
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Line ID</Label>
                <Input
                  value={editForm.line_id || ""}
                  onChange={(e) => setEditForm({ ...editForm, line_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={editForm.instagram || ""}
                  onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ชั้นปี</Label>
                <Input
                  type="number"
                  value={editForm.university_year || ""}
                  onChange={(e) => setEditForm({ ...editForm, university_year: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>คณะ</Label>
                <Input
                  value={editForm.faculty || ""}
                  onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>สาขา</Label>
                <Input
                  value={editForm.major || ""}
                  onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Portfolio URL</Label>
                <Input
                  value={editForm.portfolio_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, portfolio_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ทักษะและความสนใจ</Label>
              <Textarea
                value={editForm.interests_skills || ""}
                onChange={(e) => setEditForm({ ...editForm, interests_skills: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>แรงจูงใจในการสมัคร</Label>
              <Textarea
                value={editForm.motivation || ""}
                onChange={(e) => setEditForm({ ...editForm, motivation: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={updateApplicant} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบข้อมูลผู้สมัคร "{selectedApplicant?.full_name}" หรือไม่?
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteApplicant}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "กำลังลบ..." : "ลบ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve to Team Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>อนุมัติเป็นสมาชิกทีม</DialogTitle>
            <DialogDescription>
              เพิ่ม {selectedApplicant?.full_name} เป็นสมาชิกทีม SPU AI CLUB
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล</Label>
              <Input value={selectedApplicant?.full_name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>ตำแหน่ง</Label>
              <Input value={selectedApplicant?.positions?.title || "Member"} disabled />
            </div>
            <div className="space-y-2">
              <Label>ฝ่าย *</Label>
              <Input
                value={approveForm.department}
                onChange={(e) => setApproveForm({ ...approveForm, department: e.target.value })}
                placeholder="เช่น ฝ่ายบริหาร, ฝ่าย Creator, ฝ่าย Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>สังกัด</Label>
              <Input
                value={approveForm.division}
                onChange={(e) => setApproveForm({ ...approveForm, division: e.target.value })}
                placeholder="เช่น Development Team, Content Team"
              />
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea
                value={approveForm.description}
                onChange={(e) => setApproveForm({ ...approveForm, description: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={approving}>
              ยกเลิก
            </Button>
            <Button onClick={approveToTeam} disabled={approving} className="bg-green-600 hover:bg-green-700">
              {approving ? "กำลังดำเนินการ..." : "อนุมัติ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

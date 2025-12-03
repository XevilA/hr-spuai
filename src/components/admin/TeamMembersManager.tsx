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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";

type TeamMember = {
  id: string;
  application_id: string | null;
  full_name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  position: string;
  department: string;
  division: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

type MemberForm = {
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  photo_url: string;
  position: string;
  department: string;
  division: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const defaultForm: MemberForm = {
  full_name: "",
  nickname: "",
  email: "",
  phone: "",
  photo_url: "",
  position: "",
  department: "",
  division: "",
  description: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  is_active: true,
};

export const TeamMembersManager = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<MemberForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("department", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
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

  const filterMembers = () => {
    let filtered = [...members];
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMembers(filtered);
  };

  const openCreateDialog = () => {
    setSelectedMember(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setForm({
      full_name: member.full_name,
      nickname: member.nickname || "",
      email: member.email || "",
      phone: member.phone || "",
      photo_url: member.photo_url || "",
      position: member.position,
      department: member.department,
      division: member.division || "",
      description: member.description || "",
      start_date: member.start_date,
      end_date: member.end_date || "",
      is_active: member.is_active,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const saveMember = async () => {
    if (!form.full_name || !form.position || !form.department) {
      toast({
        title: "Error",
        description: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, ตำแหน่ง, ฝ่าย)",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const memberData = {
        full_name: form.full_name,
        nickname: form.nickname || null,
        email: form.email || null,
        phone: form.phone || null,
        photo_url: form.photo_url || null,
        position: form.position,
        department: form.department,
        division: form.division || null,
        description: form.description || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        is_active: form.is_active,
      };

      if (selectedMember) {
        const { error } = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", selectedMember.id);
        if (error) throw error;
        toast({ title: "สำเร็จ", description: "อัพเดทสมาชิกทีมเรียบร้อยแล้ว" });
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert([memberData]);
        if (error) throw error;
        toast({ title: "สำเร็จ", description: "เพิ่มสมาชิกทีมเรียบร้อยแล้ว" });
      }

      setDialogOpen(false);
      fetchMembers();
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

  const deleteMember = async () => {
    if (!selectedMember) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) throw error;
      toast({ title: "สำเร็จ", description: "ลบสมาชิกทีมเรียบร้อยแล้ว" });
      setDeleteDialogOpen(false);
      fetchMembers();
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูลทีม...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, ฝ่าย, ตำแหน่ง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มสมาชิกทีม
        </Button>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">ยังไม่มีสมาชิกทีม</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สมาชิก</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>ฝ่าย</TableHead>
                <TableHead>สังกัด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.photo_url || undefined} />
                        <AvatarFallback className="bg-spu-pink/10 text-spu-pink text-xs">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        {member.nickname && (
                          <p className="text-xs text-muted-foreground">({member.nickname})</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-spu-pink/10 text-spu-pink">
                      {member.position}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>{member.division || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "default" : "outline"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(member)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? "แก้ไขสมาชิกทีม" : "เพิ่มสมาชิกทีม"}
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลสมาชิกทีม
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ-นามสกุล *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ชื่อเล่น</Label>
                <Input
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทร</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ตำแหน่ง *</Label>
                <Input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="เช่น President, Developer"
                />
              </div>
              <div className="space-y-2">
                <Label>ฝ่าย *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="เช่น ฝ่ายบริหาร, ฝ่าย Creator"
                />
              </div>
              <div className="space-y-2">
                <Label>สังกัด</Label>
                <Input
                  value={form.division}
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                  placeholder="เช่น Development Team"
                />
              </div>
              <div className="space-y-2">
                <Label>รูปภาพ (URL)</Label>
                <Input
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>วันที่เริ่ม *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>วันที่สิ้นสุด</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label htmlFor="is_active">สถานะ Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={saveMember} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ "{selectedMember?.full_name}" ออกจากทีมหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteMember}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "กำลังลบ..." : "ลบ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
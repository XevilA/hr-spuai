import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit } from "lucide-react";

interface Position {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  is_active: boolean;
}

export const PositionsManager = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        const { error } = await supabase
          .from("positions")
          .update(formData)
          .eq("id", editingPosition.id);

        if (error) throw error;
        toast({ title: "Success", description: "Position updated successfully" });
      } else {
        const { error } = await supabase.from("positions").insert(formData);
        if (error) throw error;
        toast({ title: "Success", description: "Position created successfully" });
      }

      setFormData({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        is_active: true,
      });
      setEditingPosition(null);
      setIsDialogOpen(false);
      fetchPositions();
    } catch (error) {
      console.error("Error saving position:", error);
      toast({
        title: "Error",
        description: "Failed to save position",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    try {
      const { error } = await supabase.from("positions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Position deleted successfully" });
      fetchPositions();
    } catch (error) {
      console.error("Error deleting position:", error);
      toast({
        title: "Error",
        description: "Failed to delete position",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("positions")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Position status updated" });
      fetchPositions();
    } catch (error) {
      console.error("Error updating position:", error);
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive",
      });
    }
  };

  const openDialog = (position?: Position) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        title: position.title,
        description: position.description,
        requirements: position.requirements,
        responsibilities: position.responsibilities,
        is_active: position.is_active,
      });
    } else {
      setEditingPosition(null);
      setFormData({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Positions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? "Edit Position" : "Add New Position"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Position Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Position</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingPosition ? "Update" : "Create"} Position
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {positions.map((position) => (
          <Card key={position.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {position.title}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      position.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {position.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Switch
                    checked={position.is_active}
                    onCheckedChange={() => toggleActive(position.id, position.is_active)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDialog(position)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(position.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">{position.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Requirements</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {position.requirements}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Responsibilities</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {position.responsibilities}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

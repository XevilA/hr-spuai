import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { UserRolesManager } from "@/components/admin/UserRolesManager";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { PositionsManager } from "@/components/admin/PositionsManager";
import { Dashboard } from "@/components/admin/Dashboard";
import { EmailTemplatesManager } from "@/components/admin/EmailTemplatesManager";
import { EmailLogsViewer } from "@/components/admin/EmailLogsViewer";
import { LineBroadcastManager } from "@/components/admin/LineBroadcastManager";
import { AIAssistant } from "@/components/admin/AIAssistant";
import { TeamMembersManager } from "@/components/admin/TeamMembersManager";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || !roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      setUserRole(roleData.role);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spu-pink mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            HR@SPU AI CLUB Admin
          </h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="ai-assistant">🤖 AI Assistant</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="team-members">👥 Team</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="emails">Email Templates</TabsTrigger>
              <TabsTrigger value="email-logs">Email Logs</TabsTrigger>
              <TabsTrigger value="line-broadcast">LINE Broadcast</TabsTrigger>
              {userRole === "super_admin" && (
                <TabsTrigger value="users">User Management</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="ai-assistant">
              <AIAssistant />
            </TabsContent>

            <TabsContent value="applications">
              <ApplicationsTable />
            </TabsContent>

            <TabsContent value="team-members">
              <TeamMembersManager />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectsManager />
            </TabsContent>

            <TabsContent value="positions">
              <PositionsManager />
            </TabsContent>

            <TabsContent value="emails">
              <EmailTemplatesManager />
            </TabsContent>

            <TabsContent value="email-logs">
              <EmailLogsViewer />
            </TabsContent>

            <TabsContent value="line-broadcast">
              <LineBroadcastManager />
            </TabsContent>

            {userRole === "super_admin" && (
              <TabsContent value="users">
                <UserRolesManager />
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Stats = {
  total: number;
  pending: number;
  reviewing: number;
  accepted: number;
  rejected: number;
};

type PositionStat = {
  name: string;
  count: number;
};

type MatchStat = {
  name: string;
  count: number;
};

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });
  const [positionStats, setPositionStats] = useState<PositionStat[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all applications
      const { data: applications, error } = await supabase
        .from("applications")
        .select(`
          *,
          positions (
            title
          )
        `);

      if (error) throw error;

      // Calculate stats
      const stats: Stats = {
        total: applications?.length || 0,
        pending: applications?.filter((app) => app.status === "pending").length || 0,
        reviewing: applications?.filter((app) => app.status === "reviewing").length || 0,
        accepted: applications?.filter((app) => app.status === "accepted").length || 0,
        rejected: applications?.filter((app) => app.status === "rejected").length || 0,
      };

      setStats(stats);

      // Calculate position stats
      const positionMap = new Map<string, number>();
      applications?.forEach((app) => {
        const title = app.positions?.title || "No Position";
        positionMap.set(title, (positionMap.get(title) || 0) + 1);
      });

      const positionData = Array.from(positionMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));

      setPositionStats(positionData);

      // Calculate match percentage distribution
      const matchRanges = [
        { name: "0-30%", min: 0, max: 30, count: 0 },
        { name: "31-50%", min: 31, max: 50, count: 0 },
        { name: "51-70%", min: 51, max: 70, count: 0 },
        { name: "71-85%", min: 71, max: 85, count: 0 },
        { name: "86-100%", min: 86, max: 100, count: 0 },
      ];

      applications?.forEach((app) => {
        const match = app.match_percentage || 0;
        const range = matchRanges.find((r) => match >= r.min && match <= r.max);
        if (range) range.count++;
      });

      setMatchStats(matchRanges);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--destructive))"];

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reviewing</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.reviewing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Position */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Match Percentage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Match Percentage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={matchStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.count}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {matchStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

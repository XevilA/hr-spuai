import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type TeamMember = {
  id: string;
  full_name: string;
  nickname: string | null;
  photo_url: string | null;
  position: string;
  department: string;
  division: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

const Teams = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("department", { ascending: true })
        .order("position", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group members by department
  const groupedMembers = members.reduce((acc, member) => {
    const dept = member.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-midnight-blue py-20 pt-32">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-white hover:text-spu-pink"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Our{" "}
              <span className="text-spu-pink">Team</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              พบกับสมาชิกทีมของเราที่มุ่งมั่นขับเคลื่อนนวัตกรรม AI ในมหาวิทยาลัย
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Members */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            กำลังโหลดข้อมูลทีม...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold mb-2">ยังไม่มีสมาชิกทีม</h3>
            <p className="text-muted-foreground">
              กำลังรวบรวมทีมอยู่ โปรดติดตามเร็วๆ นี้
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedMembers).map(([department, deptMembers], deptIndex) => (
              <motion.div
                key={department}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: deptIndex * 0.1 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-spu-pink flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  {department}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {deptMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (deptIndex * 0.1) + (index * 0.05) }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-spu-pink/50 h-full">
                        <CardHeader className="text-center pb-2">
                          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-spu-pink/20">
                            <AvatarImage src={member.photo_url || undefined} alt={member.full_name} />
                            <AvatarFallback className="text-2xl bg-spu-pink/10 text-spu-pink">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-xl">{member.full_name}</CardTitle>
                          {member.nickname && (
                            <CardDescription className="text-base">
                              ({member.nickname})
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-center">
                            <Badge variant="secondary" className="bg-spu-pink/10 text-spu-pink border-spu-pink/20">
                              {member.position}
                            </Badge>
                          </div>
                          {member.division && (
                            <p className="text-sm text-center text-muted-foreground">
                              {member.division}
                            </p>
                          )}
                          {member.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {member.description}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              เริ่ม {formatDate(member.start_date)}
                              {member.end_date && ` - ${formatDate(member.end_date)}`}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-3xl mx-auto border-2 border-spu-pink/20 bg-gradient-to-br from-spu-pink/5 to-transparent">
            <CardContent className="py-12">
              <h3 className="text-3xl font-bold mb-4">อยากเป็นส่วนหนึ่งของทีม?</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                เข้าร่วม SPU AI CLUB และเป็นส่วนหนึ่งในการขับเคลื่อนนวัตกรรม AI ของประเทศไทย
              </p>
              <Button
                size="lg"
                className="bg-spu-pink hover:bg-spu-pink-light text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate("/#signup")}
              >
                สมัครเลย
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Teams;
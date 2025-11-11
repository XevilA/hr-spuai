import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatbotButton } from "@/components/ChatbotButton";

interface Position {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  is_active: boolean;
}

const Positions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPositions = async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPositions(data);
      }
      setLoading(false);
    };

    fetchPositions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spu-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-midnight-blue py-20">
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
              Open{" "}
              <span className="text-spu-pink">
                Positions
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              Explore our available positions and find the perfect role to kickstart your AI journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Positions List */}
      <div className="container mx-auto px-4 py-16">
        {positions.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">No Open Positions</h3>
              <p className="text-muted-foreground">
                There are currently no open positions. Please check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300 border-2 hover:border-spu-pink/50">
                  <CardHeader>
                    <CardTitle className="text-3xl mb-2 text-spu-pink">
                      {position.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {position.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-spu-pink rounded-full"></span>
                        Responsibilities
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line pl-4">
                        {position.responsibilities}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-spu-pink rounded-full"></span>
                        Requirements
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line pl-4">
                        {position.requirements}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        window.location.href = "/#signup";
                      }}
                      className="w-full bg-spu-pink hover:bg-spu-pink-light text-white"
                      size="lg"
                    >
                      Apply for this Position
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Positions;

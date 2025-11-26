import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Hidden = () => {
  const navigate = useNavigate();

  const excludedPeople = [
    { name: "นายไม่เกี่ยวข้อง มากๆ", reason: "ไม่เคยมาประชุม" },
    { name: "นางสาวไม่สนใจ เลย", reason: "ไม่ตอบไลน์" },
    { name: "นายหายไป นานแล้ว", reason: "หายไปตั้งแต่เทอม 1" },
    { name: "นางสาวไม่รับผิดชอบ งาน", reason: "ไม่ทำงานที่ได้รับมอบหมาย" },
    { name: "นายมาสาย ทุกครั้ง", reason: "มาสายทุกกิจกรรม" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-midnight-blue text-white py-16 px-4">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            สารระบบ SPU AI CLUB
          </h1>
          <p className="text-xl text-gray-300">
            รายชื่อผู้ที่ไม่มีส่วนเกี่ยวข้องกับชมรม
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-spu-pink/10 to-purple-500/10 border border-spu-pink/30 rounded-lg p-6 mb-8">
            <p className="text-lg text-center">
              ⚠️ รายชื่อต่อไปนี้เป็นบุคคลที่ไม่มีส่วนเกี่ยวข้องกับชมรม SPU AI CLUB
            </p>
          </div>

          <div className="grid gap-6">
            {excludedPeople.map((person, index) => (
              <Card 
                key={index}
                className="border-2 border-midnight-blue/20 hover:border-spu-pink/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-midnight-blue mb-2">
                        {person.name}
                      </h3>
                      <p className="text-gray-600">
                        เหตุผล: <span className="text-spu-pink font-semibold">{person.reason}</span>
                      </p>
                    </div>
                    <div className="text-4xl">🚫</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 italic">
              หน้านี้เป็นความลับ ห้ามแชร์ออกไป! 🤫
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Hidden;

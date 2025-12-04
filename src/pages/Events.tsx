import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Zap,
  Trophy,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  image_url: string | null;
  video_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  event_type: string;
  target_audience: string[];
  is_featured: boolean;
  tags: string[];
}

const eventTypeIcons: Record<string, any> = {
  workshop: Zap,
  hackathon: Trophy,
  seminar: Users,
  meetup: Sparkles,
};

const eventTypeLabels: Record<string, string> = {
  workshop: "Workshop",
  hackathon: "Hackathon",
  seminar: "Seminar",
  meetup: "Meetup",
};

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = eventTypeIcons[event.event_type] || Sparkles;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Link to={`/events/${event.id}`}>
        <Card className="group overflow-hidden border-0 bg-gradient-to-br from-background to-muted/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer">
          <div className="relative aspect-[16/10] overflow-hidden">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Icon className="w-20 h-20 text-primary/30" />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Featured Badge */}
            {event.is_featured && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 left-4"
              >
                <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  แนะนำ
                </Badge>
              </motion.div>
            )}

            {/* Event Type */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                {eventTypeLabels[event.event_type] || event.event_type}
              </Badge>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.event_date), "d MMMM yyyy", { locale: th })}</span>
                {event.location && (
                  <>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                {event.title}
              </h3>
            </div>
          </div>

          <CardContent className="p-6">
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {event.short_description || event.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {event.max_participants && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{event.max_participants} คน</span>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>ถึง {format(new Date(event.registration_deadline), "d MMM", { locale: th })}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all duration-300">
                <span>ดูรายละเอียด</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {event.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredEvent = events.find(e => e.is_featured);
  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.event_type === filter);

  const eventTypes = [...new Set(events.map(e => e.event_type))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Video */}
      <motion.section 
        ref={heroRef}
        className="relative h-[90vh] overflow-hidden"
      >
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          {/* Video Background */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/placeholder.svg"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-devices-99786-large.mp4" type="video/mp4" />
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10" />
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              SPU AI CLUB Events
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground"
          >
            Upcoming Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8"
          >
            ร่วมเรียนรู้และพัฒนาทักษะ AI ไปกับกิจกรรมสุดพิเศษจาก SPU AI CLUB
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex gap-4"
          >
            <Button size="lg" className="px-8" onClick={() => {
              document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              ดูกิจกรรมทั้งหมด
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center p-2"
            >
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4">กิจกรรมแนะนำ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Event</h2>
            </motion.div>

            <Link to={`/events/${featuredEvent.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative aspect-video md:aspect-auto">
                    {featuredEvent.image_url ? (
                      <img 
                        src={featuredEvent.image_url}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Trophy className="w-32 h-32 text-primary/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary/10 text-primary">
                      {eventTypeLabels[featuredEvent.event_type]}
                    </Badge>
                    
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {featuredEvent.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                      {featuredEvent.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{format(new Date(featuredEvent.event_date), "d MMMM yyyy", { locale: th })}</span>
                      </div>
                      {featuredEvent.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          <span>{featuredEvent.location}</span>
                        </div>
                      )}
                    </div>

                    <Button size="lg" className="w-fit group-hover:gap-4 transition-all">
                      ลงทะเบียนเลย
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section id="events-grid" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">กิจกรรมทั้งหมด</h2>
              <p className="text-muted-foreground">เลือกกิจกรรมที่คุณสนใจและเข้าร่วมกับเรา</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                ทั้งหมด
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {eventTypeLabels[type] || type}
                </Button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/10] bg-muted rounded-t-xl" />
                  <div className="p-6 space-y-4 bg-muted/50 rounded-b-xl">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">ยังไม่มีกิจกรรม</h3>
              <p className="text-muted-foreground">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-12 md:p-20 text-center"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                พร้อมเริ่มต้นการเรียนรู้ AI?
              </h2>
              <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
                สมัครเป็นสมาชิก SPU AI CLUB เพื่อรับข่าวสารกิจกรรมก่อนใคร
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/positions">
                  <Button size="lg" variant="secondary" className="px-8">
                    สมัครสมาชิก
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                    ติดต่อเรา
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;

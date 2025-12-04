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
  ChevronDown,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Event {
  id: string;
  slug: string | null;
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
  competition: "Competition",
  conference: "Conference",
};

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = eventTypeIcons[event.event_type] || Sparkles;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="h-full"
    >
      <Link to={`/events/${event.slug || event.id}`} className="block h-full">
        <Card className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-700 cursor-pointer rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full flex flex-col">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
            {event.image_url ? (
              <motion.img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
                <Icon className="w-16 h-16 sm:w-24 sm:h-24 text-primary/20" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Featured Badge */}
            {event.is_featured && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="absolute top-3 left-3 sm:top-4 sm:left-4"
              >
                <Badge className="bg-primary text-primary-foreground px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  แนะนำ
                </Badge>
              </motion.div>
            )}

            {/* Event Type */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <Badge variant="secondary" className="bg-white/90 dark:bg-black/70 backdrop-blur-md text-foreground font-medium px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm">
                {eventTypeLabels[event.event_type] || event.event_type}
              </Badge>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm mb-2 sm:mb-3">
                <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="font-medium">{format(new Date(event.event_date), "d MMM yyyy", { locale: th })}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="truncate max-w-20 sm:max-w-32">{event.location}</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors duration-500 line-clamp-2">
                {event.title}
              </h3>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
            <p className="text-muted-foreground line-clamp-2 mb-4 sm:mb-5 text-sm leading-relaxed flex-1">
              {event.short_description || event.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {event.max_participants && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{event.max_participants} คน</span>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>ถึง {format(new Date(event.registration_deadline), "d MMM", { locale: th })}</span>
                  </div>
                )}
              </div>

              <motion.div 
                className="flex items-center gap-1 sm:gap-1.5 text-primary font-semibold text-xs sm:text-sm"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="hidden sm:inline">ดูเพิ่มเติม</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/50">
                {event.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] sm:text-xs font-normal rounded-full px-2 sm:px-3">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs font-normal rounded-full px-2 sm:px-3">
                    +{event.tags.length - 3}
                  </Badge>
                )}
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
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "30%"]);

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

      {/* Hero Section - Apple Style */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-[100dvh] overflow-hidden bg-black"
      >
        <motion.div 
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          {/* GIF Background */}
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTJyaGFvZjYxa2ZtdnhteTNqbWc5emZmOGY0aDl3cnk4MmxzdTBkbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tdC6N1RKNp4swre2JY/giphy.gif"
            alt="AI Animation"
            className="w-full h-full object-cover opacity-40"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        </motion.div>

        <motion.div 
          style={{ opacity: heroOpacity, y: textY }}
          className="relative z-10 h-full min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pb-24"
        >
          {/* Pre-title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Badge className="mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm bg-white/10 text-white border border-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              SPU AI CLUB Events
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-6 sm:mb-8 tracking-tight leading-[1.1]"
          >
            <span className="text-white">
              Upcoming
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400">
              Events
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-base sm:text-xl md:text-2xl text-white/70 max-w-xl sm:max-w-2xl mb-8 sm:mb-12 font-light leading-relaxed px-2"
          >
            ร่วมเรียนรู้และพัฒนาทักษะ AI ไปกับกิจกรรมสุดพิเศษ
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            จาก SPU AI CLUB
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Button 
              size="lg" 
              className="px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg shadow-pink-500/30 border-0"
              onClick={() => {
                document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              ดูกิจกรรมทั้งหมด
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 sm:bottom-16"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-white/40"
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-widest">Scroll</span>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-8 sm:py-16 md:py-24 px-0 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          <div className="sm:container mx-auto sm:max-w-6xl relative">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-6 sm:mb-12 md:mb-16 px-4 sm:px-0"
            >
              <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">กิจกรรมแนะนำ</Badge>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">Featured Event</h2>
            </motion.div>

            <Link to={`/events/${featuredEvent.slug || featuredEvent.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="group relative rounded-none sm:rounded-[2rem] overflow-hidden bg-card sm:border shadow-2xl"
              >
                <div className="grid lg:grid-cols-2">
                  {/* Image */}
                  <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-auto lg:min-h-[400px] xl:min-h-[500px] overflow-hidden">
                    {featuredEvent.image_url ? (
                      <motion.img 
                        src={featuredEvent.image_url}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center">
                        <Trophy className="w-24 h-24 sm:w-40 sm:h-40 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 lg:block hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />
                    
                    {/* Play Button Overlay */}
                    {featuredEvent.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary ml-0.5 sm:ml-1" />
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {/* Content */}
                  <div className="p-5 sm:p-8 md:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
                    <Badge className="w-fit mb-3 sm:mb-6 bg-primary/10 text-primary border-0 px-2.5 sm:px-4 py-0.5 sm:py-1.5 text-[11px] sm:text-sm">
                      {eventTypeLabels[featuredEvent.event_type]}
                    </Badge>
                    
                    <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 group-hover:text-primary transition-colors leading-tight">
                      {featuredEvent.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-5 sm:mb-8 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {featuredEvent.short_description || featuredEvent.description}
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-4 mb-5 sm:mb-10 text-muted-foreground text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-full px-2.5 sm:px-4 py-1 sm:py-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                        <span>{format(new Date(featuredEvent.event_date), "d MMM yyyy", { locale: th })}</span>
                      </div>
                      {featuredEvent.location && (
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 rounded-full px-2.5 sm:px-4 py-1 sm:py-2">
                          <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                          <span className="truncate max-w-28 sm:max-w-none">{featuredEvent.location}</span>
                        </div>
                      )}
                    </div>

                    <Button size="lg" className="w-full sm:w-fit px-5 sm:px-8 py-4 sm:py-6 rounded-full group-hover:gap-4 transition-all shadow-lg text-sm sm:text-lg">
                      ลงทะเบียนเลย
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section id="events-grid" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 sm:gap-8 mb-10 sm:mb-16"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">กิจกรรมทั้งหมด</h2>
              <p className="text-muted-foreground text-base sm:text-lg">เลือกกิจกรรมที่คุณสนใจและเข้าร่วมกับเรา</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4 sm:px-5 text-xs sm:text-sm"
                onClick={() => setFilter("all")}
              >
                ทั้งหมด
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-full px-4 sm:px-5 text-xs sm:text-sm"
                  onClick={() => setFilter(type)}
                >
                  {eventTypeLabels[type] || type}
                </Button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="aspect-[16/10] sm:aspect-[16/9] bg-muted" />
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-card">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">ยังไม่มีกิจกรรม</h3>
              <p className="text-muted-foreground text-sm sm:text-base">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 p-8 sm:p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                พร้อมที่จะเรียนรู้ AI?
              </h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
                เข้าร่วมกิจกรรมกับเราและเริ่มต้นการเดินทางในโลกของปัญญาประดิษฐ์
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full bg-white text-primary hover:bg-white/90 shadow-xl w-full sm:w-auto"
                  onClick={() => {
                    document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ดูกิจกรรมทั้งหมด
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Link to="/positions" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-full border-2 border-white/30 text-white hover:bg-white/10 w-full"
                  >
                    สมัครเป็นสมาชิก
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

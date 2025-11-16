import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Facebook, Instagram, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  const contacts = [
    {
      icon: Mail,
      title: "Email",
      items: [
        { label: "General", value: "spu.ai.club@spu.ac.th", href: "mailto:spu.ai.club@spu.ac.th" },
        { label: "President", value: "dev@dotmini.in.th", href: "mailto:dev@dotmini.in.th" },
      ],
    },
    {
      icon: Phone,
      title: "Phone",
      items: [
        { label: "President", value: "064-223-0671", href: "tel:0642230671" },
      ],
    },
    {
      icon: MapPin,
      title: "Location",
      items: [
        { label: "Address", value: "Sripatum University, Bangkok, Thailand", href: "#" },
      ],
    },
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: "Facebook",
      handle: "@AIPreneurspu",
      url: "https://www.facebook.com/AIPreneurspu",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Instagram,
      name: "Instagram",
      handle: "@spu.ai.club",
      url: "https://www.instagram.com/spu.ai.club/",
      color: "from-pink-500 via-red-500 to-yellow-500",
    },
  ];

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
              Contact{" "}
              <span className="text-spu-pink">
                Us
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              มีคำถามหรือต้องการความช่วยเหลือ? เราพร้อมให้บริการคุณ
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Information Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover-lift group">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                  >
                    <contact.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-6">{contact.title}</h3>
                  <div className="space-y-4">
                    {contact.items.map((item) => (
                      <div key={item.label}>
                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                        {item.href.startsWith("#") ? (
                          <p className="text-foreground font-medium">{item.value}</p>
                        ) : (
                          <a
                            href={item.href}
                            className="text-foreground font-medium hover:text-primary transition-colors story-link"
                          >
                            {item.value}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Social Media Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Follow Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ติดตามข่าวสารและกิจกรรมของเราผ่านโซเชียลมีเดีย
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {socialMedia.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="p-8 h-full overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <social.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{social.name}</h3>
                      <p className="text-muted-foreground">{social.handle}</p>
                    </div>
                  </div>
                </Card>
              </motion.a>
            ))}
          </div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.0238329687243!2d100.61139731483079!3d13.780953190328998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ed269e33f83%3A0x8ca28866b85d9945!2sSripatum%20University!5e0!3m2!1sen!2sth!4v1645234567890!5m2!1sen!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sripatum University Location"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Contact;

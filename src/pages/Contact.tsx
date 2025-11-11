import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Facebook, Instagram, Linkedin } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "contact@spuaiclub.com",
      link: "mailto:contact@spuaiclub.com",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+66 2 579 1111",
      link: "tel:+6625791111",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Sripatum University, Bangkok, Thailand",
      link: "https://maps.google.com",
    },
  ];

  const socialMedia = [
    { icon: Facebook, name: "Facebook", link: "https://facebook.com" },
    { icon: Instagram, name: "Instagram", link: "https://instagram.com" },
    { icon: Linkedin, name: "LinkedIn", link: "https://linkedin.com" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gradient">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ติดต่อเราได้ทุกช่องทาง เรายินดีที่จะตอบคำถามและรับฟังข้อเสนอแนะจากคุณ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <Card className="h-full hover-lift text-center">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.details}</p>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  ติดตามข่าวสารและกิจกรรมของเราได้ที่ Social Media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-6">
                  {socialMedia.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                      aria-label={social.name}
                    >
                      <social.icon className="w-6 h-6 text-primary" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>Our Location</CardTitle>
                <CardDescription>
                  มหาวิทยาลัยศรีปทุม วังท่าพระ กรุงเทพฯ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.0244732891847!2d100.49137931483033!3d13.778584490330673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e298c3e52e3e51%3A0x40100b25de24d90!2sSripatum%20University!5e0!3m2!1sen!2sth!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Contact;

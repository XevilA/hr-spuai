import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-midnight-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gradient">HR@SPU AI CLUB</h3>
            <p className="text-white/70 mb-4">
              Empowering the next generation of AI innovators at Sripatum University.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-spu-pink transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-spu-pink transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-spu-pink transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-spu-pink transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-spu-pink transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-spu-pink transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="#signup" className="text-white/70 hover:text-spu-pink transition-colors">
                  Join Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-spu-pink mt-1 flex-shrink-0" />
                <p className="text-white/70">
                  Sripatum University<br />
                  Bangkok, Thailand
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-spu-pink flex-shrink-0" />
                <a
                  href="mailto:info@spuaiclub.com"
                  className="text-white/70 hover:text-spu-pink transition-colors"
                >
                  info@spuaiclub.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center text-white/50">
          <p>&copy; {new Date().getFullYear()} HR@SPU AI CLUB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

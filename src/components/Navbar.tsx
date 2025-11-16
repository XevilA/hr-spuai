import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "ตำแหน่ง", path: "/positions" },
    { name: "โครงการ", path: "/projects" },
    { name: "โครงสร้าง", path: "/community" },
    { name: "ทีมงาน", path: "/team" },
    { name: "ติดต่อ", path: "/contact" },
    { name: "ติดตามสถานะ", path: "/track" },
  ];

  return (
    <motion.nav
      initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      animate={{
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0)",
        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
        boxShadow: isScrolled 
          ? "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)" 
          : "none",
        borderBottom: isScrolled ? "1px solid rgba(229, 231, 235, 0.5)" : "1px solid rgba(229, 231, 235, 0)"
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <span className="text-xl font-bold transition-colors duration-300">
              <span className="text-spu-pink">SPU AI</span>
              {" "}
              <span style={{ color: isScrolled ? "#0A0A2A" : "#ffffff" }}>
                CLUB
              </span>
            </span>
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  className="text-sm font-medium transition-colors relative py-2 hover:opacity-80"
                  style={{
                    color: isScrolled ? "hsl(var(--foreground) / 0.7)" : "rgba(255, 255, 255, 0.9)"
                  }}
                  activeClassName={isScrolled 
                    ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full"
                  }
                >
                  {item.name}
                </NavLink>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg transition-all hover:opacity-80"
            style={{
              color: isScrolled ? "hsl(var(--foreground))" : "#ffffff",
              backgroundColor: isScrolled ? "hsl(var(--muted) / 0.5)" : "rgba(255, 255, 255, 0.1)"
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all"
                  activeClassName="text-foreground bg-muted"
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

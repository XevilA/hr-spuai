import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { Benefits } from "@/components/Benefits";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { SignupForm } from "@/components/SignupForm";
import { ChatbotButton } from "@/components/ChatbotButton";
import { StickyApplyButton } from "@/components/StickyApplyButton";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <Navbar />
      <Hero />
      <Showcase />
      
      {/* Enhanced Application Form Section */}
      <div id="signup" className="py-32 bg-white relative overflow-hidden shadow-[0_-1px_3px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-6 py-2 bg-gray-100 rounded-full border border-gray-200"
            >
              <span className="text-gray-700 font-semibold text-sm tracking-wider uppercase">
                Join Our Community
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
              Apply to{" "}
              <span className="text-gradient bg-gradient-to-r from-spu-pink to-spu-pink-light bg-clip-text text-transparent">
                HR@SPU AI CLUB
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Start your AI journey today. Fill out the form below and become part of Thailand's most innovative AI community.
            </p>
            <motion.a
              href="/track"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-spu-pink hover:text-spu-pink-dark transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              ส่งใบสมัครแล้ว? ติดตามสถานะที่นี่
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <SignupForm />
          </motion.div>
        </div>
      </div>

      <Benefits />
      <Testimonials />
      <Footer />
      <ChatbotButton />
      <StickyApplyButton />
    </div>
  );
};

export default Index;

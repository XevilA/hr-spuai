import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { Benefits } from "@/components/Benefits";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { StickyApplyButton } from "@/components/StickyApplyButton";
import { SignupForm } from "@/components/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <StickyApplyButton />
      <Hero />
      <Showcase />
      
      {/* Enhanced Application Form Section */}
      <div id="signup" className="py-32 bg-gradient-to-b from-midnight-blue via-midnight-blue/95 to-background relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-spu-pink/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-spu-pink/10 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
          />
        </div>

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
              className="inline-block mb-6 px-6 py-2 bg-spu-pink/20 rounded-full border border-spu-pink/30"
            >
              <span className="text-spu-pink font-semibold text-sm tracking-wider uppercase">
                Join Our Community
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Apply to{" "}
              <span className="text-gradient bg-gradient-to-r from-spu-pink to-spu-pink-light bg-clip-text text-transparent">
                HR@SPU AI CLUB
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Start your AI journey today. Fill out the form below and become part of Thailand's most innovative AI community.
            </p>
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
    </div>
  );
};

export default Index;

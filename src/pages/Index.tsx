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
      <Benefits />
      <Testimonials />
      <div id="signup" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Apply to <span className="text-gradient">Join Us</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your AI journey today. Fill out the form below and become part of something extraordinary.
            </p>
          </motion.div>
          <SignupForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;

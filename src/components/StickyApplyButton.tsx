import { motion, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const StickyApplyButton = () => {
  const { scrollYProgress } = useScroll();

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-spu-pink to-spu-pink-light z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Sticky Apply Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="lg"
          className="bg-spu-pink hover:bg-spu-pink-light text-white px-6 py-6 rounded-full shadow-2xl hover:shadow-spu-pink/50 transition-all duration-300 hover:scale-110 group animate-glow"
          onClick={() => {
            document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Apply Now
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </>
  );
};

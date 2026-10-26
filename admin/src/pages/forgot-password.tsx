import { motion } from "framer-motion";
import ForgotPassword from "@/components/pages/forgot-password/ForgotPassword";

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue relative overflow-hidden py-12">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          className="absolute -top-24 -left-24 w-137.5 h-137.5 bg-primary/10 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -60, 0],
            y: [0, 60, 0]
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-162.5 h-162.5 bg-secondary/10 rounded-full blur-[130px]"
        />
      </div>

      <div className="root-container relative z-10 w-full">
        <ForgotPassword />
      </div>
    </div>
  );
}

export default Index;

import { motion } from "framer-motion";
import SignupForm from "@/components/pages/sign-up/SignupForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue relative overflow-hidden py-12">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -60, 0],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          className="absolute -top-32 -right-32 w-162.5 h-162.5 bg-secondary/10 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 60, 0],
            x: [0, 40, 0],
            y: [0, -50, 0]
          }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-187.5 h-187.5 bg-primary/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="root-container relative z-10 w-full">
        <SignupForm />
      </div>
    </div>
  );
};

export default Register;

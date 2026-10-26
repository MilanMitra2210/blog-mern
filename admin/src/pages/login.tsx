import { motion } from "framer-motion";
import LoginForm from "@/components/pages/login/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue relative overflow-hidden py-12">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-32 -left-32 w-150 h-150 bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-175 h-175 bg-secondary/10 rounded-full blur-[140px]"
        />
      </div>

      <div className="root-container relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;

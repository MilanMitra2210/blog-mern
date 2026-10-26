import { motion } from "framer-motion";
import { Home as HomeIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { FadeIn, PerspectiveIn, ScaleIn } from "../components/ui/Motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-blue relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange/5 rounded-full blur-[160px]"
        />
      </div>

      <div className="root-container relative z-10 w-full flex flex-col items-center">
        <PerspectiveIn delay={0.1} duration={1.2}>
          <h1 className="text-[12rem] sm:text-[18rem] lg:text-[22rem] font-black text-primary leading-none select-none tracking-tighter drop-shadow-2xl opacity-20">
            404
          </h1>
        </PerspectiveIn>
        
        <div className="max-w-2xl w-full -mt-16 sm:-mt-24 lg:-mt-32">
          <FadeIn direction="up" delay={0.4} className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark-blue mb-6 tracking-tight">
              Lost in Space<span className="text-primary">?</span>
            </h2>
            <p className="text-lg sm:text-xl text-dark-blue/60 font-semibold mb-12 max-w-lg mx-auto leading-relaxed">
              The page you're looking for has vanished into the digital void. Don't worry, we'll help you find your way back.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton
                href="/"
                className="!w-full sm:!w-auto px-10 py-5"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </PrimaryButton>

              <SecondaryButton
                onClick={() => navigate(-1)}
                className="!w-full sm:!w-auto px-10 py-5"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </SecondaryButton>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Decorative Floating Elements */}
      <ScaleIn delay={0.8} initialScale={0} className="absolute top-1/4 left-10 hidden lg:block">
        <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rotate-12" />
      </ScaleIn>
      <ScaleIn delay={1} initialScale={0} className="absolute bottom-1/4 right-10 hidden lg:block">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 backdrop-blur-md border border-white/40 shadow-2xl -rotate-12" />
      </ScaleIn>
    </div>
  );
}

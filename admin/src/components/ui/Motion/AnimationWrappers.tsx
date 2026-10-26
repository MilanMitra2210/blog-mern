import React from "react";
import { motion } from "framer-motion";

export const FadeInUp: React.FC<{ 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  y?: number;
  className?: string;
}> = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  y = 20,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredContainer: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}> = ({ 
  children,
  className,
  delay = 0
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<{ 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  initialScale?: number;
  className?: string;
}> = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  initialScale = 0.9,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PerspectiveIn: React.FC<{ 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  rotateX?: number;
  className?: string;
}> = ({ 
  children, 
  delay = 0,
  duration = 0.8,
  rotateX = 15,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX, y: 40 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      style={{ perspective: "1200px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children,
  className
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

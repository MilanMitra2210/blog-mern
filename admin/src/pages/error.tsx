import { AlertCircle, RefreshCw, Home as HomeIcon } from "lucide-react";
import { motion } from "framer-motion";

import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { FadeIn } from "../components/ui/Motion";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Oops! Something went wrong";
  let message = "An unexpected error occurred while processing your request.";

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-light-blue to-white px-4">
      <FadeIn className="max-w-md w-full">
        <div className="card-container border-red-100 !bg-white/80 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center mb-8"
          >
            <div className="p-4 bg-red-600 rounded-2xl shadow-xl shadow-red-200">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <h2 className="h2 mb-3">{title}</h2>
          <p className="medium-paragraph mb-10">{message}</p>

          <div className="flex flex-col gap-4">
            <PrimaryButton
              onClick={() => navigate("/")}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </PrimaryButton>
            
            <SecondaryButton
              onClick={() => navigate(0)}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </SecondaryButton>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";
import { Film } from "lucide-react";

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="mb-8 flex flex-col items-center">
          <Film className="h-10 w-10 text-primary mb-2" />
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Movie Recommendation System</h1>
            <p className="text-muted-foreground">Create your account</p>
          </div>
        </div>
        <RegisterForm />
      </div>
      <footer className="bg-background border-t border-border py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Movie Recommendation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Register; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-7xl font-bold">404</h1>
      <p className="mt-4 text-2xl">Page Not Found</p>
      <div className="mt-6">
        <Button onClick={() => navigate("/")}>Go back to Home</Button>
      </div>
    </div>
  );
};

export default Error404;

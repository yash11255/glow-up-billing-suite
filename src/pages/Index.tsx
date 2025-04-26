
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// This is a simple redirect component that will redirect to the dashboard
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  
  return null;
};

export default Index;

import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";

import MainPage from "@/pages/MainPage";
import LoginPage from "@/pages/auth/LoginPage";
import AIPerformancePage from "@/pages/AIPerformancePage";
import { getCookie } from "@/utils/cookie";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

// useNavigate 쓰는 로직을 분리
const AppRoutes = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const accessToken = getCookie("accessToken");

  useEffect(() => {
    if (accessToken) {
      login();
    } else {
      navigate("/auth", { replace: true });
    }
  }, [accessToken]);

  return (
    <Routes>
      <Route path="/" element={<MainPage accessToken={accessToken} />} />
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/ai-performance" element={<AIPerformancePage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;

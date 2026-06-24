import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import MainPage from "@/pages/MainPage";
import LoginPage from "@/pages/auth/LoginPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;

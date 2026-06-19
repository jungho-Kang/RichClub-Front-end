import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainPage from "@/pages/MainPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  )
}

export default App
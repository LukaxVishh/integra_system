import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import Home from "./pages/home/home";
import ProtectedRoute from "./components/security_rotes/ProtectedRoute";
import Manager from "./pages/admin/Manager";
import UserEdit from "./pages/admin/UserEdit";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manager"
                element={
                  <ProtectedRoute>
                    <Manager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manager/user/:id"
                element={
                  <ProtectedRoute>
                    <UserEdit />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
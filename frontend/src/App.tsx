import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import Home from "./pages/home/home";
import ProtectedRoute from "./components/security_rotes/ProtectedRoute";
import RoleProtectedRoute from "./utils/RoleProtectedRoute";
import Manager from "./pages/admin/Manager";
import UserEdit from "./pages/admin/UserEdit";
import AccessDenied from "./pages/acessos/NoAccess";
import FirstAccsses from "./pages/acessos/FirstAccess";

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    // Exibe uma tela de carregamento enquanto os dados estão sendo carregados
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
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
      {/* Rotas protegidas por múltiplas roles */}
      <Route element={<RoleProtectedRoute requiredRoles={["Admin"]} />}>
        <Route path="/admin/manager" element={<Manager />} />
        <Route path="/admin/manager/user/:id" element={<UserEdit />} />
      </Route>
      {/* Rota de acesso negado */}
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/first-access" element={<FirstAccsses />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
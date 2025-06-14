import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext"; // Importar o AuthContext

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { resetLoading } = useAuth(); // Obter a função resetLoading do contexto

  // Mensagem passada pelo ProtectedRoute
  const state = location.state as { message?: string };

  useEffect(() => {
    if (state?.message) {
      setAuthMessage(state.message);

      // Configura o temporizador para limpar a mensagem após 10 segundos
      const timer = setTimeout(() => {
        setAuthMessage(null);
      }, 10000);

      // Limpa o temporizador ao desmontar o componente
      return () => clearTimeout(timer);
    }
  }, [state?.message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa os erros antes de enviar

    try {
      const response = await fetch("http://localhost:5000/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          UserName: formData.userName,
          Password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errors = Object.values(errorData.errors).flat();
          setError(errors.join(", "));
        } else if (errorData.title) {
          setError(errorData.title);
        } else {
          setError("Erro ao realizar login.");
        }
        return;
      }

      // Login bem-sucedido
      resetLoading(); // Redefinir o estado de carregamento e buscar as roles novamente
      navigate("/home");
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <img src="../images/sicredi-logo.png" alt="Logo" className="w-68 h-24 mx-auto mb-4" />
        <form className="space-y-4" onSubmit={handleSubmit}>
          {authMessage && (
            <p className="border border-red-500 text-red-600 bg-red-100 px-4 py-2 rounded-md text-sm">
              {authMessage}
            </p>
          )}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Lembrar-me
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registre-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
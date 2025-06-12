import React, { useState } from "react";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa os erros antes de enviar

    try {
      const response = await fetch("http://localhost:5000/account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        setError(errorData.message || "Erro ao registrar usuário.");
        return;
      }

      // Registro bem-sucedido
      alert("Registro realizado com sucesso!");
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <img src="../images/sicredi-logo.png" alt="Logo" className="w-68 h-24 mx-auto mb-4" />
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Digite seu nome"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Digite seu email"
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirme sua senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Confirme sua senha"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Registrar
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Já tem uma conta?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

interface User {
  id: string;
  userName: string;
  email: string;
}

const Manager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchUsers = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:5000/users?page=${page}&limit=20`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error("Erro ao buscar usuários.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleEdit = (userId: string) => {
    navigate(`/admin/manager/user/${userId}`);
};


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Conteúdo principal */}
      <div
        className="flex-grow grid grid-cols-5 grid-rows-5 gap-4 p-4"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
        }}
      >
        {/* Div 1: Lista de páginas */}
        <div className="row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => console.log("Página 1")}
              >
                Ciclo de Crédito
              </button>
            </li>
            <li>
              <button
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => console.log("Página 2")}
              >
                Negócios
              </button>
            </li>
            <li>
              <button
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => console.log("Página 3")}
              >
                Processos de Qualidade
              </button>
            </li>
          </ul>
        </div>

        {/* Div 2: Lista de usuários */}
        <div className="col-span-4 row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Gerenciamento de Usuários</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">UserName</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 px-4 py-2">{user.userName}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={`px-4 py-2 rounded ${
                currentPage === 1 ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Manager;
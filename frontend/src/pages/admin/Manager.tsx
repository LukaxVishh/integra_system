import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

interface User {
  id: string;
  userName: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
}

const Manager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"usuarios" | "permissoes" | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null); // Para popup de confirmação
  const navigate = useNavigate();

  // Usuários
  const fetchUsers = async (page: number, userName?: string) => {
    try {
      let url = `http://localhost:5000/users?page=${page}&limit=20`;
      if (userName && userName.trim() !== "") {
        url += `&userName=${encodeURIComponent(userName)}`;
      }
      const response = await fetch(url, {
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

  // Roles
  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:5000/roles", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      } else {
        console.error("Erro ao buscar roles.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };

  // Edição de roles
  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
  };

  const handleSaveRole = async (roleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/roles/${roleId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingRoleName }),
      });
      if (response.ok) {
        fetchRoles();
        setEditingRoleId(null);
        setEditingRoleName("");
        setMessageType("success");
        setMessage("Permissão atualizada com sucesso!");
        setTimeout(() => setMessage(null), 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessageType("error");
        setMessage(errorData.message || "Erro ao atualizar permissão.");
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Erro ao atualizar permissão.");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Novo: popup de confirmação de exclusão
  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/roles/${roleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        fetchRoles();
        setMessageType("success");
        setMessage("Permissão excluída com sucesso!");
        setTimeout(() => setMessage(null), 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessageType("error");
        setMessage(errorData.message || "Erro ao excluir permissão.");
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Erro ao excluir permissão.");
      setTimeout(() => setMessage(null), 4000);
    }
    setRoleToDelete(null);
  };

  const handleDeleteRoleButton = (role: Role) => {
    setRoleToDelete(role);
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/roles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName }),
      });
      if (response.ok) {
        fetchRoles();
        setNewRoleName("");
        setMessageType("success");
        setMessage("Permissão adicionada com sucesso!");
        setTimeout(() => setMessage(null), 4000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessageType("error");
        setMessage(errorData.message || "Erro ao adicionar permissão.");
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Erro ao adicionar permissão.");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  useEffect(() => {
    if (activeTab === "usuarios") {
      fetchUsers(currentPage, userNameFilter);
    }
    if (activeTab === "permissoes") {
      fetchRoles();
    }
    // eslint-disable-next-line
  }, [activeTab, currentPage]);

  const handleEdit = (userId: string) => {
    navigate(`/admin/manager/user/${userId}`);
  };

  // Função para pesquisar por UserName
  const handleUserNameSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, userNameFilter);
  };

  // Função para limpar o filtro
  const handleClearUserNameFilter = () => {
    setUserNameFilter("");
    setCurrentPage(1);
    fetchUsers(1, "");
  };

  // Estilo para mensagens
  const messageStyle =
    messageType === "success"
      ? "border-green-700 bg-green-100 text-green-700"
      : "border-red-700 bg-red-100 text-red-700";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div
        className="flex-grow grid grid-cols-5 grid-rows-5 gap-4 p-4"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
        }}
      >
        {/* Menu lateral */}
        <div className="row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "usuarios"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={() => setActiveTab("usuarios")}
              >
                Usuários
              </button>
            </li>
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "permissoes"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={() => setActiveTab("permissoes")}
              >
                Permissões
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

        {/* Conteúdo principal dinâmico */}
        <div className="col-span-4 row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          {/* Mensagem de feedback */}
          {message && (
            <div className="flex justify-center mb-4">
              <button
                className={`border-2 ${messageStyle} font-bold px-6 py-2 rounded shadow`}
                disabled
              >
                {message}
              </button>
            </div>
          )}

          {/* Popup de confirmação de exclusão */}
          {roleToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border-2 border-green-700 rounded-lg shadow-lg p-8 flex flex-col items-center">
                <span className="text-green-700 font-bold mb-4">
                  Tem certeza que deseja excluir a permissão <span className="underline">{roleToDelete.name}</span>?
                </span>
                <div className="flex gap-4">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded"
                    onClick={() => handleDeleteRole(roleToDelete.id)}
                  >
                    Confirmar
                  </button>
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded"
                    onClick={() => setRoleToDelete(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "usuarios" && (
            <>
              <h2 className="text-lg font-bold mb-4">Gerenciamento de Usuários</h2>
              {/* Campo de filtro por UserName */}
              <div className="mb-4 flex gap-2 items-center">
                <input
                  type="text"
                  value={userNameFilter}
                  onChange={(e) => setUserNameFilter(e.target.value)}
                  placeholder="Filtrar por UserName"
                  className="border px-2 py-1 rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUserNameSearch();
                  }}
                />
                <button
                  onClick={handleUserNameSearch}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Pesquisar
                </button>
                <button
                  onClick={handleClearUserNameFilter}
                  className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                >
                  Limpar
                </button>
              </div>
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
            </>
          )}

          {activeTab === "permissoes" && (
            <>
              <h2 className="text-lg font-bold mb-4">Permissões (Roles)</h2>
              <div className="flex mb-4 gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nova permissão"
                  className="border px-2 py-1 rounded"
                />
                <button
                  onClick={handleAddRole}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Adicionar
                </button>
              </div>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRoleId === role.id ? (
                          <input
                            type="text"
                            value={editingRoleName}
                            onChange={(e) => setEditingRoleName(e.target.value)}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          role.name
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {editingRoleId === role.id ? (
                          <>
                            <button
                              onClick={() => handleSaveRole(role.id)}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingRoleId(null)}
                              className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRole(role)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteRoleButton(role)}
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {!activeTab && (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Selecione uma opção no menu</span>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Manager;
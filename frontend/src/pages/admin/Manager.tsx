import React, { useEffect, useState, useRef } from "react";
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
  claims: string[];
}

const Manager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [availableClaims, setAvailableClaims] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"usuarios" | "permissoes" | null>(null);

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleClaims, setNewRoleClaims] = useState<string[]>([]);
  const [newClaimName, setNewClaimName] = useState("");

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [editingRoleClaims, setEditingRoleClaims] = useState<string[]>([]);

  const [userNameFilter, setUserNameFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const navigate = useNavigate();
  const claimsDropdownRef = useRef<HTMLDivElement>(null);
  const [claimsDropdownOpen, setClaimsDropdownOpen] = useState(false);

  // Fetch claims from backend
  const fetchAvailableClaims = async () => {
    try {
      const res = await fetch("http://localhost:5000/claims", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAvailableClaims(data);
      } else {
        console.error("Erro ao buscar claims.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch users
  const fetchUsers = async (page: number, userName?: string) => {
    try {
      let url = `http://localhost:5000/users?page=${page}&limit=20`;
      if (userName && userName.trim()) url += `&userName=${encodeURIComponent(userName)}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error("Erro ao buscar usuários.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch roles
  const fetchRolesAndClaims = async () => {
    try {
      const res = await fetch("http://localhost:5000/roles", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles);
      } else {
        console.error("Erro ao buscar roles.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add role
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/roles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName, claims: newRoleClaims }),
      });
      if (res.ok) {
        fetchRolesAndClaims();
        setNewRoleName("");
        setNewRoleClaims([]);
        showMessage("Permissão criada com sucesso!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage(err.message || "Erro ao criar permissão.", "error");
      }
    } catch {
      showMessage("Erro ao criar permissão.", "error");
    }
  };

  // Add claim
  const handleAddClaim = async () => {
    if (!newClaimName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/claims", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClaimName.trim()), // simples string, seu controller já aceita
      });
      if (res.ok) {
        fetchAvailableClaims(); // 🔁 recarrega lista do banco!
        setNewClaimName("");
        showMessage("Claim criada com sucesso!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage(err.message || "Erro ao criar claim.", "error");
      }
    } catch {
      showMessage("Erro ao criar claim.", "error");
    }
  };

  // Remove claim
  const handleDeleteClaim = async (claim: string) => {
    try {
      const res = await fetch(`http://localhost:5000/claims/${encodeURIComponent(claim)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchAvailableClaims();
        showMessage("Claim removida com sucesso!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage(err.message || "Erro ao remover claim.", "error");
      }
    } catch {
      showMessage("Erro ao remover claim.", "error");
    }
  };

  // Save edited role
  const handleSaveRole = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/roles/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingRoleName, claims: editingRoleClaims }),
      });
      if (res.ok) {
        fetchRolesAndClaims();
        setEditingRoleId(null);
        setEditingRoleName("");
        setEditingRoleClaims([]);
        showMessage("Permissão atualizada com sucesso!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage(err.message || "Erro ao atualizar permissão.", "error");
      }
    } catch {
      showMessage("Erro ao atualizar permissão.", "error");
    }
  };

  // Delete role (called from modal)
  const handleDeleteRole = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/roles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchRolesAndClaims();
        showMessage("Permissão excluída com sucesso!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage(err.message || "Erro ao excluir permissão.", "error");
      }
    } catch {
      showMessage("Erro ao excluir permissão.", "error");
    }
    setRoleToDelete(null);
  };

  // Utils
  const showMessage = (msg: string, type: "success" | "error") => {
    setMessageType(type);
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditingRoleName(role.name);
    setEditingRoleClaims(role.claims);
  };

  const toggleNewRoleClaim = (claim: string) => {
    setNewRoleClaims(prev =>
      prev.includes(claim) ? prev.filter(c => c !== claim) : [...prev, claim]
    );
  };

  const toggleEditingRoleClaim = (claim: string) => {
    setEditingRoleClaims(prev =>
      prev.includes(claim) ? prev.filter(c => c !== claim) : [...prev, claim]
    );
  };

  useEffect(() => {
    if (activeTab === "usuarios") fetchUsers(currentPage, userNameFilter);
    if (activeTab === "permissoes") {
      fetchRolesAndClaims();
      fetchAvailableClaims();
    }
  }, [activeTab, currentPage]);

  const handleEdit = (id: string) => navigate(`/admin/manager/user/${id}`);
  const handleUserNameSearch = () => { setCurrentPage(1); fetchUsers(1, userNameFilter); };
  const handleClearUserNameFilter = () => { setUserNameFilter(""); fetchUsers(1, ""); };

  const messageStyle = messageType === "success"
    ? "border-green-700 bg-green-100 text-green-700"
    : "border-red-700 bg-red-100 text-red-700";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-grow grid grid-cols-5 grid-rows-5 gap-4 p-4">
        <div className="row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li><button className={`w-full px-4 py-2 rounded-md ${activeTab === "usuarios" ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white`} onClick={() => setActiveTab("usuarios")}>Usuários</button></li>
            <li><button className={`w-full px-4 py-2 rounded-md ${activeTab === "permissoes" ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white`} onClick={() => setActiveTab("permissoes")}>Permissões</button></li>
          </ul>
        </div>

        <div className="col-span-4 row-span-3 row-start-2 bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          {message && (
            <div className="flex justify-center mb-4">
              <button className={`border-2 ${messageStyle} font-bold px-6 py-2 rounded shadow`} disabled>{message}</button>
            </div>
          )}

          {roleToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border-2 border-green-700 rounded-lg shadow-lg p-8 flex flex-col items-center">
                <span className="text-green-700 font-bold mb-4">
                  Tem certeza que deseja excluir a permissão{" "}
                  <span className="underline">{roleToDelete.name}</span>?
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDeleteRole(roleToDelete.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setRoleToDelete(null)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded"
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
              <div className="mb-4 flex gap-2 items-center">
                <input value={userNameFilter} onChange={e => setUserNameFilter(e.target.value)}
                  placeholder="Filtrar por UserName" className="border px-2 py-1 rounded"
                  onKeyDown={e => e.key === "Enter" && handleUserNameSearch()} />
                <button onClick={handleUserNameSearch} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Pesquisar</button>
                <button onClick={handleClearUserNameFilter} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">Limpar</button>
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
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="border border-gray-300 px-4 py-2">{user.userName}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button onClick={() => handleEdit(user.id)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>Próxima</button>
              </div>
            </>
          )}

          {activeTab === "permissoes" && (
            <>
              <h2 className="text-lg font-bold mb-4">Permissões (Roles)</h2>
              <div className="flex mb-2 gap-2">
                <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Nova permissão" className="border px-2 py-1 rounded" />
                <button onClick={handleAddRole} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Adicionar</button>
              </div>
              <div className="relative mb-4">
                <button onClick={() => setClaimsDropdownOpen(!claimsDropdownOpen)}
                  className="border px-2 py-1 rounded bg-gray-50">Selecionar Claims</button>
                {claimsDropdownOpen && (
                  <div ref={claimsDropdownRef} className="absolute mt-1 w-72 bg-white border rounded shadow max-h-60 overflow-auto z-20">
                    {availableClaims.map(claim => (
                      <label key={claim} className="block px-3 py-1 hover:bg-gray-100 text-sm truncate">
                        <input type="checkbox" checked={newRoleClaims.includes(claim)}
                          onChange={() => toggleNewRoleClaim(claim)} className="mr-2" /> {claim}
                        <button onClick={() => handleDeleteClaim(claim)} className="ml-2 text-red-600 hover:text-red-800">x</button>
                      </label>
                    ))}
                    <div className="flex p-2 border-t">
                      <input value={newClaimName} onChange={e => setNewClaimName(e.target.value)}
                        placeholder="Nova claim" className="border px-2 py-1 rounded flex-grow text-sm" />
                      <button onClick={handleAddClaim} className="ml-2 bg-green-500 hover:bg-green-600 text-white px-3 rounded">+</button>
                    </div>
                  </div>
                )}
              </div>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Nome</th>
                    <th className="border border-gray-300 px-4 py-2">Claims</th>
                    <th className="border border-gray-300 px-4 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRoleId === role.id ? (
                          <input value={editingRoleName}
                            onChange={e => setEditingRoleName(e.target.value)}
                            className="border px-2 py-1 rounded" />
                        ) : role.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {editingRoleId === role.id ? (
                          <div className="flex flex-wrap gap-2">
                            {availableClaims.map(claim => (
                              <label key={claim} className="block text-sm">
                                <input type="checkbox"
                                  checked={editingRoleClaims.includes(claim)}
                                  onChange={() => toggleEditingRoleClaim(claim)}
                                  className="mr-1" /> {claim}
                              </label>
                            ))}
                          </div>
                        ) : (
                          role.claims.join(", ")
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {editingRoleId === role.id ? (
                          <>
                            <button onClick={() => handleSaveRole(role.id)}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mr-2">Salvar</button>
                            <button onClick={() => setEditingRoleId(null)}
                              className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditRole(role)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">Editar</button>
                            <button onClick={() => setRoleToDelete(role)}
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Excluir</button>
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

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

  const handleAddClaim = async () => {
    if (!newClaimName.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/claims", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClaimName.trim()),
      });
      if (res.ok) {
        fetchAvailableClaims();
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (claimsDropdownRef.current && !claimsDropdownRef.current.contains(e.target as Node)) {
        setClaimsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (id: string) => navigate(`/admin/manager/user/${id}`);
  const handleUserNameSearch = () => { setCurrentPage(1); fetchUsers(1, userNameFilter); };
  const handleClearUserNameFilter = () => { setUserNameFilter(""); fetchUsers(1, ""); };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-grow px-4 pt-20 pb-4 flex flex-col md:flex-row gap-4">
        <aside className="w-full md:w-1/5 bg-white rounded-xl shadow border border-[#E6F4EA] p-4">
          <h2 className="text-lg font-bold text-[#0F9D58] mb-4">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "usuarios"
                    ? "bg-[#0F9D58]"
                    : "bg-[#128C52] hover:bg-[#0F9D58]"
                } text-white`}
                onClick={() => setActiveTab("usuarios")}
              >
                Usuários
              </button>
            </li>
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "permissoes"
                    ? "bg-[#0F9D58]"
                    : "bg-[#128C52] hover:bg-[#0F9D58]"
                } text-white`}
                onClick={() => setActiveTab("permissoes")}
              >
                Permissões
              </button>
            </li>
          </ul>
        </aside>

        <section className="flex-1 bg-white rounded-xl shadow border border-[#E6F4EA] p-6 overflow-auto">
          {message && (
            <div className="flex justify-center mb-4">
              <button
                className={`border-2 ${
                  messageType === "success"
                    ? "border-[#0F9D58] bg-[#E6F4EA] text-[#0F9D58]"
                    : "border-red-700 bg-red-100 text-red-700"
                } font-bold px-6 py-2 rounded shadow`}
                disabled
              >
                {message}
              </button>
            </div>
          )}
                    {roleToDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white border-2 border-[#0F9D58] rounded-lg shadow-lg p-8 flex flex-col items-center">
                <span className="text-[#0F9D58] font-bold mb-4">
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
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">
                Gerenciamento de Usuários
              </h2>

              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <input
                  value={userNameFilter}
                  onChange={(e) => setUserNameFilter(e.target.value)}
                  placeholder="Filtrar por UserName"
                  className="border border-[#E6F4EA] px-4 py-2 rounded flex-grow"
                  onKeyDown={(e) => e.key === "Enter" && handleUserNameSearch()}
                />
                <button
                  onClick={handleUserNameSearch}
                  className="bg-[#0F9D58] text-white px-4 py-2 rounded hover:bg-[#0C7A43]"
                >
                  Pesquisar
                </button>
                <button
                  onClick={handleClearUserNameFilter}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Limpar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-[#0F9D58] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">UserName</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#F1F8F5] border-b border-[#E6F4EA]"
                      >
                        <td className="px-6 py-3 text-sm text-gray-800">
                          {user.userName}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800">
                          {user.email}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="bg-[#0F9D58] hover:bg-[#0C7A43] text-white px-4 py-2 rounded shadow-sm transition"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-600"
                      : "bg-[#0F9D58] text-white hover:bg-[#0C7A43]"
                  }`}
                >
                  Anterior
                </button>
                <span className="text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-600"
                      : "bg-[#0F9D58] text-white hover:bg-[#0C7A43]"
                  }`}
                >
                  Próxima
                </button>
              </div>
            </>
          )}

          {activeTab === "permissoes" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">
                Permissões (Roles)
              </h2>

              <div className="flex flex-wrap mb-4 gap-2">
                <input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nova permissão"
                  className="border border-[#E6F4EA] px-4 py-2 rounded flex-grow"
                />
                <button
                  onClick={handleAddRole}
                  className="bg-[#0F9D58] text-white px-4 py-2 rounded hover:bg-[#0C7A43] flex items-center gap-2 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar
                </button>
                <button
                  onClick={() => setClaimsDropdownOpen(!claimsDropdownOpen)}
                  className="border border-[#E6F4EA] px-4 py-2 rounded bg-white hover:bg-[#F1F8F5] flex items-center gap-2 transition relative"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  Selecionar Claims
                </button>

                <div
                  ref={claimsDropdownRef}
                  className={`absolute mt-12 w-72 bg-white border border-[#E6F4EA] rounded shadow p-4 z-50 transition-all duration-200 ${
                    claimsDropdownOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}
                >
                  {availableClaims.map((claim) => (
                    <label
                      key={claim}
                      className="flex justify-between items-center mb-2 text-sm"
                    >
                      <span>{claim}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRoleClaims.includes(claim)}
                          onChange={() => toggleNewRoleClaim(claim)}
                        />
                        <button
                          onClick={() => handleDeleteClaim(claim)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </label>
                  ))}
                  <div className="flex mt-4">
                    <input
                      value={newClaimName}
                      onChange={(e) => setNewClaimName(e.target.value)}
                      placeholder="Nova claim"
                      className="border px-3 py-2 rounded flex-grow text-sm"
                    />
                    <button
                      onClick={handleAddClaim}
                      className="ml-2 bg-[#0F9D58] hover:bg-[#0C7A43] text-white px-3 rounded transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-[#0F9D58] text-white">
                    <tr>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3">Claims</th>
                      <th className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr
                        key={role.id}
                        className="hover:bg-[#F1F8F5] border-b border-[#E6F4EA]"
                      >
                        <td className="px-6 py-3">
                          {editingRoleId === role.id ? (
                            <input
                              value={editingRoleName}
                              onChange={(e) => setEditingRoleName(e.target.value)}
                              className="border px-3 py-2 rounded w-full"
                            />
                          ) : (
                            role.name
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingRoleId === role.id ? (
                            <div className="flex flex-wrap gap-2">
                              {availableClaims.map((claim) => (
                                <label key={claim} className="text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editingRoleClaims.includes(claim)}
                                    onChange={() => toggleEditingRoleClaim(claim)}
                                    className="mr-1"
                                  />
                                  {claim}
                                </label>
                              ))}
                            </div>
                          ) : (
                            role.claims.join(", ")
                          )}
                        </td>
                        <td className="px-6 py-3 text-center flex flex-wrap justify-center gap-2">
                          {editingRoleId === role.id ? (
                            <>
                              <button
                                onClick={() => handleSaveRole(role.id)}
                                className="inline-flex items-center gap-1 bg-[#0F9D58] text-white px-3 py-1 rounded hover:bg-[#0C7A43] transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingRoleId(null)}
                                className="inline-flex items-center gap-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditRole(role)}
                                className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v5m16 0v5a2 2 0 01-2 2h-5m-4 0H6a2 2 0 01-2-2v-5m0-4V6a2 2 0 012-2h5"
                                  />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => setRoleToDelete(role)}
                                className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3"
                                  />
                                </svg>
                                Excluir
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!activeTab && (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Selecione uma opção no menu</span>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Manager;


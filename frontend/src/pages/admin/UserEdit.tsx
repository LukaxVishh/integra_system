import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

interface Role {
  name: string;
  assigned: boolean;
}

interface Supervisor {
  id: string;
  nome: string;
}

interface UserRolesResponse {
  id: string;
  userName: string;
  email: string;
  nome: string;
  cargo: string;
  ua: string;
  supervisorId?: string;
  roles: Role[];
  supervisors: Supervisor[];
  claims: string[];
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [ua, setUa] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [claims, setClaims] = useState<string[]>([]);
  const [userClaims, setUserClaims] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [claimsDropdownOpen, setClaimsDropdownOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rolesDropdownRef = useRef<HTMLDivElement>(null);
  const claimsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target as Node)) {
        setRolesDropdownOpen(false);
      }
      if (claimsDropdownRef.current && !claimsDropdownRef.current.contains(event.target as Node)) {
        setClaimsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, claimsRes] = await Promise.all([
          fetch(`http://localhost:5000/users/${id}/roles`, { credentials: "include" }),
          fetch(`http://localhost:5000/roles/claims`, { credentials: "include" })
        ]);

        if (!userRes.ok || !claimsRes.ok) throw new Error("Erro ao buscar dados");

        const userData: UserRolesResponse = await userRes.json();
        const claimsData: string[] = await claimsRes.json();

        setUserName(userData.userName);
        setEmail(userData.email);
        setNome(userData.nome);
        setCargo(userData.cargo);
        setUa(userData.ua);
        setRoles(userData.roles);
        setSupervisors(userData.supervisors || []);
        setSupervisorId(userData.supervisorId || null);
        setClaims(claimsData);
        setUserClaims(userData.claims || []);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    if (id) fetchAll();
  }, [id]);

  const handleRoleChange = (roleName: string) => {
    setRoles(prev =>
      prev.map(r =>
        r.name === roleName ? { ...r, assigned: !r.assigned } : r
      )
    );
  };

  const handleClaimChange = async (claimType: string) => {
    try {
      const isAssigned = userClaims.includes(claimType);
      const response = await fetch(`http://localhost:5000/admin/${isAssigned ? "revoke-claim" : "grant-claim"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          claim: { type: claimType, value: "true" }
        })
      });

      if (response.ok) {
        setUserClaims(prev =>
          isAssigned ? prev.filter(c => c !== claimType) : [...prev, claimType]
        );
        setMessage(`${isAssigned ? "Revogado" : "Concedido"} claim ${claimType}`);
      } else {
        setMessage("Erro ao atualizar claim");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar claim");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSyncClaims = async () => {
    try {
      // 1️⃣ Atualiza roles antes de sincronizar claims
      const selectedRoles = roles.filter(r => r.assigned).map(r => r.name);
      const rolesRes = await fetch(`http://localhost:5000/users/${id}/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRoles)
      });

      if (!rolesRes.ok) throw new Error("Erro ao salvar roles antes de sincronizar claims.");

      // 2️⃣ Agora sincroniza claims com base nas roles persistidas
      const syncRes = await fetch(`http://localhost:5000/users/${id}/sync-claims`, {
        method: "POST",
        credentials: "include"
      });

      if (syncRes.ok) {
        // Atualiza claims na tela após sync
        const refreshed = await fetch(`http://localhost:5000/users/${id}/roles`, { credentials: "include" });
        const refreshedData: UserRolesResponse = await refreshed.json();
        setUserClaims(refreshedData.claims || []);
        setMessage("Claims sincronizadas com sucesso!");
      } else {
        setMessage("Erro ao sincronizar claims");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao sincronizar claims");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    const selectedRoles = roles.filter(r => r.assigned).map(r => r.name);

    const payload: any = {
      nome,
      email,
      cargo,
      Centro_de_Custo: parseInt(ua),
      roles: selectedRoles
    };
    if (isLowLevel) payload.supervisorId = supervisorId;

    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage("Alterações salvas com sucesso!");
        setTimeout(() => navigate("/admin/manager"), 2000);
      } else {
        setMessage("Erro ao salvar alterações");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar alterações");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const isLowLevel = roles.some(r =>
    r.assigned && (
      r.name.toLowerCase().includes("analista") || r.name.toLowerCase().includes("assistente")
    )
  );

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6 mt-16">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl relative">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h2>
          <div className="grid grid-cols-3 gap-4">

            {message && (
              <div className="absolute left-1/2 -top-20 transform -translate-x-1/2">
                <button
                  className="border-2 border-green-700 bg-green-100 text-green-700 font-bold px-6 py-2 rounded shadow"
                  disabled
                >
                  {message}
                </button>
              </div>
            )}

            <div>
              <label className="block font-semibold">Ldap</label>
              <input type="text" value={userName} readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block font-semibold">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                className="w-full border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block font-semibold">Cargo</label>
              <input type="text" value={cargo} onChange={e => setCargo(e.target.value)}
                className="w-full border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block font-semibold">UA</label>
              <input type="number" value={ua} onChange={e => setUa(e.target.value)}
                className="w-full border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block font-semibold">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded p-2" />
            </div>

            <div>
              <label className="block font-semibold">Acessos (Roles)</label>
              <div ref={rolesDropdownRef} className="relative">
                <button type="button"
                  onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                  className="w-full border border-gray-300 rounded p-2 bg-gray-50 hover:bg-gray-100">
                  Selecionar Acessos
                </button>
                {rolesDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto">
                    {roles.map(role => (
                      <label key={role.name} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" checked={role.assigned} onChange={() => handleRoleChange(role.name)} />
                        <span>{role.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold">Claims Manuais</label>
              <div ref={claimsDropdownRef} className="relative">
                <button type="button"
                  onClick={() => setClaimsDropdownOpen(!claimsDropdownOpen)}
                  className="w-full border border-gray-300 rounded p-2 bg-gray-50 hover:bg-gray-100">
                  Conceder/Revogar Claims
                </button>
                {claimsDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto">
                    {claims.map(claim => (
                      <label key={claim} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" checked={userClaims.includes(claim)}
                          onChange={() => handleClaimChange(claim)} />
                        <span>{claim}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isLowLevel && (
              <div>
                <label className="block font-semibold">Gerente Responsável</label>
                <select value={supervisorId || ""} onChange={e => setSupervisorId(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2">
                  <option value="">Selecione um gerente</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
            )}

          </div>

          <div className="flex justify-between space-x-4 mt-6">
            <button onClick={handleSyncClaims}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded">
              Sincronizar Claims Padrão
            </button>
            <div className="flex gap-4">
              <button onClick={() => navigate("/admin/manager")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserEdit;

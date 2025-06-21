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
  const [message, setMessage] = useState<string | null>(null);

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [claimsDropdownOpen, setClaimsDropdownOpen] = useState(false);
  const [supervisorsDropdownOpen, setSupervisorsDropdownOpen] = useState(false);

  const rolesDropdownRef = useRef<HTMLDivElement>(null);
  const claimsDropdownRef = useRef<HTMLDivElement>(null);
  const supervisorsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target as Node)) {
        setRolesDropdownOpen(false);
      }
      if (claimsDropdownRef.current && !claimsDropdownRef.current.contains(event.target as Node)) {
        setClaimsDropdownOpen(false);
      }
      if (supervisorsDropdownRef.current && !supervisorsDropdownRef.current.contains(event.target as Node)) {
        setSupervisorsDropdownOpen(false);
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
    setRoles(prev => prev.map(r => r.name === roleName ? { ...r, assigned: !r.assigned } : r));
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
      const selectedRoles = roles.filter(r => r.assigned).map(r => r.name);
      await fetch(`http://localhost:5000/users/${id}/roles`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRoles)
      });

      const syncRes = await fetch(`http://localhost:5000/users/${id}/sync-claims`, {
        method: "POST",
        credentials: "include"
      });

      if (syncRes.ok) {
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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Navbar />
      <main className="flex-grow flex justify-center items-start px-4 pt-24 pb-10">
        <div className="bg-white shadow-xl rounded-2xl border border-[#E6F4EA] p-8 w-full max-w-4xl animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <span dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#0F9D58" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round-cog-icon lucide-user-round-cog"><path d="m14.305 19.53.923-.382"/><path d="m15.228 16.852-.923-.383"/><path d="m16.852 15.228-.383-.923"/><path d="m16.852 20.772-.383.924"/><path d="M2 21a8 8 0 0 1 10.434-7.62"/><path d="m20.772 16.852.924-.383"/><path d="m20.772 19.148.924.383"/><circle cx="10" cy="8" r="5"/><circle cx="18" cy="18" r="3"/></svg>` }} />
            <h1 className="text-2xl font-bold text-[#0F9D58]">Perfil do usuário</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="LDAP" value={userName} readOnly />
            <Field label="Nome" value={nome} onChange={setNome} />
            <Field label="Cargo" value={cargo} onChange={setCargo} />
            <Field label="UA" value={ua} onChange={setUa} type="number" />
            <Field label="Email" value={email} onChange={setEmail} type="email" />

            <MultiSelectDropdown
              label="Acessos (Roles)"
              items={roles}
              onToggle={handleRoleChange}
              isOpen={rolesDropdownOpen}
              setIsOpen={setRolesDropdownOpen}
              ref={rolesDropdownRef}
              placeholder="Selecionar Acessos"
            />

            <MultiSelectDropdown
              label="Claims Manuais"
              items={claims.map(c => ({ name: c, assigned: userClaims.includes(c) }))}
              onToggle={handleClaimChange}
              isOpen={claimsDropdownOpen}
              setIsOpen={setClaimsDropdownOpen}
              ref={claimsDropdownRef}
              placeholder="Conceder/Revogar Claims"
              position="top"
            />

            {isLowLevel && (
              <MultiSelectDropdown
                label="Gerente Responsável"
                items={supervisors.map(s => ({ name: s.nome, assigned: s.id === supervisorId }))}
                onToggle={(name: string) => {
                  const supervisor = supervisors.find(s => s.nome === name);
                  if (supervisor) setSupervisorId(supervisor.id);
                  setSupervisorsDropdownOpen(false);
                }}
                isOpen={supervisorsDropdownOpen}
                setIsOpen={setSupervisorsDropdownOpen}
                ref={supervisorsDropdownRef}
                placeholder="Selecionar Gerente"
                singleSelect
                position="top"
              />
            )}
          </div>

          {message && (
            <div className="mt-6 px-4 py-3 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800 animate-slideFade">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleSyncClaims}
              className="px-5 py-2 rounded-full font-bold text-[#0F9D58] border border-[#0F9D58] hover:bg-[#E6F4EA] transition"
            >
              Sincronizar Claims
            </button>
            <button
              onClick={() => navigate("/admin/manager")}
              className="px-5 py-2 rounded-full font-bold bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full font-bold bg-[#0F9D58] hover:bg-[#0C7A43] text-white transition"
            >
              Salvar
            </button>
          </div>

          <style>{`
            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            .animate-slideFade { animation: slideFade 0.3s ease-out; }
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
            @keyframes slideFade { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({ label, value, onChange, readOnly = false, type = "text" }: any) => (
  <div>
    <label className="block font-semibold text-[#0F9D58] mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
      className={`w-full border border-[#E6F4EA] rounded px-4 py-2 ${readOnly ? "bg-gray-100" : "bg-white"}`}
    />
  </div>
);

const MultiSelectDropdown = React.forwardRef(({ label, items, onToggle, isOpen, setIsOpen, placeholder, position, singleSelect }: any, ref: any) => (
  <div>
    <label className="block font-semibold text-[#0F9D58] mb-1">{label}</label>
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-[#E6F4EA] rounded-full px-4 py-2 bg-white shadow-sm hover:bg-[#F1F8F5] flex justify-between items-center transition"
      >
        {items.filter((i: any) => i.assigned).length > 0
          ? `${items.filter((i: any) => i.assigned).length} selecionado(s)`
          : placeholder}
        <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute z-20 ${position === "top" ? "bottom-full mb-2" : "mt-2"} w-full bg-white border border-[#E6F4EA] rounded-xl shadow-lg max-h-60 overflow-auto animate-slideFade`}>
          {items.map((item: any) => (
            <label
              key={item.name}
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[#F1F8F5] transition"
            >
              <span>{item.name}</span>
              {singleSelect ? (
                <input
                  type="radio"
                  name={label}
                  checked={item.assigned}
                  onChange={() => onToggle(item.name)}
                  className="accent-[#0F9D58] w-4 h-4"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={item.assigned}
                  onChange={() => onToggle(item.name)}
                  className="accent-[#0F9D58] w-4 h-4"
                />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  </div>
));

export default UserEdit;

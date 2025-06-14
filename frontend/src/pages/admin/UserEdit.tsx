import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

interface Role {
  name: string;
  assigned: boolean;
}

interface UserRolesResponse {
  id: string;
  userName: string;
  email: string;
  nome: string;
  cargo: string;
  ua: string;
  roles: Role[];
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
  const [loading, setLoading] = useState(true);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/users/${id}/roles`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
        return res.json();
      })
      .then((data: UserRolesResponse) => {
        setUserName(data.userName);
        setEmail(data.email);
        setNome(data.nome);
        setCargo(data.cargo);
        setUa(data.ua);
        setRoles(data.roles);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleRoleChange = (roleName: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) =>
        r.name === roleName ? { ...r, assigned: !r.assigned } : r
      )
    );
  };

  const handleSave = async () => {
    const selectedRoles = roles.filter((r) => r.assigned).map((r) => r.name);

    const payload = {
      Nome: nome,
      Email: email,
      Cargo: cargo,
      UA: ua,
      Roles: selectedRoles,
    };

    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao salvar alterações");

      alert("Alterações salvas com sucesso!");
      navigate("/admin/manager");
    } catch (error) {
      alert("Erro ao salvar alterações.");
      console.error(error);
    }
  };

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Conteúdo principal */}
      <div className="flex-grow flex items-center justify-center p-6 mt-16">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700">UserName</label>
              <input
                type="text"
                value={userName}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded p-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">UA</label>
              <input
                type="text"
                value={ua}
                onChange={(e) => setUa(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">Acessos</label>
              <button
                type="button"
                onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                className="w-full border border-gray-300 rounded p-2 text-left bg-gray-50 hover:bg-gray-100"
              >
                Selecionar Acessos
              </button>

              {rolesDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto">
                  {roles.map((role) => (
                    <label
                      key={role.name}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={role.assigned}
                        onChange={() => handleRoleChange(role.name)}
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => navigate("/admin/manager")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserEdit;
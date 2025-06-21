import { Bars3Icon, UserIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface ManagerSidebarProps {
  activeTab: "usuarios" | "permissoes";
  setActiveTab: (tab: "usuarios" | "permissoes") => void;
}

const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="inline-block bg-white rounded-2xl shadow p-4 border border-[#E6F4EA] w-full md:w-1/5">
      <div className="flex items-center gap-2 mb-4">
        <Bars3Icon className="w-5 h-5 text-[#0F9D58]" />
        <h2 className="text-lg font-bold text-[#0F9D58]">Menu</h2>
      </div>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-md transition ${
              activeTab === "usuarios"
                ? "bg-[#0F9D58] text-white"
                : "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#D8F1E1]"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            Usuários
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("permissoes")}
            className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-md transition ${
              activeTab === "permissoes"
                ? "bg-[#0F9D58] text-white"
                : "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#D8F1E1]"
            }`}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            Permissões
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default ManagerSidebar;

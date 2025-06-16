import React from "react";

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-white rounded-2xl shadow p-4 hidden lg:block">
    <h2 className="text-lg font-semibold mb-4">Menu</h2>
    <ul className="space-y-2">
      {["Ciclo de Crédito", "Negócios", "Processos de Qualidade"].map((item, idx) => (
        <li key={idx}>
          <button
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => console.log(item)}
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  </aside>
);

export default Sidebar;

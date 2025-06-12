import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Conteúdo principal */}
      <div className="flex-grow grid gap-2 p-4" style={{
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
      }}>
        {/* Lista de botões */}
        <div className="row-start-2 row-span-3 bg-white p-4 rounded-lg shadow-md">
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

        {/* Feed de notícias */}
        <div className="col-span-4 row-start-2 row-span-3 bg-white p-4 rounded-lg shadow-md overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Feed de Notícias</h2>
          {/* Campo de postagem */}
          <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <textarea
              placeholder="Escreva algo..."
              className="w-full p-2 mb-2 border rounded resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <button className="text-blue-600 hover:underline">📷 Imagem</button>
                <button className="text-green-600 hover:underline">🎥 Vídeo</button>
                <button className="text-yellow-600 hover:underline">😊 Emote</button>
              </div>
              <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                Publicar
              </button>
            </div>
          </div>

          {/* Notícias simuladas */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-200 rounded-md">
              <h3 className="font-bold">Notícia 1</h3>
              <p>Descrição da notícia 1...</p>
            </div>
            <div className="p-4 bg-gray-200 rounded-md">
              <h3 className="font-bold">Notícia 2</h3>
              <p>Descrição da notícia 2...</p>
            </div>
            <div className="p-4 bg-gray-200 rounded-md">
              <h3 className="font-bold">Notícia 3</h3>
              <p>Descrição da notícia 3...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
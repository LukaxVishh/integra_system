import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Sidebar from "../../components/sidebar/Sidebar";
import InfinitePosts from "../../components/post/InfinitePosts";
import { NewspaperIcon } from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* Adicione flex-1 aqui */}
      <main className="flex flex-1 p-4 gap-4 pt-20 items-start">
        <Sidebar />
        <section className="flex-1 bg-white border border-[#E6F4EA] rounded-2xl shadow p-6 overflow-hidden">
          <h2 className="text-2xl font-bold text-[#0F9D58] mb-6 inline-flex items-center gap-2">
            <NewspaperIcon className="w-7 h-7 text-[#0F9D58]" />
            Feed de Notícias
          </h2>

          <InfinitePosts />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Sidebar from "../../components/sidebar/Sidebar";
import CreatePost from "../../components/post/CreatePost";
import Post from "../../components/post/Post";


const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);


  const pageSize = 20;

  const fetchPosts = async (currentPage: number) => {
    try {
      const response = await fetch(`http://localhost:5000/posts?page=${currentPage}&pageSize=${pageSize}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        // Se vier menos que pageSize, significa que não tem mais:
        setHasMore((data.posts || []).length === pageSize);
      } else {
        console.error("Erro ao buscar posts");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex flex-1 p-4 gap-4 pt-20">
        <Sidebar />
        <section className="flex-1 bg-white rounded-2xl shadow p-4">
          <h2 className="text-2xl font-bold mb-4">Feed de Notícias</h2>

          <CreatePost />

          <div className="space-y-4 mt-6">
            {posts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                authorName={post.authorName}
                authorCargo={post.authorCargo}
                content={post.content}
                mediaPath={post.mediaPath}
                reactions={post.reactions}
                comments={post.comments}
              />
            ))}
          </div>

          {/* 🔵 Botões de Paginação */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              Página Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!hasMore}
              className={`px-4 py-2 rounded ${!hasMore ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              Próxima Página
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

// PessoasCulturaInfinitePosts.tsx - Correto e comentado
import React, { useState, useEffect, useRef } from "react";
import PessoasCulturaPostCard from "./PessoasCulturaPostCard";
import CreatePessoasCulturaPost from "./CreatePessoasCulturaPost";

interface PostData {
  id: number;
  authorName: string;
  authorCargo: string;
  content: string;
  mediaPath?: string | null;
  createdAt: string;
  authorPhotoUrl?: string | null;
}

const SkeletonPost = () => (
  <div className="bg-white border border-[#E6F4EA] rounded-2xl shadow p-5 space-y-4 animate-pulse">
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 rounded-full bg-[#E6F4EA]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-[#E6F4EA] rounded" />
        <div className="h-3 w-24 bg-[#E6F4EA] rounded" />
      </div>
    </div>
    <div className="h-4 bg-[#E6F4EA] rounded w-full" />
    <div className="h-4 bg-[#E6F4EA] rounded w-3/4" />
    <div className="h-48 bg-[#E6F4EA] rounded w-full" />
  </div>
);

const PessoasCulturaInfinitePosts: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/pessoas-cultura?page=${page}&pageSize=${pageSize}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("✅ PessoasCultura posts:", data);

      if (data.posts.length < pageSize) setHasMore(false);

      setPosts((prev) => {
        const newPosts = data.posts.filter(
            (p: PostData) => !prev.some((existing) => existing.id === p.id)
        );
        return [...prev, ...newPosts];
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Erro ao buscar posts do Pessoas e Cultura:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) fetchPosts();
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <CreatePessoasCulturaPost />

      {/* Teste: se nada mostrar, teste com <pre>{JSON.stringify(posts)}</pre> */}
      {posts.map((post) => (
        <PessoasCulturaPostCard key={post.id} {...post} />
      ))}

      {loading && (
        <div className="flex flex-col gap-6">
          {[...Array(2)].map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loaderRef} className="w-full text-center py-6 text-[#0F9D58] font-bold">
          Role para carregar mais...
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-400">Você viu tudo 🍃</div>
      )}
    </div>
  );
};

export default PessoasCulturaInfinitePosts;

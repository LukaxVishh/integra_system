import React, { useState, useRef, useEffect } from "react";

interface PostProps {
  id: number;
  author: string;
  content: string;
  mediaPath?: string | null;
  reactions: { type: string; count: number; users?: string[] }[];
  comments: { userName: string; text: string; createdAt: string }[];
  currentUser: string | null; // 👈 Novo
}


const Post: React.FC<PostProps> = ({
  id,
  author,
  content,
  mediaPath,
  reactions,
  comments: initialComments,
}) => {
  const [localReactions, setLocalReactions] = useState(reactions);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [popupType, setPopupType] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMediaType = () => {
    if (!mediaPath) return null;
    const ext = mediaPath.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext!)) return "video";
    if (["mp3", "wav"].includes(ext!)) return "audio";
    return null;
  };
  const mediaType = getMediaType();

  const handleReact = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/reactions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type),
      });

      if (response.ok) {
        console.log("Reação enviada com sucesso");
        // 👉 BUSCAR NOVO ESTADO DESTE POST
        const newPost = await fetch(`http://localhost:5000/posts/${id}`, {
          credentials: "include",
        }).then(res => res.json());

        // ✅ Atualiza apenas o localReactions com o backend real
        setLocalReactions(newPost.reactions);
      }
    } catch (err) {
      console.error("Erro ao reagir:", err);
    }
  };


  const handleAddComment = async () => {
    if (comment.trim() === "") return;
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment.trim() }),
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [...prev, newComment]);
        setComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 space-y-4 relative max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {author[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{author}</p>
          <p className="text-xs text-gray-500">Agora mesmo</p>
        </div>
      </div>

      {/* Texto */}
      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Mídia */}
      {mediaPath && mediaType && (
        <div className="w-full flex justify-start overflow-hidden rounded-lg">
          {mediaType === "image" && (
            <img
              src={`http://localhost:5000/${mediaPath}`}
              alt="Post media"
              className="w-full max-h-64 object-contain rounded-lg"
            />
          )}
          {mediaType === "video" && (
            <video controls className="max-h-64 w-auto rounded-lg">
              <source src={`http://localhost:5000/${mediaPath}`} />
            </video>
          )}
          {mediaType === "audio" && (
            <audio controls className="w-full mt-2">
              <source src={`http://localhost:5000/${mediaPath}`} />
            </audio>
          )}
        </div>
      )}

      {/* Reações */}
      <div className="flex gap-6 items-center text-gray-600 relative">
        {["like", "love", "laugh"].map((type) => (
          <button
            key={type}
            onClick={() => handleReact(type)}
            onMouseEnter={() => setPopupType(type)}
            onMouseLeave={() => setPopupType(null)}
            className="flex items-center gap-1 hover:text-blue-600 relative"
          >
            {type === "like" && "👍"}
            {type === "love" && "❤️"}
            {type === "laugh" && "😂"}
            <span>{localReactions.find((r) => r.type === type)?.count || 0}</span>

            {popupType === type && (
              <div
                ref={popupRef}
                className={`absolute top-full mt-2 ${
                  type === "like" ? "left-0 ml-4" : "left-1/2 -translate-x-1/2"
                } bg-white border border-gray-300 shadow-lg rounded-lg p-3 w-48 z-50`}
              >
                <h4 className="text-sm font-semibold mb-2 capitalize">
                  {type === "like" && "Curtidas"}
                  {type === "love" && "Amaram"}
                  {type === "laugh" && "Riram"}
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {localReactions.find((r) => r.type === type)?.users?.length ? (
                    localReactions
                      .find((r) => r.type === type)!
                      .users!.map((user, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                            {user[0].toUpperCase()}
                          </div>
                          <span>{user}</span>
                        </li>
                      ))
                  ) : (
                    <li className="text-gray-400 italic">Ninguém ainda</li>
                  )}
                </ul>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Novo comentário */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Escreva um comentário..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Comentar
        </button>
      </div>

      {/* Lista de comentários */}
      {comments.length > 0 && (
        <div className="border-t border-gray-200 pt-3 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Comentários</h4>
          {comments.map((c, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {c.userName[0].toUpperCase()}
              </div>
              <div className="text-sm bg-gray-100 rounded-xl px-4 py-2">
                <span className="font-semibold">{c.userName}:</span> {c.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;

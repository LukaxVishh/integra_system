import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { getFirstAndSecondName } from "../../types/NameHelpers";

interface PostProps {
  id: number;
  authorName: string;
  authorCargo: string;
  content: string;
  mediaPath?: string | null;
  reactions: { type: string; count: number; users?: string[] }[];
  comments: { userName: string; text: string; createdAt: string }[];
  onDelete?: (id: number) => void; // ✅ Novo: callback para pai remover
}

const Post: React.FC<PostProps> = ({
  id,
  authorName,
  authorCargo,
  content,
  mediaPath,
  reactions,
  comments: initialComments,
  onDelete,
}) => {
  const { currentUser, roles } = useAuth();
  const [localReactions, setLocalReactions] = useState(reactions);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [popupType, setPopupType] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Novo: Dropdown para editar/excluir
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [savingEdit, setSavingEdit] = useState(false);

  const isOwner = currentUser && currentUser.nome === authorName;
  const isManager = roles.includes("Gerente CA") || roles.includes("Gerente UA");
  const isAdmin = roles.includes("Admin");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupType(null);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
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
        const newPost = await fetch(`http://localhost:5000/posts/${id}`, {
          credentials: "include",
        }).then(res => res.json());

        setLocalReactions(newPost.reactions);
      }
    } catch (err) {
      console.error("Erro ao reagir:", err);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() === "" || !currentUser) return;

    try {
      const response = await fetch(`http://localhost:5000/posts/${id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: comment.trim(),
        }),
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

  // ✅ EDITAR
  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (response.ok) {
        setIsEditing(false);
      } else {
        alert("Erro ao salvar edição.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  // ✅ EXCLUIR
  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;
    try {
      const response = await fetch(`http://localhost:5000/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        if (onDelete) onDelete(id);
      } else {
        alert("Erro ao excluir post.");
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
          {authorName[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {getFirstAndSecondName(authorName)}{" "}
            <span className="text-xs text-gray-500">({authorCargo})</span>
          </p>
          <p className="text-xs text-gray-500">Agora mesmo</p>
        </div>

        {(isOwner || isManager || isAdmin) && (
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12h.01M12 12h.01M18 12h.01"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 shadow-lg rounded-md z-50">
                <button
                  onClick={handleEdit}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Texto ou edição */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full border border-gray-300 rounded p-3"
            rows={4}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {savingEdit ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: editedContent }}
        />
      )}

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
                          <span>{getFirstAndSecondName(user)}</span>
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
                <span className="font-semibold">{getFirstAndSecondName(c.userName)}:</span> {c.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;

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
  authorSupervisorId?: string | null;
  onDelete?: (id: number) => void;
}

const Post: React.FC<PostProps> = ({
  id,
  authorName,
  authorCargo,
  content,
  mediaPath,
  reactions,
  comments: initialComments,
  authorSupervisorId,
  onDelete,
}) => {
  const { currentUser, roles } = useAuth();
  const [localReactions, setLocalReactions] = useState(reactions);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [popupType, setPopupType] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [savingEdit, setSavingEdit] = useState(false);

  const isOwner = currentUser && currentUser.nome === authorName;
  const isAdmin = roles.includes("Admin");
  const isSupervisor = currentUser && authorSupervisorId && currentUser.id === authorSupervisorId;

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
        }).then((res) => res.json());

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
  <div className="bg-white border border-[#E6F4EA] rounded-2xl shadow p-5 space-y-4 relative max-w-2xl mx-auto min-h-[300px] flex flex-col justify-between">

    {/* Top header */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#0F9D58] rounded-full flex items-center justify-center text-white font-bold">
        {authorName[0].toUpperCase()}
      </div>
      <div>
        <p className="font-semibold text-gray-800">
          {getFirstAndSecondName(authorName)}{" "}
          <span className="text-xs text-gray-500">({authorCargo})</span>
        </p>
        <p className="text-xs text-gray-500">Agora mesmo</p>
      </div>

      {(isOwner || isSupervisor || isAdmin) && (
        <div className="relative ml-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-[#E6F4EA]"
          >
            <svg
              className="w-5 h-5 text-[#0F9D58]"
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
            <div className="absolute right-0 mt-2 w-32 bg-white border border-[#E6F4EA] shadow-lg rounded-md z-50">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-[#E6F4EA]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v5m16 0v5a2 2 0 01-2 2h-5m-4 0H6a2 2 0 01-2-2v-5m0-4V6a2 2 0 012-2h5"
                  />
                </svg>
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4H9v3"
                  />
                </svg>
                Excluir
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Content or edit mode */}
    {isEditing ? (
      <div className="space-y-2">
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full border border-[#E6F4EA] rounded p-3"
          rows={4}
        />
        <div className="flex gap-3">
          <button
            onClick={handleSaveEdit}
            disabled={savingEdit}
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43] transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {savingEdit ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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

    {/* Media */}
    {mediaPath && mediaType && (
      <div className="w-full overflow-hidden rounded-xl">
        {mediaType === "image" && (
          <img
            src={`http://localhost:5000/${mediaPath}`}
            alt="Post media"
            className="w-full max-h-96 object-cover rounded-xl"
          />
        )}
        {mediaType === "video" && (
          <video controls className="w-full rounded-xl">
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

    {/* Reactions */}
    <div className="flex gap-6 items-center text-[#0F9D58] relative">

      {/* Like */}
      <button
        onClick={() => handleReact("like")}
        onMouseEnter={() => setPopupType("like")}
        onMouseLeave={() => setPopupType(null)}
        className="flex items-center gap-1 hover:scale-110 hover:text-[#128C52] transition transform duration-200 relative"
      >
        {/* Seu SVG LIKE */}
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
          />
        </svg>
        <span>{localReactions.find(r => r.type === "like")?.count || 0}</span>
        {popupType === "like" && (
          <div
            ref={popupRef}
            className="absolute top-full left-0 ml-4 mt-2 bg-white border border-[#E6F4EA] shadow rounded p-3 w-48 z-50"
          >
            <h4 className="text-sm font-semibold mb-2">Curtidas</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {localReactions.find(r => r.type === "like")?.users?.length ? (
                localReactions.find(r => r.type === "like")?.users?.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#0F9D58] rounded-full flex items-center justify-center text-white text-xs">
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

      {/* Love / Amei */}
      <button
        onClick={() => handleReact("love")}
        onMouseEnter={() => setPopupType("love")}
        onMouseLeave={() => setPopupType(null)}
        className="flex items-center gap-1 hover:scale-110 hover:text-[#128C52] transition transform duration-200 relative"
      >
        {/* ❤️ SVG (igual anterior) */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                  4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                  14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                  6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{localReactions.find(r => r.type === "love")?.count || 0}</span>
        {popupType === "love" && (
          <div
            ref={popupRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E6F4EA] shadow rounded p-3 w-48 z-50"
          >
            <h4 className="text-sm font-semibold mb-2">Amaram</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {localReactions.find(r => r.type === "love")?.users?.length ? (
                localReactions.find(r => r.type === "love")?.users?.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#0F9D58] rounded-full flex items-center justify-center text-white text-xs">
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

      {/* Laugh */}
      <button
        onClick={() => handleReact("laugh")}
        onMouseEnter={() => setPopupType("laugh")}
        onMouseLeave={() => setPopupType(null)}
        className="flex items-center gap-1 hover:scale-110 hover:text-[#128C52] transition transform duration-200 relative"
      >
        {/* Seu SVG LAUGH */}
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
          />
        </svg>
        <span>{localReactions.find(r => r.type === "laugh")?.count || 0}</span>
        {popupType === "laugh" && (
          <div
            ref={popupRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E6F4EA] shadow rounded p-3 w-48 z-50"
          >
            <h4 className="text-sm font-semibold mb-2">Riram</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {localReactions.find(r => r.type === "laugh")?.users?.length ? (
                localReactions.find(r => r.type === "laugh")?.users?.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#0F9D58] rounded-full flex items-center justify-center text-white text-xs">
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

    </div>


    {/* Comments */}
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Escreva um comentário..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border border-[#E6F4EA] rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-[#0F9D58]/30"
      />
      <button
        onClick={handleAddComment}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9D58] text-white rounded-full hover:bg-[#0C7A43] transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
        Comentar
      </button>
    </div>

    {/* Existing Comments */}
    {comments.length > 0 && (
      <div className="border-t border-[#E6F4EA] pt-3 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Comentários</h4>
        {comments.map((c, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="w-8 h-8 bg-[#0F9D58] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {c.userName[0].toUpperCase()}
            </div>
            <div className="text-sm bg-[#F1F8F5] rounded-xl px-4 py-2">
              <span className="font-semibold">
                {getFirstAndSecondName(c.userName)}:
              </span>{" "}
              {c.text}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}

export default Post;

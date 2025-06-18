import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "../../types/FontFamily";
import { FontSize } from "../../types/FonSize";
import { useAuth } from "../../utils/AuthContext";
import { getFirstAndSecondName } from "../../types/NameHelpers";

interface CicloPostCardProps {
  id: number;
  authorName: string;
  authorCargo: string;
  content: string;
  mediaPath?: string | null;
  createdAt: string;
  authorSupervisorId?: string | null;
}

function formatRelativeTime(dateIso: string) {
  const now = new Date();
  const date = new Date(dateIso);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Agora mesmo";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString("pt-BR");
}

const CicloPostCard: React.FC<CicloPostCardProps> = ({
  id,
  authorName,
  authorCargo,
  content,
  mediaPath,
  createdAt,
  authorSupervisorId,
}) => {
  const { currentUser, roles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const relativeTime = formatRelativeTime(createdAt);
  const isOwner = currentUser && currentUser.nome === authorName;
  const isAdmin = roles.includes("Admin");
  const isSupervisor = currentUser && authorSupervisorId && currentUser.id === authorSupervisorId;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Heading,
      TextAlign,
      CodeBlock,
      Code,
      Link,
      HorizontalRule,
      Placeholder.configure({ placeholder: "Edite o conteúdo..." }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
    content: editedContent,
    onUpdate: ({ editor }) => setEditedContent(editor.getHTML()),
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  const handleEdit = () => {
    editor?.commands.setContent(content);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`http://localhost:5000/ciclo/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) setIsEditing(false);
      else alert("Erro ao salvar edição.");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      const res = await fetch(`http://localhost:5000/ciclo/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-[#E6F4EA] rounded-2xl shadow p-5 space-y-4 relative w-full max-w-3xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0F9D58] rounded-full flex items-center justify-center text-white font-bold">
          {authorName[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {getFirstAndSecondName(authorName)}{" "}
            <span className="text-xs text-gray-500">({authorCargo})</span>
          </p>
          <p className="text-xs text-gray-500">{relativeTime}</p>
        </div>

        {(isOwner || isSupervisor || isAdmin) && (
          <div ref={menuRef} className="relative ml-auto">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-[#E6F4EA]">
              <svg className="w-5 h-5 text-[#0F9D58]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-[#E6F4EA] shadow rounded z-50">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F1F8F5]"
                >
                  Editar
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing && editor ? (
        <>
          <EditorContent editor={editor} className="border border-[#E6F4EA] rounded p-3 min-h-[150px]" />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]"
            >
              {savingEdit ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: editedContent }} />
      )}

      {/* Media */}
      {mediaPath && (
        <div className={`w-full overflow-hidden rounded-xl flex items-center justify-center ${isPortrait ? 'h-[500px]' : 'h-[300px]'}`}>
          {mediaPath.match(/\.(jpg|jpeg|png|webp|gif)$/i) && (
            <img src={`http://localhost:5000/${mediaPath}`} alt="Post media" onLoad={handleImageLoad} className="w-full h-full object-contain rounded-xl" />
          )}
          {mediaPath.match(/\.(mp4|webm|ogg)$/i) && (
            <video controls className="w-full h-full object-contain rounded-xl">
              <source src={`http://localhost:5000/${mediaPath}`} />
            </video>
          )}
          {mediaPath.match(/\.(mp3|wav)$/i) && (
            <audio controls className="w-full mt-2">
              <source src={`http://localhost:5000/${mediaPath}`} />
            </audio>
          )}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white border border-[#0F9D58] rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-[#0F9D58] mb-4">Confirmar Exclusão</h2>
            <p className="mb-4">Tem certeza que deseja excluir este post?</p>
            <div className="flex gap-4 justify-end">
              <button onClick={handleDelete} className="px-4 py-2 bg-[#0F9D58] text-white rounded hover:bg-[#0C7A43]">Confirmar</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 border border-[#E6F4EA] text-gray-600 rounded hover:bg-[#E6F4EA]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CicloPostCard;

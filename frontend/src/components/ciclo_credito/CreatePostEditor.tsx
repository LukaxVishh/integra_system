// src/components/ciclo/CreatePostEditor.tsx

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

const TrashIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
  </svg>
);

interface CreatePostEditorProps {
  endpoint: string;
}

const CreatePostEditor: React.FC<CreatePostEditorProps> = ({ endpoint }) => {
  const { currentUser } = useAuth();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [currentColor, setCurrentColor] = useState("#000000");

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
      Placeholder.configure({ placeholder: "Crie uma nova postagem." }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
    ],
    content: "",
  });

  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setMediaPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMediaPreview(null);
    }
  }, [mediaFile]);

  if (!editor) return null;

  const handlePost = async () => {
    if (!currentUser) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    const html = editor.getHTML();
    const formData = new FormData();
    formData.append("authorName", currentUser.nome);
    formData.append("authorCargo", currentUser.cargo);
    formData.append("content", html);
    formData.append("visibility", "Cooperativa"); // fixo
    if (mediaFile) formData.append("file", mediaFile);

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.ok) {
        editor.commands.clearContent();
        setMediaFile(null);
        setSuccessPopup(true);
        setTimeout(() => {
        setSuccessPopup(false);
            window.location.reload();
        }, 3000);
        setTimeout(() => setSuccessPopup(false), 3000);
      } else {
        alert("Erro ao publicar.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar.");
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Insira a URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Apenas imagens ou vídeos são permitidos.");
      return;
    }
    setMediaFile(file);
  };
  const handleRemoveMedia = () => setMediaFile(null);

  const isActive = (command: string, opts = {}) => editor.isActive(command, opts);

  return (
    <div className="w-full max-w-3xl mx-auto px-2 py-4 relative">

      {/* Editor box */}
      <div className="bg-white rounded-2xl shadow border border-[#E6F4EA] flex flex-col pt-4">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3 border-b border-[#E6F4EA]">
          {[
            { cmd: "bold", label: "N", action: () => editor.chain().focus().toggleBold().run() },
            { cmd: "italic", label: "I", action: () => editor.chain().focus().toggleItalic().run() },
            { cmd: "underline", label: "S", action: () => editor.chain().focus().toggleUnderline().run() },
            { cmd: "strike", label: "s", action: () => editor.chain().focus().toggleStrike().run() },
          ].map(({ cmd, label, action }) => (
            <button
              key={cmd}
              onClick={action}
              className={`px-2 py-1 rounded ${isActive(cmd) ? "bg-[#E6F4EA] text-[#0F9D58]" : "hover:bg-[#F1F8F5]"}`}
            >
              {label}
            </button>
          ))}

          <button onClick={setLink} className="px-2 py-1 rounded hover:bg-[#F1F8F5]">🔗</button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded hover:bg-[#F1F8F5]">—</button>
          <button onClick={handleAttachClick} className="px-2 py-1 rounded hover:bg-[#F1F8F5]">📎</button>

          <div className="relative">
            <button
              onClick={() => colorInputRef.current?.click()}
              className="flex flex-col items-center px-2 py-1 rounded hover:bg-[#F1F8F5]"
              title="Cor do texto"
            >
              <span className="font-bold">A</span>
              <span className="w-4 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: currentColor }}></span>
            </button>
            <input
              type="color"
              ref={colorInputRef}
              value={currentColor}
              onChange={(e) => {
                setCurrentColor(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="absolute opacity-0 w-0 h-0"
            />
          </div>

          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="px-2 py-1 rounded border border-[#E6F4EA] focus:outline-none"
          >
            <option value="">Fonte</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
          </select>

          <select
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            className="px-2 py-1 rounded border border-[#E6F4EA] focus:outline-none"
          >
            <option value="">Tamanho</option>
            {[12, 14, 16, 18, 20, 24].map(size => (
              <option key={size} value={`${size}px`}>{size}px</option>
            ))}
          </select>
        </div>

        {/* Editor + mídia */}
        <input type="file" accept="image/*,video/*" ref={fileInputRef} hidden onChange={handleFileChange} />

        <div className="px-4 py-4 mx-4 my-4 rounded-lg border border-[#E6F4EA] cursor-text" onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} className="ProseMirror min-h-[140px] px-2 py-2 focus:outline-none" />
          {mediaPreview && (
            <div className="relative mt-4 rounded-lg overflow-hidden max-w-xs">
              {mediaFile && mediaFile.type.startsWith("image/") && (
                <img src={mediaPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
              )}
              {mediaFile && mediaFile.type.startsWith("video/") && (
                <video src={mediaPreview} controls className="w-full h-40 object-cover rounded-lg" />
              )}
              <button
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 bg-[#E6F4EA] hover:bg-[#C3E6CD] text-red-600 p-2 rounded-md shadow transition-transform transform hover:scale-110"
                title="Remover mídia"
              >
                {TrashIcon}
              </button>
            </div>
          )}
        </div>

        {/* Botão publicar */}
        <div className="flex justify-end px-3 pb-5">
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-[#0F9D58] hover:bg-[#0C7A43] text-white rounded-full font-bold shadow-md transition-transform transform hover:scale-105"
          >
            Publicar
          </button>
        </div>

      </div>

      {successPopup && (
        <div className="absolute bottom-9 left-9 bg-green-100 border border-green-700 text-green-900 px-6 py-2 rounded shadow transition-all duration-500 animate-slidefade">
          Post publicado com sucesso!
        </div>
      )}
    </div>
  );
};

export default CreatePostEditor;

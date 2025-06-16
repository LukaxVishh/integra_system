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

const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth={2} />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
  </svg>
);

const TrashIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
  </svg>
);

const visibilityOptions = ["Agência", "Centro Administrativo", "Cooperativa"];

const CreatePost: React.FC = () => {
  const [visibility, setVisibility] = useState("Agência");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [currentColor, setCurrentColor] = useState("#000000");

  useEffect(() => {
    if (!showVisibilityDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowVisibilityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVisibilityDropdown]);

  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setMediaPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMediaPreview(null);
    }
  }, [mediaFile]);

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

  if (!editor) return null;

  const handlePost = async () => {
    const html = editor.getHTML();
    const formData = new FormData();
    formData.append("author", "Seu Nome Aqui");
    formData.append("content", html);
    if (mediaFile) formData.append("file", mediaFile);

    try {
      const response = await fetch("http://localhost:5000/posts", {
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
    <div className="w-full px-2 py-2 relative">
      <div className="bg-white rounded-2xl shadow-md w-full flex flex-col border border-gray-300">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-3 pt-3 pb-2 gap-2 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { cmd: "bold", label: "N", action: () => editor.chain().focus().toggleBold().run() },
              { cmd: "italic", label: "I", action: () => editor.chain().focus().toggleItalic().run() },
              { cmd: "underline", label: "S", action: () => editor.chain().focus().toggleUnderline().run() },
              { cmd: "strike", label: "s", action: () => editor.chain().focus().toggleStrike().run() },
            ].map(({ cmd, label, action }) => (
              <button
                key={cmd}
                onClick={action}
                className={`px-2 py-1 rounded ${isActive(cmd) ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200"}`}
              >
                {label}
              </button>
            ))}

            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
                className={`px-2 py-1 rounded ${isActive("heading", { level }) ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200"}`}
              >
                H{level}
              </button>
            ))}

            {["left", "center", "right"].map(dir => (
              <button
                key={dir}
                onClick={() => editor.chain().focus().setTextAlign(dir).run()}
                className={`px-2 py-1 rounded ${isActive("textAlign", { textAlign: dir }) ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200"}`}
              >
                {dir[0].toUpperCase()}
              </button>
            ))}

            <button onClick={setLink} className="px-2 py-1 rounded hover:bg-gray-200">🔗</button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded hover:bg-gray-200">—</button>
            <button onClick={handleAttachClick} className="px-2 py-1 rounded hover:bg-gray-200">📎</button>

            <div className="relative">
              <button
                onClick={() => colorInputRef.current?.click()}
                className="flex flex-col items-center justify-center px-2 py-1 rounded hover:bg-gray-200"
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
              className="px-2 py-1 rounded border border-gray-300 focus:outline-none"
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
              className="px-2 py-1 rounded border border-gray-300 focus:outline-none"
            >
              <option value="">Tamanho</option>
              {[12, 14, 16, 18, 20, 24].map(size => (
                <option key={size} value={`${size}px`}>{size}px</option>
              ))}
            </select>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVisibilityDropdown(v => !v)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              {EyeIcon}
            </button>
            {showVisibilityDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-10">
                {visibilityOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => { setVisibility(option); setShowVisibilityDropdown(false); }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${visibility === option ? "font-bold text-blue-600" : ""}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <input type="file" accept="image/*,video/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

        <div className="px-3 py-3 flex-1 cursor-text border border-gray-300 mx-3 my-3 rounded-lg" onClick={() => editor.chain().focus().run()}>
          <EditorContent editor={editor} className="ProseMirror min-h-[120px] px-4 py-3 focus:outline-none" />

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
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-red-600 p-2 rounded-md shadow-md transition-transform transform hover:scale-110"
                title="Remover mídia"
              >
                {TrashIcon}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end px-3 pb-5">
          <button onClick={handlePost} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700">Publicar</button>
        </div>
      </div>

      {/* ✅ POPUP DE SUCESSO */}
      {successPopup && (
        <div className="absolute top-5 right-5 bg-green-100 border border-green-700 text-green-900 px-4 py-2 rounded shadow transition-opacity">
          Post publicado com sucesso!
        </div>
      )}
    </div>
  );
};

export default CreatePost;

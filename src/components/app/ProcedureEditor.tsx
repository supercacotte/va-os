"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
} from "lucide-react";

// Éditeur riche des procédures (Phase 6) — repris du pattern StepsEditor du
// repo de référence, adapté à la DA VA Desk. Le HTML est soumis via un input
// caché `steps` ; il est sanitizé côté serveur à l'écriture.
export default function ProcedureEditor({ defaultValue }: { defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "underline decoration-orange" },
      }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-4 py-3 text-ink outline-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL du lien :");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div className="min-h-[360px] rounded-[12px] bg-sand p-4 text-[13px] font-medium text-ink opacity-60">
        Chargement de l&apos;éditeur…
      </div>
    );
  }

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition ${
      active ? "bg-ink text-paper" : "text-ink/70 hover:bg-sand hover:text-ink"
    }`;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="steps" value={html} readOnly />

      <div className="flex flex-wrap items-center gap-1 rounded-[12px] bg-sand p-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Gras">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Italique">
          <Italic size={16} />
        </button>
        <div className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Titre de section">
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} aria-label="Sous-titre (étape)">
          <Heading3 size={16} />
        </button>
        <div className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} aria-label="Liste à puces">
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} aria-label="Liste numérotée">
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} aria-label="Point de contrôle (citation)">
          <Quote size={16} />
        </button>
        <div className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" onClick={toggleLink} className={btn(editor.isActive("link"))} aria-label="Lien">
          {editor.isActive("link") ? <Unlink size={16} /> : <LinkIcon size={16} />}
        </button>
        <div className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} aria-label="Annuler">
          <Undo2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} aria-label="Rétablir">
          <Redo2 size={16} />
        </button>
      </div>

      <div className="rounded-[12px] bg-paper ring-1 ring-ink/10">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

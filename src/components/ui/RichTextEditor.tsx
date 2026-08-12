import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Image as ImageIcon,
  Undo,
  Redo,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const PRESET_TEXT_COLORS = [
  "#000000",
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#d97706", // Amber
  "#9333ea", // Purple
  "#475569", // Slate
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Nhập nội dung tiểu sử mô tả...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert focus:outline-none min-h-[140px] p-3 text-sm leading-relaxed",
      },
    },
  });

  // Sync external content changes if editor value differs
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("Nhập URL hình ảnh muốn chèn vào tiểu sử:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/30 transition-all">
      {/* ── Toolbar ── */}
      <div className="flex items-center flex-wrap gap-1 p-2 bg-muted/50 border-b text-xs">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-7 w-7"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-7 w-7"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-7 w-7"
          title="Gạch ngang"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border my-auto mx-0.5" />

        <Button
          type="button"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-7 w-7"
          title="Tiêu đề lớn (H1)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-7 w-7"
          title="Tiêu đề vừa (H2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border my-auto mx-0.5" />

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-7 w-7"
          title="Danh sách dấu chấm"
        >
          <List className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-7 w-7"
          title="Danh sách số"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border my-auto mx-0.5" />

        {/* Color Palette */}
        <div className="flex items-center gap-1 px-1">
          <Palette className="w-3.5 h-3.5 text-muted-foreground mr-0.5" />
          {PRESET_TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="w-4 h-4 rounded-full border border-white/80 shadow-xs hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={`Màu chữ ${c}`}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-border my-auto mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={addImage}
          className="h-7 w-7 text-blue-600 dark:text-blue-400"
          title="Chèn URL hình ảnh"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </Button>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7"
            title="Hoàn tác (Undo)"
          >
            <Undo className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7"
            title="Làm lại (Redo)"
          >
            <Redo className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Editor Canvas Content ── */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};

export default RichTextEditor;

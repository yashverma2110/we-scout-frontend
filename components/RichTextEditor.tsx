'use client';
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Added comment above fix: Defined ToolbarButtonProps interface and used React.FC to ensure children prop is correctly recognized
interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  isActive, 
  children, 
  title 
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-indigo-100 text-indigo-600 shadow-sm' 
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = 'Write something...', 
  readOnly = false 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate max-w-none focus:outline-none min-h-[120px] px-8 py-5',
      },
    },
  });

  // Update editor content if external prop changes (e.g. from voice or mission load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={`w-full border rounded-[1.2rem] overflow-hidden transition-all bg-slate-50 ${readOnly ? 'opacity-80' : 'focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 border-slate-100'}`}>
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 bg-white border-b border-slate-50">
          <ToolbarButton 
            title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            title="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            title="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            isActive={editor.isActive('underline')}
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            title="Highlight"
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            isActive={editor.isActive('highlight')}
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-slate-100 mx-1" />
          <ToolbarButton 
            title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            title="Ordered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

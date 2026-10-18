'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import {
  Bold,
  Eraser,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  minHeight?: string
}

export default function RichTextEditor({ value, onChange, placeholder, label, minHeight = '28rem' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text-content prose prose-sm max-w-none min-h-[28rem] w-full px-4 py-4 outline-none sm:min-h-[36rem] sm:px-5 sm:py-5',
        style: `min-height: ${minHeight};`,
        'aria-label': label || 'Editor teks kaya',
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', false)
  }, [editor, value])

  if (!editor) return <div className="min-h-40 animate-pulse rounded-lg border border-border bg-secondary/30" />

  const buttonClass = (active = false) => `inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-muted-foreground transition-colors ${active ? 'border-accent bg-accent text-on-accent shadow-sm' : 'border-transparent hover:border-border hover:bg-secondary hover:text-foreground'}`

  const toolbarButton = (labelText: string, icon: React.ReactNode, action: () => void, active = false, disabled = false) => (
    <button type="button" className={buttonClass(active)} onClick={action} aria-label={labelText} title={labelText} disabled={disabled}>
      {icon}
    </button>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-secondary/30 p-2 sm:gap-2 sm:p-3" role="toolbar" aria-label={`${label || 'Teks'} formatting`}>
        <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">Format</span>
        {toolbarButton('Tebal', <Bold className="h-5 w-5" strokeWidth={2.5} />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {toolbarButton('Miring', <Italic className="h-5 w-5" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {toolbarButton('Garis bawah', <UnderlineIcon className="h-5 w-5" />, () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        <span className="mx-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
        {toolbarButton('Judul', <Heading2 className="h-5 w-5" />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {toolbarButton('Daftar bullet', <List className="h-5 w-5" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {toolbarButton('Daftar bernomor', <ListOrdered className="h-5 w-5" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {toolbarButton('Kutipan', <Quote className="h-5 w-5" />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        <span className="mx-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
        {toolbarButton('Urungkan', <Undo2 className="h-5 w-5" />, () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
        {toolbarButton('Ulangi', <Redo2 className="h-5 w-5" />, () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
        {toolbarButton('Bersihkan format', <Eraser className="h-5 w-5" />, () => editor.chain().focus().clearContent().run())}
      </div>
      <EditorContent editor={editor} />
      {placeholder && !editor.getText() && <p className="pointer-events-none -mt-12 px-4 pb-8 text-sm text-muted-foreground sm:px-5">{placeholder}</p>}
    </div>
  )
}

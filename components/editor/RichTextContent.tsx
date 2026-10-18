'use client'

import DOMPurify from 'isomorphic-dompurify'

export default function RichTextContent({ html, className = '' }: { html: string; className?: string }) {
  const safeHtml = DOMPurify.sanitize(html || '')
  return <div className={`prose prose-sm max-w-none break-words ${className}`} dangerouslySetInnerHTML={{ __html: safeHtml }} />
}

import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { memo, useCallback, useMemo, type MouseEvent } from 'react'
import styles from './MarkdownField.module.scss'

const spoilerExtension = {
  name: 'spoiler',
  level: 'inline' as const,
  start(src: string) {
    return src.indexOf('[spoiler]')
  },
  tokenizer(src: string) {
    const match = /^\[spoiler\]([\s\S]*?)\[\/spoiler\]/.exec(src)
    if (!match) return undefined

    return {
      type: 'spoiler',
      raw: match[0],
      text: match[1],
    }
  },
  renderer(token: { text: string }) {
    return `<span class="${styles.spoiler}" data-spoiler="true">${token.text}</span>`
  },
}

marked.use({ extensions: [spoilerExtension] })

export interface MarkdownFieldProps {
  /** Исходный Markdown-текст для отображения. */
  markdown: string
  /** Текст вместо пустого превью. */
  emptyText?: string
  /** Дополнительный className корневого preview-элемента. */
  className?: string
}

export const MarkdownField = memo(function MarkdownField({
  markdown,
  emptyText = 'Нечего показать',
  className,
}: MarkdownFieldProps) {
  const safeHtml = useMemo(() => {
    const previewHtml = marked.parse(markdown, { breaks: true, async: false }) as string
    return DOMPurify.sanitize(previewHtml)
  }, [markdown])

  const handleSpoilerClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.dataset.spoiler === 'true') {
      target.classList.toggle(styles.spoilerRevealed)
    }
  }, [])

  return (
    <div
      className={[styles.preview, className].filter(Boolean).join(' ')}
      onClick={handleSpoilerClick}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: safeHtml || `<p><em>${DOMPurify.sanitize(emptyText)}</em></p>`,
      }}
    />
  )
})

MarkdownField.displayName = 'MarkdownField'

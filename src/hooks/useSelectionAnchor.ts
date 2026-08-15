import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

export interface SelectionAnchorRect {
  x: number
  y: number
  width: number
  height: number
}

interface MirrorStyles {
  font: string
  lineHeight: string
  letterSpacing: string
  textTransform: string
  textIndent: string
  whiteSpace: string
  wordBreak: string
  overflowWrap: string
  paddingTop: string
  paddingRight: string
  paddingBottom: string
  paddingLeft: string
  borderTopWidth: string
  borderRightWidth: string
  borderBottomWidth: string
  borderLeftWidth: string
  boxSizing: string
}

function getMirrorStyles(textarea: HTMLTextAreaElement): MirrorStyles {
  const computed = window.getComputedStyle(textarea)
  return {
    font: computed.font,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textTransform: computed.textTransform,
    textIndent: computed.textIndent,
    whiteSpace: computed.whiteSpace,
    wordBreak: computed.wordBreak,
    overflowWrap: computed.overflowWrap,
    paddingTop: computed.paddingTop,
    paddingRight: computed.paddingRight,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    borderTopWidth: computed.borderTopWidth,
    borderRightWidth: computed.borderRightWidth,
    borderBottomWidth: computed.borderBottomWidth,
    borderLeftWidth: computed.borderLeftWidth,
    boxSizing: computed.boxSizing,
  }
}

function measureSelection(
  textarea: HTMLTextAreaElement,
): SelectionAnchorRect | null {
  const { selectionStart, selectionEnd } = textarea
  if (selectionEnd <= selectionStart) return null

  const mirror = document.createElement('div')
  const selected = document.createElement('span')
  const styles = getMirrorStyles(textarea)

  mirror.setAttribute('aria-hidden', 'true')
  Object.assign(mirror.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${textarea.clientWidth}px`,
    minHeight: `${textarea.clientHeight}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
    overflow: 'hidden',
  })

  mirror.style.font = styles.font
  mirror.style.lineHeight = styles.lineHeight
  mirror.style.letterSpacing = styles.letterSpacing
  mirror.style.textTransform = styles.textTransform
  mirror.style.textIndent = styles.textIndent
  mirror.style.whiteSpace = styles.whiteSpace
  mirror.style.wordBreak = styles.wordBreak
  mirror.style.overflowWrap = styles.overflowWrap
  mirror.style.paddingTop = styles.paddingTop
  mirror.style.paddingRight = styles.paddingRight
  mirror.style.paddingBottom = styles.paddingBottom
  mirror.style.paddingLeft = styles.paddingLeft
  mirror.style.borderTopWidth = styles.borderTopWidth
  mirror.style.borderRightWidth = styles.borderRightWidth
  mirror.style.borderBottomWidth = styles.borderBottomWidth
  mirror.style.borderLeftWidth = styles.borderLeftWidth
  mirror.style.boxSizing = styles.boxSizing

  const before = textarea.value.slice(0, selectionStart).replace(/\n$/u, '\n\u200b')
  const selection = textarea.value.slice(selectionStart, selectionEnd)
  const after = textarea.value.slice(selectionEnd) || '\u200b'

  mirror.append(document.createTextNode(before))
  selected.textContent = selection
  mirror.append(selected)
  mirror.append(document.createTextNode(after))
  document.body.appendChild(mirror)

  const mirrorRect = mirror.getBoundingClientRect()
  const selectionRect = selected.getBoundingClientRect()
  const textareaRect = textarea.getBoundingClientRect()

  const x = textareaRect.left + (selectionRect.left - mirrorRect.left) - textarea.scrollLeft
  const y = textareaRect.top + (selectionRect.top - mirrorRect.top) - textarea.scrollTop

  const rect = {
    x,
    y,
    width: Math.max(selectionRect.width, 1),
    height: Math.max(selectionRect.height, parseFloat(styles.lineHeight) || 20),
  }

  mirror.remove()
  return rect
}

export function useSelectionAnchor(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  enabled = true,
) {
  const [rect, setRect] = useState<SelectionAnchorRect | null>(null)
  const frameRef = useRef<number | null>(null)

  const recalculate = useCallback(() => {
    const textarea = textareaRef.current
    if (!enabled || !textarea || document.activeElement !== textarea) {
      setRect(null)
      return
    }

    const next = measureSelection(textarea)
    setRect(next)
  }, [enabled, textareaRef])

  useLayoutEffect(() => {
    recalculate()
  }, [recalculate, value])

  useEffect(() => {
    if (!enabled) return undefined

    const scheduleRecalculate = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        recalculate()
      })
    }

    const handleSelectionChange = () => scheduleRecalculate()
    const handleResize = () => scheduleRecalculate()
    const handleScroll = () => scheduleRecalculate()

    document.addEventListener('selectionchange', handleSelectionChange)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [enabled, recalculate])

  const clear = useCallback(() => {
    setRect(null)
  }, [])

  return { rect, recalculate, clear }
}

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
	padding: string
	border: string
	boxSizing: string
	tabSize: string
	wordSpacing: string
}

function getMirrorStyles(textarea: HTMLTextAreaElement): MirrorStyles {
	const computed = window.getComputedStyle(textarea)

	return {
		font: computed.font,
		lineHeight: computed.lineHeight,
		letterSpacing: computed.letterSpacing,
		textTransform: computed.textTransform,
		textIndent: computed.textIndent,
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word',
		overflowWrap: 'break-word',
		padding: computed.padding,
		border: computed.border,
		boxSizing: computed.boxSizing,
		tabSize: computed.tabSize,
		wordSpacing: computed.wordSpacing
	}
}

/**
 * Рассчитывает bounding rect выделения в textarea через скрытый mirror.
 * Нативный Selection API не предоставляет координаты текста textarea.
 */
export function measureTextareaSelection(
	textarea: HTMLTextAreaElement
): SelectionAnchorRect | null {
	const { selectionStart, selectionEnd, value } = textarea
	if (selectionEnd <= selectionStart) return null

	const styles = getMirrorStyles(textarea)
	const mirror = document.createElement('div')
	const selected = document.createElement('span')

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
		font: styles.font,
		lineHeight: styles.lineHeight,
		letterSpacing: styles.letterSpacing,
		textTransform: styles.textTransform,
		textIndent: styles.textIndent,
		whiteSpace: styles.whiteSpace,
		wordBreak: styles.wordBreak,
		overflowWrap: styles.overflowWrap,
		padding: styles.padding,
		border: styles.border,
		boxSizing: styles.boxSizing,
		tabSize: styles.tabSize,
		wordSpacing: styles.wordSpacing
	})

	const before = value.slice(0, selectionStart).replace(/\n$/u, '\n\u200b')
	const selection = value.slice(selectionStart, selectionEnd)
	const after = value.slice(selectionEnd) || '\u200b'

	mirror.append(document.createTextNode(before))
	selected.textContent = selection
	mirror.append(selected)
	mirror.append(document.createTextNode(after))
	
	document.body.appendChild(mirror)

	try {
		const mirrorRect = mirror.getBoundingClientRect()
		const selectionRect = selected.getBoundingClientRect()
		const textareaRect = textarea.getBoundingClientRect()

		return {
			x:
				textareaRect.left +
				(selectionRect.left - mirrorRect.left) -
				textarea.scrollLeft,
			y:
				textareaRect.top +
				(selectionRect.top - mirrorRect.top) -
				textarea.scrollTop,
			width: Math.max(selectionRect.width, 1),
			height: Math.max(
				selectionRect.height,
				parseFloat(styles.lineHeight) || 20
			)
		}
	} finally {
		mirror.remove()
	}
}

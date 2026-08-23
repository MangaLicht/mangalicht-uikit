import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ScrollArea } from '../ScrollArea'

function installObservers() {
	class ResizeObserverMock {
		observe() {}
		disconnect() {}
		unobserve() {}
	}
	class MutationObserverMock {
		observe() {}
		disconnect() {}
		disconnectAll() {}
	}
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	vi.stubGlobal('MutationObserver', MutationObserverMock)
}

describe('ScrollArea', () => {
	it('renders without creating an observer feedback loop', () => {
		installObservers()

		const { container } = render(
			<ScrollArea axis='vertical' visibleMode='default'>
				<div style={{ height: 1000 }}>content</div>
			</ScrollArea>
		)

		const root = container.firstElementChild as HTMLElement
		expect(root).toBeTruthy()
		expect(root.dataset.verticalOverflow).toBe('false')
	})

	it('keeps scroll handling local to the scroll container', () => {
		installObservers()
		const onScroll = vi.fn()

		const { container } = render(
			<ScrollArea onScroll={onScroll}>
				<div>content</div>
			</ScrollArea>
		)

		const root = container.firstElementChild as HTMLElement
		fireEvent.scroll(root)
		expect(onScroll).toHaveBeenCalledTimes(1)
	})
})

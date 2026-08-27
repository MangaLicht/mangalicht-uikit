import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHistoryBuffer } from '../useHistoryBuffer'

describe('useHistoryBuffer', () => {
	it('groups characters into a single undo boundary on delimiter', () => {
		const { result } = renderHook(() =>
			useHistoryBuffer({ defaultValue: '', maxSize: 20 })
		)

		act(() => {
			result.current.setValue('h')
			result.current.setValue('he')
			result.current.setValue('hel')
			result.current.setValue('hello')
		})

		expect(result.current.value).toBe('hello')
		expect(result.current.canUndo).toBe(false)

		act(() => {
			result.current.setValue('hello ')
		})

		expect(result.current.canUndo).toBe(true)

		act(() => {
			result.current.undo()
		})

		expect(result.current.value).toBe('')
		expect(result.current.canRedo).toBe(true)
	})

	it('undoes pending word before committed history', () => {
		const { result } = renderHook(() =>
			useHistoryBuffer({ defaultValue: 'hello ' })
		)

		act(() => {
			result.current.setValue('hello world')
		})

		expect(result.current.canUndo).toBe(false)

		act(() => {
			result.current.undo()
		})

		expect(result.current.value).toBe('hello ')
	})

	it('invalidates redo after a new edit', () => {
		const { result } = renderHook(() =>
			useHistoryBuffer({ defaultValue: '' })
		)

		act(() => {
			result.current.setValue('one ')
			result.current.setValue('one two ')
			result.current.undo()
		})

		expect(result.current.canRedo).toBe(true)

		act(() => {
			result.current.setValue('one three ')
		})

		expect(result.current.canRedo).toBe(false)
	})
})

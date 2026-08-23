import { useCallback, useEffect, useState } from 'react'

export type ValidateOn = 'change' | 'blur' | 'submit'

export type ValidationRuleWithMessage<T> =
	| T
	| { value: T; message: string }

export interface ValidationRules {
	required?: boolean | string
	minLength?: ValidationRuleWithMessage<number>
	maxLength?: ValidationRuleWithMessage<number>
	pattern?: ValidationRuleWithMessage<RegExp>
	validate?: (value: string) => string | null | undefined | false
}

export interface UseValidationOptions {
	rules?: ValidationRules
	validateOn?: ValidateOn
	onValidChange?: (isValid: boolean, error: string | null) => void
}

function normalizeRule<T>(
	rule: ValidationRuleWithMessage<T>
): { value: T; message?: string } {
	if (rule !== null && typeof rule === 'object' && 'value' in rule) {
		return rule as { value: T; message?: string }
	}

	return { value: rule as T }
}

function runRules(value: string, rules?: ValidationRules): string | null {
	if (!rules) return null

	if (rules.required && value.trim().length === 0) {
		return typeof rules.required === 'string'
			? rules.required
			: 'Поле обязательно для заполнения'
	}

	if (rules.minLength !== undefined && value.length > 0) {
		const { value: min, message } = normalizeRule(rules.minLength)
		if (value.length < min) return message ?? `Минимум ${min} симв.`
	}

	if (rules.maxLength !== undefined) {
		const { value: max, message } = normalizeRule(rules.maxLength)
		if (value.length > max) return message ?? `Максимум ${max} симв.`
	}

	if (rules.pattern !== undefined && value.length > 0) {
		const { value: regex, message } = normalizeRule(rules.pattern)
		regex.lastIndex = 0
		const matches = regex.test(value)
		regex.lastIndex = 0
		if (!matches) return message ?? 'Неверный формат'
	}

	if (rules.validate) {
		const result = rules.validate(value)
		if (result) return result
	}

	return null
}

export function useValidation(
	value: string,
	options: UseValidationOptions = {}
) {
	const { rules, validateOn = 'blur', onValidChange } = options
	const [error, setError] = useState<string | null>(null)
	const [touched, setTouched] = useState(false)

	const validate = useCallback(
		(val: string = value) => {
			const result = runRules(val, rules)
			setError(result)
			onValidChange?.(result === null, result)
			return result
		},
		[value, rules, onValidChange]
	)

	useEffect(() => {
		if (!touched || validateOn !== 'change') return

		const result = runRules(value, rules)
		setError(result)
		onValidChange?.(result === null, result)
	}, [value, touched, validateOn, rules, onValidChange])

	const handleBlur = useCallback(() => {
		setTouched(true)
		if (validateOn !== 'submit') validate(value)
	}, [validate, value, validateOn])

	const reset = useCallback(() => {
		setError(null)
		setTouched(false)
	}, [])

	return {
		error,
		isValid: error === null,
		touched,
		validate,
		handleBlur,
		setTouched,
		reset
	}
}

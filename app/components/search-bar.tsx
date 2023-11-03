import { Form, useSearchParams, useSubmit } from '@remix-run/react'
import { useId } from 'react'
import { useDebounce } from '#app/utils/misc.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'

export function SearchBar({
	status,
	autoFocus = false,
	autoSubmit = false,
}: {
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocus?: boolean
	autoSubmit?: boolean
}) {
	const id = useId()
	const [searchParams] = useSearchParams()
	const submit = useSubmit()
	// TODO: use the pending state to show a spinner
	// const isSubmitting = useIsPending({
	// 	formMethod: 'GET',
	// 	formAction: '/topic',
	// })

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	return (
		<Form
			method="GET"
			action="/topic"
			className="flex flex-wrap items-center justify-center gap-2"
			onChange={e => autoSubmit && handleFormChange(e.currentTarget)}
		>
			<div className="flex-1">
				<Label htmlFor={id} className="sr-only">
					Search
				</Label>
				<Input
					type="search"
					name="search"
					id={id}
					defaultValue={searchParams.get('search') ?? ''}
					placeholder="Search"
					className="w-full"
					autoFocus={autoFocus}
				/>
			</div>
		</Form>
	)
}

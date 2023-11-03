import { type DataFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { logout, requireUserId } from '#app/utils/auth.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUserId(request)
	if (user) {
		await logout({ request })
		// TODO: the toast doesn't show up on the page after redirecting
		// logout already redirects to the homepage, so this is redundant
		return redirectWithToast('/', {
			title: 'Logged Out',
			description: `You've been logged out`,
		})
	}
}

export async function action({ request }: DataFunctionArgs) {
	return logout({ request })
}

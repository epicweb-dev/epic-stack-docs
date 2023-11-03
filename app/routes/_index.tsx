import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getMdxPage, useMdxComponent } from '#app/utils/mdx.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = {}
	const page = await getMdxPage(
		{ contentDir: 'docs', slug: 'landing' },
		{ request, timings },
	)
	if (!page) {
		throw json({ status: 404, message: 'Not Found' })
	}
	return json(page)
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const { code } = data
	const Component = useMdxComponent(code)
	return (
		<div className="container pt-3">
			<div className="max-w-4xl">
				<div className="prose sm:prose-lg xl:prose-2xl prose-light dark:prose-dark">
					<Component />
				</div>
			</div>
		</div>
	)
}

import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getMdxPage, useMdxComponent } from '#app/utils/mdx.tsx'

export async function loader({ request, params }: LoaderFunctionArgs) {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}
	const timings = {}
	const page = await getMdxPage(
		{ contentDir: 'docs', slug: params.slug },
		{ request, timings },
	)
	if (!page) {
		throw json({ status: 404, message: 'Not Found' })
	}
	return json(page)
}

export default function TopicPage() {
	const data = useLoaderData<typeof loader>()
	const { code, frontmatter } = data
	const Component = useMdxComponent(code)

	return (
		<div className="container pt-3">
			<h1 className="pb-5 text-6xl font-bold">{frontmatter.title}</h1>
			<div className="prose prose-light dark:prose-dark break-words">
				<Component />
			</div>
		</div>
	)
}

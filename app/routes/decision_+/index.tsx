import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { downloadDirList } from '#app/utils/github.server.ts'
import { getMdxPage, useMdxComponent } from '#app/utils/mdx.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = {}
	const decisions = (await downloadDirList('content/decisions')).map(
		d => d.name,
	)
	const page = await getMdxPage(
		{ contentDir: 'decisions', slug: 'README' },
		{ request, timings },
	)
	if (!page) {
		throw json({ status: 404, message: 'Not Found' })
	}
	return json({ page, decisions })
}
export default function DecisionIndex() {
	const { page, decisions } = useLoaderData<typeof loader>()
	const { code, frontmatter } = page
	const Component = useMdxComponent(code)

	return (
		<div className="container pt-3">
			<h2 className="pb-2 text-xl font-bold md:text-3xl xl:text-5xl">
				{frontmatter.title}
			</h2>
			<div className="max-w-4xl">
				<div className="prose sm:prose-lg xl:prose-2xl prose-light dark:prose-dark">
					<Component />
				</div>
			</div>
			{decisions.map(d => (
				<Link
					key={d}
					className="mt-4 block text-sm text-gray-500 dark:text-gray-400"
					to={`${d}`}
				>
					{d}
				</Link>
			))}
		</div>
	)
}

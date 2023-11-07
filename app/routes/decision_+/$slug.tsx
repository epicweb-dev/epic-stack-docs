import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	type Frontmatter,
	getMdxPage,
	useMdxComponent,
} from '#app/utils/mdx.tsx'

export type DecisionFrontmatter = Frontmatter<{
	status: string
	decisionNumber: number
}>

export async function loader({ request, params }: LoaderFunctionArgs) {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}
	const timings = {}
	const page = await getMdxPage<Frontmatter<DecisionFrontmatter>>(
		{ contentDir: 'decisions', slug: params.slug },
		{ request, timings },
	)
	if (!page) {
		throw json({ status: 404, message: 'Not Found' })
	}
	return json(page)
}

const SupersededBy = ({ status }: { status: string }) => {
	const superSededslug = status.split(',')[1].trim()
	return (
		<div className="my-1 w-full rounded-sm bg-red-300 p-5">
			<p className="text-center text-red-900">
				This decision has been superseded by{' '}
				<Link className="underline" to={`/decision/${superSededslug}`}>
					{superSededslug}
				</Link>
			</p>
		</div>
	)
}

export default function DecisionPage() {
	const data = useLoaderData<typeof loader>()
	const { code, frontmatter, slug } = data
	const superSededslug = frontmatter.status?.split(',')[1]?.trim()
	const Component = useMdxComponent(code)

	return (
		<div className="container relative pt-3">
			{frontmatter.status.startsWith('superseded') && (
				<SupersededBy status={frontmatter.status} />
			)}
			<h2 className="pb-2 text-xl font-bold md:text-3xl xl:text-5xl">
				{frontmatter.title}
			</h2>
			<h3 className="pb-5 text-sm font-thin md:text-xl xl:text-2xl">
				{frontmatter.description}
			</h3>

			<h4>
				status:{' '}
				{frontmatter.status.startsWith('superseded') ? (
					<Link className="underline" to={`/decision/${superSededslug}`}>
						{frontmatter.status}
					</Link>
				) : (
					frontmatter.status
				)}
			</h4>
			<div className="max-w-4xl">
				<div className="prose sm:prose-lg xl:prose-2xl dark:prose-invert relative">
					<Component />
					<a
						target="_blank"
						className="text-sm text-gray-500 dark:text-gray-400"
						href={`https://github.com/epicweb-dev/epic-stack-docs/tree/main/content/docs/${slug}`}
						rel="noreferrer"
					>
						<p className="absolute -bottom-9 right-0">
							Edit this page on <Icon name="github-logo" />
						</p>
					</a>
				</div>
			</div>
		</div>
	)
}

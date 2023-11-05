import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	type Frontmatter,
	getMdxPage,
	useMdxComponent,
} from '#app/utils/mdx.tsx'

export async function loader({ request, params }: LoaderFunctionArgs) {
	if (!params.slug) {
		throw new Error('params.slug is not defined')
	}
	const timings = {}
	const page = await getMdxPage<Frontmatter<{ status: string }>>(
		{ contentDir: 'decisions', slug: params.slug },
		{ request, timings },
	)
	if (!page) {
		throw json({ status: 404, message: 'Not Found' })
	}
	return json(page)
}

export default function DecisionPage() {
	const data = useLoaderData<typeof loader>()
	const [supersededSlug, setSupersededSlug] = useState<string | null>()
	const { code, frontmatter, slug } = data
	const Component = useMdxComponent(code)
	useEffect(() => {
		if ((frontmatter.status as string).includes('superseded')) {
			setSupersededSlug((frontmatter.status as string).split(',')[1].trim())
		}
	}, [frontmatter.status])

	return (
		<div className="container pt-3">
			{supersededSlug && (
				<div className="absolute left-0 right-0 top-0 h-[5rem] bg-red-300">
					<p className="text-center text-red-900">
						This decision has been superseded by{' '}
						<Link to={`/decisions/${supersededSlug}`}>{supersededSlug}</Link>
					</p>
				</div>
			)}
			<h2 className="pb-2 text-xl font-bold md:text-3xl xl:text-5xl">
				{frontmatter.title}
			</h2>
			<h3 className="pb-5 text-sm font-thin md:text-xl xl:text-2xl">
				{frontmatter.description}
			</h3>
			{/* TODO: add status to type definition */}

			<h4>
				status:
				{supersededSlug ? (
					<>
						<Link to={`/decisions/${supersededSlug}`}>
							Superseded by: {supersededSlug}
						</Link>
					</>
				) : (
					// @ts-ignore
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

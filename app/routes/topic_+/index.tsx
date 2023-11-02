import { type DataFunctionArgs, redirect, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { ErrorList } from '#app/components/forms.tsx'
import { SearchBar } from '#app/components/search-bar.tsx'
import { getMdxPage } from '#app/utils/mdx.tsx'
import { useDelayedIsPending, cn } from '#app/utils/misc.tsx'
import { findDocsMatch } from '#app/utils/search.server.ts'

const TopicSearchResultSchema = z.object({
	slug: z.string(),
	frontmatter: z.object({
		title: z.string(),
		description: z.string(),
		categories: z.array(z.string()),
	}),
})

export async function loader({ request }: DataFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get('search')
	if (searchTerm === '' || !searchTerm) {
		return redirect('/topic')
	}

	const matchingDocs = await findDocsMatch(searchTerm)
	const pages = await Promise.all(
		matchingDocs.map(async doc => {
			const slug = doc.path.split('/').at(2)
			if (!slug) throw new Error('slug is undefined')
			const page = await getMdxPage(
				{ contentDir: 'docs', slug },
				{ request, timings: {} },
			)
			const result = TopicSearchResultSchema.safeParse(page)
			if (!result.success) {
				throw new Error(result.error.message)
			}
			return result.data
		}),
	)
	return json({ status: 'idle', matches: pages } as const)
}

export default function TopicIndex() {
	const data = useLoaderData<typeof loader>()
	const isPending = useDelayedIsPending({
		formMethod: 'GET',
		formAction: '/topic',
	})

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center gap-6">
			<h1 className="text-h1">Epic Notes Docs</h1>
			<div className="w-full max-w-[700px] ">
				<SearchBar status={data.status} autoFocus autoSubmit />
			</div>
			<main>
				{data.status === 'idle' ? (
					data.matches.length ? (
						<ul
							className={cn('flex w-full flex-col gap-4 delay-200', {
								'opacity-50': isPending,
							})}
						>
							{data.matches.map(doc => (
								<li key={doc.slug} className="w-full">
									<Link
										to={doc.slug}
										className="flex w-full flex-col rounded-lg bg-muted px-5 py-3"
									>
										<span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-body-md">
											{doc.frontmatter.title}
										</span>
										<span className="w-full overflow-hidden text-ellipsis text-body-sm text-muted-foreground">
											{doc.frontmatter.description}
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p>No docs found</p>
					)
				) : data.status === 'error' ? (
					<ErrorList errors={['There was an error parsing the results']} />
				) : null}
			</main>
		</div>
	)
}

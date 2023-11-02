import { LRUCache } from 'lru-cache'
import * as mdxBundler from 'mdx-bundler/client/index.js'
import * as React from 'react'
import { cachified, cache } from '#app/utils/cache.server.ts'
import { downloadMdxFileOrDirectory } from '#app/utils/github.server.ts'
import { type GitHubFile, compileMdx } from './compile-mdx.server.ts'
import { AnchorOrLink } from './misc.tsx'
import { type Timings } from './timing.server.ts'

export type MdxPage = {
	code: string
	slug: string
	editLink: string
	// readTime?: ReturnType<typeof calculateReadingTime>
	dateDisplay?: string

	/**
	 * It's annoying that all these are set to optional I know, but there's
	 * no great way to ensure that the MDX files have these properties,
	 * especially when a common use case will be to edit them without running
	 * the app or build. So we're going to force you to handle situations when
	 * these values are missing to avoid runtime errors.
	 */
	frontmatter: {
		archived: boolean
		draft: boolean
		unlisted: boolean
		title: string
		description: string
		meta: {
			keywords?: Array<string>
			[key: string]: string | Array<string> | undefined
		}

		// Post meta
		categories?: Array<string>
		date?: string
		bannerBlurDataUrl?: string
		bannerCloudinaryId?: string
		bannerCredit?: string
		bannerAlt?: string
		bannerTitle?: string
		socialImageTitle?: string
		socialImagePreTitle?: string
		translations?: Array<{
			language: string
			link: string
			author?: {
				name: string
				link?: string
			}
		}>
	}
}

type CachifiedOptions = {
	forceFresh?: boolean
	request?: Request
	ttl?: number
	timings?: Timings
}

const checkCompiledValue = (value: unknown) =>
	typeof value === 'object' &&
	(value === null || ('code' in value && 'frontmatter' in value))

const defaultTTL = 1000 * 60 * 60 * 24 * 14
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 365 * 100

export async function getMdxPage(
	{
		contentDir,
		slug,
	}: {
		contentDir: string
		slug: string
	},
	options: CachifiedOptions,
): Promise<MdxPage | null> {
	const { forceFresh, ttl = defaultTTL, timings } = options
	const key = `mdx-page:${contentDir}:${slug}:compiled`
	const page = await cachified({
		key,
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		getFreshValue: async () => {
			const pageFiles = await downloadMdxFilesCached(contentDir, slug, options)
			const compiledPage = await compileMdxCached({
				contentDir,
				slug,
				...pageFiles,
				options,
			}).catch((err: any) => {
				console.error(`Failed to get a fresh value for mdx:`, {
					contentDir,
					slug,
				})
				return Promise.reject(err)
			})
			return compiledPage
		},
	})
	if (!page) {
		// if there's no page, let's remove it from the cache
		void cache.delete(key)
	}
	return page
}

async function compileMdxCached({
	contentDir,
	slug,
	entry,
	files,
	options,
}: {
	contentDir: string
	slug: string
	entry: string
	files: Array<GitHubFile>
	options: CachifiedOptions
}) {
	const key = `${contentDir}:${slug}:compiled`
	const page = await cachified({
		cache,
		ttl: defaultTTL,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		...options,
		key,
		checkValue: checkCompiledValue,
		getFreshValue: async () => {
			const compiledPage = await compileMdx<MdxPage['frontmatter']>(slug, files)
			if (compiledPage) {
				//TODO: maybe need to uncomment this, but it's not working right now
				// if (
				// 	compiledPage.frontmatter.bannerCloudinaryId &&
				// 	!compiledPage.frontmatter.bannerBlurDataUrl
				// ) {
				// 	try {
				// 		compiledPage.frontmatter.bannerBlurDataUrl = await getBlurDataUrl(
				// 			compiledPage.frontmatter.bannerCloudinaryId,
				// 		)
				// 	} catch (error: unknown) {
				// 		console.error(
				// 			'oh no, there was an error getting the blur image data url',
				// 			error,
				// 		)
				// 	}
				// }
				// if (compiledPage.frontmatter.bannerCredit) {
				// 	const credit = await markdownToHtmlUnwrapped(
				// 		compiledPage.frontmatter.bannerCredit,
				// 	)
				// 	compiledPage.frontmatter.bannerCredit = credit
				// 	const noHtml = await stripHtml(credit)
				// 	if (!compiledPage.frontmatter.bannerAlt) {
				// 		compiledPage.frontmatter.bannerAlt = noHtml
				// 			.replace(/(photo|image)/i, '')
				// 			.trim()
				// 	}
				// 	if (!compiledPage.frontmatter.bannerTitle) {
				// 		compiledPage.frontmatter.bannerTitle = noHtml
				// 	}
				// }
				return {
					dateDisplay: compiledPage.frontmatter.date
						? compiledPage.frontmatter.date
						: undefined,
					...compiledPage,
					slug,
					editLink: `https://github.com/epicweb-dev/epic-stack-docs/edit/main/${contentDir}/${slug}/${entry}`,
				}
			} else {
				return null
			}
		},
	})
	// if there's no page, remove it from the cache
	if (!page) {
		void cache.delete(key)
	}
	return page
}

const mdxComponents = {
	a: AnchorOrLink,
	// Themed,
	// CloudinaryVideo,
	// ThemedBlogImage,
	// BlogImage,
	// SubscribeForm,
	// OptionalUser,
}

export async function downloadMdxFilesCached(
	contentDir: string,
	slug: string,
	options: CachifiedOptions,
) {
	// #TODO: request is in here and it was passed to cachified, not anymore though. Investigate.
	const { forceFresh, ttl = defaultTTL, timings } = options
	const key = `${contentDir}:${slug}:downloaded`
	const downloaded = await cachified({
		cache,
		// request,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		key,
		checkValue: (value: unknown) => {
			if (typeof value !== 'object') {
				return `value is not an object`
			}
			if (value === null) {
				return `value is null`
			}

			const download = value as Record<string, unknown>
			if (!Array.isArray(download.files)) {
				return `value.files is not an array`
			}
			if (typeof download.entry !== 'string') {
				return `value.entry is not a string`
			}

			return true
		},
		getFreshValue: async () =>
			downloadMdxFileOrDirectory(`${contentDir}/${slug}`),
	})
	// if there aren't any files, remove it from the cache
	if (!downloaded.files.length) {
		void cache.delete(key)
	}
	return downloaded
}
// This exists so we don't have to call new Function for the given code
// for every request for a given blog post/mdx file.
const mdxComponentCache = new LRUCache<
	string,
	ReturnType<typeof getMdxComponent>
>({
	max: 1000,
})

export function useMdxComponent(code: string) {
	return React.useMemo(() => {
		if (mdxComponentCache.has(code)) {
			return mdxComponentCache.get(code)!
		}
		const component = getMdxComponent(code)
		mdxComponentCache.set(code, component)
		return component
	}, [code])
}

/**
 * This should be rendered within a useMemo
 * @param code the code to get the component from
 * @returns the component
 */
function getMdxComponent(code: string) {
	const Component = mdxBundler.getMDXComponent(code)
	function EpicMdxComponent({
		components,
		...rest
	}: Parameters<typeof Component>['0']) {
		return (
			// @ts-expect-error the types are wrong here
			<Component components={{ ...mdxComponents, ...components }} {...rest} />
		)
	}
	return EpicMdxComponent
}

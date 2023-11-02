import { type GitHubFile } from './compile-mdx.server.ts'
import { downloadDirList } from './github.server.ts'
import { downloadMdxFilesCached } from './mdx.tsx'

export const findDocsMatch = async (
	searchTerm: string,
): Promise<GitHubFile[]> => {
	const directories = await downloadDirList('content/docs')
	const filesPromises = directories.map(async directory => {
		const slug = directory.path.split('/').at(-1)
		if (!slug) return null
		return await downloadMdxFilesCached('docs', slug, {})
	})

	// Wait for all promises to resolve
	const files = await Promise.all(filesPromises)

	// Filter out directories that are null and then files that don't include the search term
	const matchedFiles = files.flatMap(
		dir =>
			dir?.files.filter(f =>
				f.content.toLowerCase().includes(searchTerm.toLowerCase()),
			) || [],
	)

	console.log('===results===', matchedFiles.length)
	return matchedFiles // Return the flat array of matched GitHubFile objects
}

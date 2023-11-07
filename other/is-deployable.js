// try to keep this dep-free so we don't have to install deps
import { getChangedFiles, fetchJson } from './get-changed-files.js'
const [currentCommitSha] = process.argv.slice(2)

const baseUrl =
	process.env.GITHUB_REF_NAME === 'dev'
		? 'https://epic-stack-docs-staging.fly.dev/'
		: 'https://epic-stack-docs.fly.dev'

async function go() {
	const buildInfo = await fetchJson(`${baseUrl}/build/info.json`, {
		timoutTime: 10_000,
	})
	const compareCommitSha = buildInfo.commit.sha
	const changedFiles = await getChangedFiles(currentCommitSha, compareCommitSha)
	console.error('Determining whether the changed files are deployable', {
		currentCommitSha,
		compareCommitSha,
		changedFiles,
	})
	// deploy if:
	// - there was an error getting the changed files (null)
	// - there are no changed files
	// - there are changed files, but at least one of them is non-content
	const isDeployable =
		changedFiles === null ||
		changedFiles.length === 0 ||
		changedFiles.some(({ filename }) => !filename.startsWith('content'))

	console.error(
		isDeployable
			? '🟢 There are deployable changes'
			: '🔴 No deployable changes',
		{ isDeployable },
	)
	console.log(isDeployable)
}

go().catch(e => {
	console.error(e)
	console.log('true')
})

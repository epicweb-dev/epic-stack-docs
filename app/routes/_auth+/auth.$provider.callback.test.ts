import { faker } from '@faker-js/faker'
import { http } from 'msw'
import { afterEach, expect, test } from 'vitest'
import { sessionKey } from '#app/utils/auth.server.ts'
import { connectionSessionStorage } from '#app/utils/connections.server.ts'
import { invariant } from '#app/utils/misc.tsx'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { deleteGitHubUsers } from '#tests/mocks/github.ts'
import { server } from '#tests/mocks/index.ts'
import { consoleError } from '#tests/setup/setup-test-env.ts'
import { BASE_URL, convertSetCookieToCookie } from '#tests/utils.ts'
import { loader } from './auth.$provider.callback.ts'

const ROUTE_PATH = '/auth/github/callback'
const PARAMS = { provider: 'github' }

afterEach(async () => {
	await deleteGitHubUsers()
})

test('when auth fails, send the user to login with a toast', async () => {
	consoleError.mockImplementation(() => {})
	server.use(
		http.post('https://github.com/login/oauth/access_token', async () => {
			return new Response('error', { status: 400 })
		}),
	)
	const request = await setupRequest()
	const response = await loader({ request, params: PARAMS, context: {} }).catch(
		e => e,
	)
	invariant(response instanceof Response, 'response should be a Response')
	expect(response).toHaveRedirect('/login')
	await expect(response).toSendToast(
		expect.objectContaining({
			title: 'Auth Failed',
			type: 'error',
		}),
	)
	expect(consoleError).toHaveBeenCalledTimes(1)
})

async function setupRequest({
	sessionId,
	code = faker.string.uuid(),
}: { sessionId?: string; code?: string } = {}) {
	const url = new URL(ROUTE_PATH, BASE_URL)
	const state = faker.string.uuid()
	url.searchParams.set('state', state)
	url.searchParams.set('code', code)
	const connectionSession = await connectionSessionStorage.getSession()
	connectionSession.set('oauth2:state', state)
	const authSession = await authSessionStorage.getSession()
	if (sessionId) authSession.set(sessionKey, sessionId)
	const setSessionCookieHeader =
		await authSessionStorage.commitSession(authSession)
	const setConnectionSessionCookieHeader =
		await connectionSessionStorage.commitSession(connectionSession)
	const request = new Request(url.toString(), {
		method: 'GET',
		headers: {
			cookie: [
				convertSetCookieToCookie(setConnectionSessionCookieHeader),
				convertSetCookieToCookie(setSessionCookieHeader),
			].join('; '),
		},
	})
	return request
}

// async function setupUser(userData = createUser()) {
// 	const session = await prisma.session.create({
// 		data: {
// 			expirationDate: getSessionExpirationDate(),
// 			user: {
// 				create: {
// 					...userData,
// 				},
// 			},
// 		},
// 		select: {
// 			id: true,
// 			userId: true,
// 		},
// 	})

// 	return session
// }

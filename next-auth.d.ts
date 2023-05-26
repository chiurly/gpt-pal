import 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			_id: string,
		} & DefaultSession['user'],
	}
}

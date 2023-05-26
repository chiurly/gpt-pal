import mongoConnectionPromise from '@/lib/mongodb'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialProvider({
			id: 'credentials',
			name: 'Credentials',
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, request) {
				if (!credentials || !credentials.email || !credentials.password) {
					throw new Error('Invalid credentials')
				}

				try {
					await mongoConnectionPromise
					const user = await User.findOne({ email: credentials.email }).select('+password')
					const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

					if (!user || !isPasswordValid) {
						throw new Error('Invalid credentials')
					}

					return user
				} catch (error) {
					console.error(error)
					throw error
				}
			},
		}),
	],
	pages: {
		signIn: '/sign-in',
	},
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.user = user
			}
			return token
		},
		session: async ({ session, token }) => {
			session.user = token.user as DefaultSession['user']
			return session
		},
	},
}

export default NextAuth(authOptions)

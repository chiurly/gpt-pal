import Topnav from '@/components/topnav'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { Dispatch, SetStateAction, createContext, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const OpenaiContext = createContext({} as { openaiKey: string, setOpenaiKey: Dispatch<SetStateAction<string>> })

export default function App({ Component, pageProps }: AppProps) {
	const [openaiKey, setOpenaiKey] = useState('')

	return (
		<SessionProvider session={pageProps.session}>
			<OpenaiContext.Provider value={{ openaiKey, setOpenaiKey }}>
				<main className={inter.className}>
					<Topnav />
					<Component {...pageProps} />
				</main>
			</OpenaiContext.Provider>
		</SessionProvider>
	)
}

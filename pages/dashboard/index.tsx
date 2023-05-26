import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/dashboard.module.css'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useContext } from 'react'

export default function Dashboard() {
	const { openaiKey, setOpenaiKey } = useContext(OpenaiContext)
	const router = useRouter()

	useSession({
		required: true,
		onUnauthenticated: () => router.push('/sign-in'),
	})

	return (
		<>
			<Head>
				<title>Dashboard</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section className={styles.section}>
				<h1>Dashboard</h1>
				<p>Please enter your <a className="link" href="https://platform.openai.com/account/api-keys" target="_blank">OpenAI API key</a><a href=""></a>. We do <b>not</b> store it.</p>
				<div className="input-parent">
					<label htmlFor="openai-key">OpenAI API key</label>
					<input
						id="openai-key"
						type="text"
						value={openaiKey}
						onChange={event => setOpenaiKey(event.target.value)}
					/>
				</div>
			</section>
		</>
	)
}
import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/fine-tune.module.css'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'

export default function FineTunes() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()

	const { status } = useSession({
		required: true,
		onUnauthenticated: () => router.push('/sign-in'),
	})

	const { data: fineTunes, isLoading: isLoadingFineTunes } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/fine-tune`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handleFineTuneClick = (fineTune: any) => {
		router.push(`/fine-tune/${fineTune.id}`)
	}

	return (
		<>
			<Head>
				<title>Fine-tunes</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<div className={styles['flex-row-space-between']}>
					<h1 className={styles.h1}>My fine-tunes</h1>
					<Link className="button" href={'/fine-tune/create'}>New fine-tune</Link>
				</div>
				<p>Click a fine-tune to open it.</p>
				{
					fineTunes && fineTunes.length &&
					<div className="list">
						<div className="list-header">
							<div className="list-cell">ID</div>
							<div className="list-cell">Fine tuned model</div>
							<div className="list-cell">Created at</div>
							<div className="list-cell">Status</div>
						</div>
						<div className="list-rows">
							{fineTunes
								.sort((a: any, b: any) => b.created_at - a.created_at)
								.map((fineTune: any) =>
									<div key={fineTune.id} className="list-row-clickable" onClick={() => handleFineTuneClick(fineTune)}>
										<div className="list-cell">{fineTune.id}</div>
										<div className="list-cell">{fineTune.fine_tuned_model || 'Loading...'}</div>
										<div className="list-cell">{new Date(fineTune.created_at * 1000).toLocaleString()}</div>
										<div className="list-cell">{fineTune.status}</div>
									</div>
								)
							}
						</div>
					</div>
					|| (status == 'loading' || isLoadingFineTunes) &&
					<p>Loading...</p>
					||
					<p>No fine-tunes. Make sure the Dashboard contains a valid OpenAI API key.</p>
				}
			</section >
		</>
	)
}

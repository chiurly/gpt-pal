import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/fine-tune.module.css'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'

export default function FineTune() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()
	const fineTuneId = router.query.id as string

	useSession({
		required: true,
		onUnauthenticated: () => router.push('/sign-in'),
	})

	const { data: fineTune } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/fine-tune/${fineTuneId}`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handleDelete = async () => {
		try {
			await axios.delete(
				`${process.env.NEXT_PUBLIC_BASE_URL}api/model/${fineTune.fine_tuned_model}`,
				{ headers: { 'OpenAI-Key': openaiKey } }
			)
			router.push('/fine-tune')
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<Head>
				<title> {fineTune && fineTune.fine_tuned_model || 'Fine-tune'}</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<div className={styles['flex-row-start']}>
					<Link className="button-subtle" href={'/fine-tune'}>Back</Link>
					<h1 className={styles.h1}>{fineTune && fineTune.fine_tuned_model || 'Loading...'}</h1>
				</div>

				<div className="list-parent">
					<h2>Training datasets</h2>
					{fineTune && fineTune.training_files.length &&
						<div className="list">
							<div className="list-header">
								<div className="list-cell">ID</div>
								<div className="list-cell">Filename</div>
								<div className="list-cell">Created at</div>
							</div>
							<div className="list-rows">
								{fineTune.training_files.map((dataset: any) =>
									<div key={dataset.id} className="list-row">
										<div className="list-cell">{dataset.id}</div>
										<div className="list-cell">{dataset.filename}</div>
										<div className="list-cell">{new Date(dataset.created_at * 1000).toLocaleString()}</div>
									</div>
								)}
							</div>
						</div>
					}
				</div>

				<div className="list-parent">
					<h2>Events</h2>
					{fineTune && fineTune.events.length &&
						<div className="list">
							<div className="list-header">
								<div className="list-cell">Message</div>
								<div className="list-cell">Created at</div>
							</div>
							<div className="list-rows">
								{fineTune.events
									.sort((a: any, b: any) => b.created_at - a.created_at)
									.map((event: any) =>
										<div key={crypto.randomUUID()} className="list-row">
											<div className="list-cell">{event.message}</div>
											<div className="list-cell">{new Date(event.created_at * 1000).toLocaleString()}</div>
										</div>
									)
								}
							</div>
						</div>
					}
				</div>

				<div className={styles['flex-row-end']}>
					<button onClick={handleDelete}>Delete</button>
				</div>
			</section>
		</>
	)
}

export function getServerSideProps() {
	return { props: {} } // So that router.query.* would be available on first render
}

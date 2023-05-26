import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/dataset.module.css'
import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'

export default function Dataset() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()
	const datasetId = router.query.id as string

	const { data: dataset } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/dataset/${datasetId}`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handleDelete = async () => {
		try {
			await axios.delete(
				`${process.env.NEXT_PUBLIC_BASE_URL}api/dataset/${datasetId}`,
				{ headers: { 'OpenAI-Key': openaiKey } }
			)
			router.push('/dataset')
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<Head>
				<title>Dataset</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<div className={styles['flex-row-start']}>
					<Link className="button-subtle" href={'/dataset'}>Back</Link>
					<h1 className={styles.h1}>{dataset && dataset.filename || 'Loading...'}</h1>
				</div>

				<div className="jsonl-parent">
					<h2>JSONL</h2>
					<p className="jsonl">{dataset && dataset.content || 'Loading...'}</p>
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

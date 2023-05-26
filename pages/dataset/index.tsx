import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/dataset.module.css'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'

export default function Datasets() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()

	useSession({
		required: true,
		onUnauthenticated: () => router.push('/sign-in'),
	})

	const { data: datasets, isLoading: isLoadingDatasets } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/dataset`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handleDatasetClick = (dataset: any) => {
		router.push(`/dataset/${dataset.id}`)
	}

	return (
		<>
			<Head>
				<title>Datasets</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<div className={styles['flex-row-space-between']}>
					<h1 className={styles.h1}>My datasets</h1>
					<Link className="button" href={'/dataset/create'}>New dataset</Link>
				</div>
				<p>Click a dataset to open it.</p>
				{
					datasets && datasets.length &&
					<div className="list">
						<div className="list-header">
							<div className="list-cell">ID</div>
							<div className="list-cell">Filename</div>
							<div className="list-cell">Created at</div>
						</div>
						<div className="list-rows">
							{datasets
								.filter((dataset: any) => dataset.purpose === 'fine-tune')
								.sort((a: any, b: any) => b.created_at - a.created_at)
								.map((dataset: any) =>
									<div key={dataset.id} className="list-row-clickable" onClick={() => handleDatasetClick(dataset)}>
										<div className="list-cell">{dataset.id}</div>
										<div className="list-cell">{dataset.filename}</div>
										<div className="list-cell">{new Date(dataset.created_at * 1000).toLocaleString()}</div>
									</div>
								)
							}
						</div>
					</div>
					||
					isLoadingDatasets &&
					<p>Loading...</p>
					||
					<p>No datasets. Make sure the Dashboard contains a valid OpenAI API key.</p>
				}
			</section >
		</>
	)
}

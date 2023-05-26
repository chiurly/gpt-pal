import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/fine-tune.module.css'
import axios, { AxiosError } from 'axios'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

export default function FineTuneCreate() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()
	const [submitError, setSubmitError] = useState('')
	const [name, setName] = useState('')
	const [selectedDatasetId, setSelectedDatasetId] = useState('')

	useSession({
		required: true,
		onUnauthenticated: () => router.push('/sign-in'),
	})

	const { data: datasets } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/dataset`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!selectedDatasetId) {
			return setSubmitError('Dataset not selected')
		}

		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_BASE_URL}api/fine-tune`,
				{ name, datasetId: selectedDatasetId },
				{ headers: { 'OpenAI-Key': openaiKey } }
			)
			router.push('/fine-tune')
		} catch (error) {
			if (error instanceof AxiosError) {
				setSubmitError(error.response?.data?.error)
			} else {
				setSubmitError('An error occurred')
			}
			console.error(error)
		}
	}

	return (
		<>
			<Head>
				<title>New fine-tune</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section className={styles['create-section']}>
				<div className={styles['flex-row-start']}>
					<Link className="button-subtle" href={'/fine-tune'}>Back</Link>
					<h1 className={styles.h1}>New fine-tune</h1>
				</div>

				<form onSubmit={handleSubmit}>
					{submitError && <p className="error">{submitError}</p>}

					<div className="input-parent" title="A string of up to 40 characters that will be added to your fine-tuned model name.">
						<label htmlFor="name">Name suffix</label>
						<input id="name" type="text" autoComplete="off" onChange={event => setName(event.target.value)} />
					</div>

					<div className="input-parent">
						<label htmlFor="dataset-select">Dataset</label>
						<select id="dataset-select" value={selectedDatasetId} onChange={event => setSelectedDatasetId(event.target.value)}>
							<option value="">Select a dataset</option>
							{datasets && datasets
								.filter((dataset: any) => dataset.purpose === 'fine-tune')
								.map((dataset: any) => (
									<option key={dataset.id} value={dataset.id}>
										{dataset.filename}
									</option>
								))
							}
						</select>
					</div>

					<div className={styles['flex-row-end']}>
						<button type="submit">Create</button>
					</div>
				</form>
			</section >
		</>
	)
}

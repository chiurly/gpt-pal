import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/dataset.module.css'
import axios from 'axios'
import { jsonl } from 'js-jsonl'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Papa from 'papaparse'
import { useContext, useEffect, useState } from 'react'

export default function DatasetCreate() {
	const { openaiKey } = useContext(OpenaiContext)
	const router = useRouter()
	const [filename, setFilename] = useState('')
	const [jsonlString, setJsonlString] = useState('')
	const [editedJsonlString, setEditedJsonlString] = useState('')

	const [isSeparatorChecked, setSeparatorChecked] = useState(false)
	const [separator, setSeparator] = useState('\\n\\n###\\n\\n')
	const [isWhitespaceChecked, setWhitespaceChecked] = useState(false)
	const [isStopChecked, setStopChecked] = useState(false)
	const [stop, setStop] = useState('###')

	useEffect(() => {
		editJsonl()
	}, [jsonlString, isSeparatorChecked, separator, isWhitespaceChecked, isStopChecked, stop])

	function handleFileChange(event: any) {
		const file = event.target.files[0]
		if (!file) return
		setFilename(file.name)

		Papa.parse(file, {
			header: true, complete: result => {
				setJsonlString(jsonl.stringify(result.data))
			}
		})
	}

	function editJsonl() {
		const uneditedJsonl = jsonl.parse(jsonlString)
		const editedJsonl = [] as any

		if (!isSeparatorChecked && !isWhitespaceChecked && !isStopChecked) {
			uneditedJsonl.forEach((line: any) => {
				const values = Object.values(line)
				let prompt = values[0]
				let completion = values[1]
				editedJsonl.push({ prompt, completion })
			})
			setEditedJsonlString(jsonl.stringify(editedJsonl))
			return
		}

		uneditedJsonl.forEach((line: any) => {
			const values = Object.values(line)
			let prompt = values[0]
			let completion = values[1]

			if (isSeparatorChecked) {
				prompt += separator.replace(/\\n/g, '\n')
			}
			if (isWhitespaceChecked) {
				completion = ' ' + completion
			}
			if (isStopChecked) {
				completion += stop.replace(/\\n/g, '\n')
			}

			editedJsonl.push({ prompt, completion })
		})

		// Weird way to ensure that \n is actualy displayed as \n instead of appearing as a new line
		const finalJsonPreview = jsonl.stringify(jsonl.parse(jsonl.stringify(editedJsonl)))
		setEditedJsonlString(finalJsonPreview)
	}

	async function handleSubmit() {
		if (!filename || !editedJsonlString) {
			return
		}
		await axios.post(
			`${process.env.NEXT_PUBLIC_BASE_URL}api/dataset`,
			{ filename, jsonl: editedJsonlString },
			{ headers: { 'OpenAI-Key': openaiKey } }
		)
		router.push('/dataset')
	}

	return (
		<>
			<Head>
				<title>New dataset</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<div className={styles['flex-row-start']}>
					<Link className="button-subtle" href={'/dataset'}>Back</Link>
					<h1 className={styles.h1}>New dataset</h1>
				</div>

				<p>Select your dataset file and a JSONL file will be generated, which can then be uploaded to OpenAI.</p>

				<label className="button">
					Select file
					<input type="file" accept=".jsonl,.csv,.txt" onChange={handleFileChange} />
				</label>

				<div className={styles['options-div']}>
					<div className={styles['option-div']}>
						<div className="checkbox-parent" title="Each prompt should end with a fixed separator to inform the model when the prompt ends and the completion begins. A simple separator which generally works well is \n\n###\n\n. The separator should not appear elsewhere in any prompt.">
							<input id="separator-checkbox" type="checkbox" checked={isSeparatorChecked} onChange={() => setSeparatorChecked(!isSeparatorChecked)} />
							<label htmlFor="separator-checkbox">Add prompt-completion separator</label>
						</div>
						<div className={isSeparatorChecked ? "input-parent" : "hidden"}>
							<label htmlFor="separator">Separator</label>
							<input id="separator" type="text" value={separator} onChange={e => setSeparator(e.target.value)} />
						</div>
					</div>

					<div className="checkbox-parent" title="Each completion should start with a whitespace due to tokenization, which tokenizes most words with a preceding whitespace.">
						<input id="whitespace-checkbox" type="checkbox" checked={isWhitespaceChecked} onChange={() => setWhitespaceChecked(!isWhitespaceChecked)} />
						<label htmlFor="whitespace-checkbox">Add completion start whitespace</label>
					</div>

					<div className={styles['option-div']}>
						<div className="checkbox-parent" title="Each completion should end with a fixed stop sequence to inform the model when the completion ends. A stop sequence could be \n, ###, or any other token that does not appear in any completion.">
							<input id="stop-checkbox" type="checkbox" checked={isStopChecked} onChange={() => setStopChecked(!isStopChecked)} />
							<label htmlFor="stop-checkbox">Add completion stop sequence</label>
						</div>
						<div className={isStopChecked ? "input-parent" : "hidden"}>
							<label htmlFor="stop">Stop sequence</label>
							<input id="stop" type="text" value={stop} onChange={e => setStop(e.target.value)} />
						</div>
					</div>
				</div>

				<div className="jsonl-parent">
					<h2>JSONL preview</h2>
					<p className="jsonl">{editedJsonlString || 'Nothing to display. Select a file first.'}</p>
				</div>

				<div className={styles['flex-row-end']}>
					<button onClick={handleSubmit}>Upload to OpenAI</button>
				</div>
			</section>
		</>
	)
}

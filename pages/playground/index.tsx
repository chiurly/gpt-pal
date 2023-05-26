import { useSWRWrapper } from '@/pages'
import { OpenaiContext } from '@/pages/_app'
import styles from '@/styles/playground.module.css'
import axios from 'axios'
import Head from 'next/head'
import { useContext, useState } from 'react'

export default function Playground() {
	const { openaiKey } = useContext(OpenaiContext)
	const [selectedModelId, setSelectedModelId] = useState('')
	const [maxTokens, setMaxTokens] = useState(256)
	const [temperature, setTemperature] = useState(1)
	const [stopSequence, setStopSequence] = useState('')
	const [prompt, setPrompt] = useState('')
	const [completion, setCompletion] = useState('')
	const [isCompleting, setIsCompleting] = useState(false)

	const { data: fineTunes } = useSWRWrapper(
		`${process.env.NEXT_PUBLIC_BASE_URL}api/fine-tune`,
		{ headers: { 'OpenAI-Key': openaiKey } }
	)

	const handlePrompt = async () => {
		setIsCompleting(true)
		const result = await axios.post(
			`${process.env.NEXT_PUBLIC_BASE_URL}api/completion`,
			{
				model: selectedModelId,
				prompt,
				max_tokens: maxTokens || 256,
				temperature: temperature || 1,
				stop: stopSequence.length && stopSequence || null,
			},
			{ headers: { 'OpenAI-Key': openaiKey } }
		)
		const text = result.data.choices[0].text as string
		setCompletion(text.trim())
		setIsCompleting(false)
	}

	return (
		<>
			<Head>
				<title>Playground</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section>
				<h1>Playground</h1>
				<p>Select a model and prompt it.</p>

				<div className="input-parent">
					<label htmlFor="model-select">Model</label>
					<select id="model-select" value={selectedModelId} onChange={event => setSelectedModelId(event.target.value)}>
						<option value="">Select a model</option>
						<optgroup label="My models">
							{fineTunes && fineTunes.map((fineTune: any) => (
								<option key={fineTune.id} value={fineTune.fine_tuned_model}>
									{fineTune.fine_tuned_model}
								</option>
							))}
						</optgroup>
						<optgroup label="OpenAI models">
							<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
							<option value="davinci">davinci</option>
							<option value="curie">curie</option>
						</optgroup>
					</select>
				</div>

				<div className={styles['flex-row-start']}>
					<div className="input-parent" title="The maximum number of tokens to generate in the completion.">
						<div className={styles['flex-row-between']}>
							<label htmlFor="max-tokens">Max tokens</label>
							<input id="max-tokens" className={styles['subtle-input']} type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} />
						</div>
						<input id="max-tokens" type="range" min="1" max="4000" step="1" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} />
					</div>
					<div className="input-parent" title="What sampling temperature to use, between 0 and 2. Higher values will make the output more random, while lower values will make it more focused and deterministic.">
						<div className={styles['flex-row-between']}>
							<label htmlFor="temperature">Temperature</label>
							<input id="max-tokens" className={styles['subtle-input']} type="number" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
						</div>
						<input id="temperature" type="range" min="0" max="2" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} />
					</div>
					<div className="input-parent" title="Sequence where the API will stop generating further tokens. The returned text will not contain the stop sequence.">
						<label htmlFor="stop-sequence">Stop sequence</label>
						<input id="stop-sequence" type="text" value={stopSequence} onChange={event => setStopSequence(event.target.value)} />
					</div>
				</div>

				<div className={styles['promt-completion']}>
					<div className={styles['textarea-parent']}>
						<label htmlFor="prompt">Prompt</label>
						<textarea id="prompt" className={styles.textarea} onChange={event => setPrompt(event.target.value)} />
					</div>
					<div className={styles['textarea-parent']}>
						<label htmlFor="completion">Completion</label>
						<textarea id="completion" className={styles.textarea} value={isCompleting ? '...' : completion} disabled />
					</div>
				</div>

				<div className={styles['flex-row-end']}>
					<button onClick={handlePrompt} disabled={isCompleting}>Prompt</button>
				</div>
			</section>
		</>
	)
}

import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const [fineTunesResponse, modelsResponse] = await Promise.all([openai.listFineTunes(), openai.listModels()])
		const models = modelsResponse.data.data.map(model => model.id)
		const fineTunes = fineTunesResponse.data.data.filter((fineTune: any) => models.includes(fineTune.fine_tuned_model) || fineTune.status !== 'succeeded')
		response.status(fineTunesResponse.status).json(fineTunes)
	} catch (error: any) {
		console.error(error.message || error)
		if (error.response) {
			return response.status(error.response.status).json(error.response.data)
		}
		response.status(500).json({ error: error.message || 'Internal server error (OpenAI)' })
	}
}

const handlePost = async (request: NextApiRequest, response: NextApiResponse) => {
	if (!request.body.datasetId) {
		return response.status(400).json({ error: 'Bad request' })
	}

	const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY })
	const openai = new OpenAIApi(configuration)

	try {
		const createFineTuneResponse = await openai.createFineTune({
			training_file: request.body.datasetId,
			model: 'davinci',
			suffix: request.body.name || null,
		})
		response.status(createFineTuneResponse.status).json(createFineTuneResponse.data)
	} catch (error: any) {
		console.error(error.message || error)
		if (error.response) {
			return response.status(error.response.status).json(error.response.data)
		}
		response.status(500).json({ error: error.message || 'Internal server error (OpenAI)' })
	}
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET':
			await handleGet(request, response)
			break
		case 'POST':
			await handlePost(request, response)
			break
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

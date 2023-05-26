import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const fineTuneId = request.query.id as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const fineTuneResponse = await openai.retrieveFineTune(fineTuneId)
		response.status(fineTuneResponse.status).json(fineTuneResponse.data)
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
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

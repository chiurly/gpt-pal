import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const handleDelete = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const openaiResponse = await openai.deleteModel(request.query.id as string)
		response.status(openaiResponse.status).json(openaiResponse.data)
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
		case 'DELETE':
			await handleDelete(request, response)
			break
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

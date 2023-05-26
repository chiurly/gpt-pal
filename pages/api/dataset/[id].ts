import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const datasetId = request.query.id as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const [fileResponse, contentResponse] = await Promise.all([
			openai.retrieveFile(datasetId),
			openai.downloadFile(datasetId),
		])
		const combinedBody = { ...fileResponse.data, ...{ content: contentResponse.data } }
		response.status(fileResponse.status).json(combinedBody)
	} catch (error: any) {
		console.error(error.message || error)
		if (error.response) {
			return response.status(error.response.status).json(error.response.data)
		}
		response.status(500).json({ error: error.message || 'Internal server error (OpenAI)' })
	}
}

const handleDelete = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const datasetId = request.query.id as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const deleteResponse = await openai.deleteFile(datasetId)
		response.status(deleteResponse.status).json(deleteResponse.data)
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
		case 'DELETE':
			await handleDelete(request, response)
			break
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

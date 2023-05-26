import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const writeFilePromise = (path: string, data: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}

const unlinkFilePromise = (path: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		fs.unlink(path, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	const apiKey = request.headers['openai-key'] as string
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		const openaiResponse = await openai.listFiles()
		response.status(openaiResponse.status).json(openaiResponse.data.data)
	} catch (error: any) {
		console.error(error.message || error)
		if (error.response) {
			return response.status(error.response.status).json(error.response.data)
		}
		response.status(500).json({ error: error.message || 'Internal server error (OpenAI)' })
	}
}

const handlePost = async (request: NextApiRequest, response: NextApiResponse) => {
	if (!request.body.filename || !request.body.jsonl) {
		return response.status(400).json({ error: 'Bad request' })
	}

	const apiKey = request.headers['openai-key'] as string
	const filename = request.body.filename.replace('.csv', '.jsonl')
	const configuration = new Configuration({ apiKey })
	const openai = new OpenAIApi(configuration)

	try {
		await writeFilePromise(filename, request.body.jsonl)
		// @ts-ignore
		const openaiResponse = await openai.createFile(fs.createReadStream(filename), 'fine-tune')
		response.status(openaiResponse.status).json(openaiResponse.data)
	} catch (error: any) {
		console.error(error.message || error)
		if (error.response) {
			return response.status(error.response.status).json(error.response.data)
		}
		response.status(500).json({ error: error.message || 'Internal server error (OpenAI)' })
	} finally {
		unlinkFilePromise(filename)
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

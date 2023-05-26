import mongoConnectionPromise from '@/lib/mongodb'
import User from '@/models/user'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	try {
		await mongoConnectionPromise
		const user = await User.findById(request.query.id)
		response.status(200).json(user)
	} catch (error) {
		response.status(500).json({ error: 'Internal server error (MongoDB)' })
		console.error(error)
	}
}

const handleDelete = async (request: NextApiRequest, response: NextApiResponse) => {
	try {
		await mongoConnectionPromise
		const deletedUser = await User.findByIdAndDelete(request.query.id)

		if (deletedUser === null) {
			return response.status(404).json({ error: 'User not found' })
		}

		response.status(200).json({ message: 'User deleted' })
	} catch (error) {
		response.status(500).json({ error: 'Internal server error (MongoDB)' })
		console.error(error)
	}
}

const handlePatch = async (request: NextApiRequest, response: NextApiResponse) => {
	try {
		await mongoConnectionPromise
		await User.findByIdAndUpdate(request.query.id, request.body)
		response.status(200).json({ message: 'User updated' })
	} catch (error) {
		response.status(500).json({ error: 'Internal server error (MongoDB)' })
		console.error(error)
	}
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
	const session = await getServerSession(request, response, authOptions)

	if (!session) {
		return response.status(401).json({ error: 'Unauthorized' })
	}

	switch (request.method) {
		case 'GET':
			await handleGet(request, response)
			break
		case 'DELETE':
			await handleDelete(request, response)
			break
		case 'PATCH':
			await handlePatch(request, response)
			break
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

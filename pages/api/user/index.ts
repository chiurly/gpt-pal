const EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/

import mongoConnectionPromise from '@/lib/mongodb'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (request: NextApiRequest, response: NextApiResponse) => {
	try {
		await mongoConnectionPromise
		const users = await User.find(request.body || {})
		response.status(200).json(users)
	} catch (error) {
		response.status(500).json({ error: 'Internal server error (MongoDB)' })
		console.error(error)
	}
}

const handlePost = async (request: NextApiRequest, response: NextApiResponse) => {
	if (!request.body.email || !request.body.password) {
		return response.status(400).json({ error: 'Bad request' })
	}

	const email = request.body.email.replace(/\s+/g, '')
	const password = request.body.password

	if (!EMAIL_REGEX.test(email)) {
		return response.status(409).json({ error: 'Invalid email' })
	}

	if (password.length < 8) {
		return response.status(409).json({ error: 'Password must be at least 8 characters long' })
	} else if (!/[A-Z]/.test(password)) {
		return response.status(409).json({ error: 'Password must contain at least 1 uppercase letter' })
	} else if (!/[a-z]/.test(password)) {
		return response.status(409).json({ error: 'Password must contain at least 1 lowercase letter' })
	} else if (!/\d/.test(password)) {
		return response.status(409).json({ error: 'Password must contain at least 1 number' })
	}

	try {
		await mongoConnectionPromise
		const existingUser = await User.findOne({ email })

		if (existingUser) {
			return response.status(409).json({ error: 'Email already in use' })
		}

		const hashedPassword = await bcrypt.hash(password, 12)
		const createdUser = await User.create({ email, password: hashedPassword, openai_key: request.body.openai_key })
		response.status(201).json(createdUser)
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			for (const key in error.errors) {
				return response.status(409).json({ error: error.errors[key].message })
			}
		}
		response.status(500).json({ error: 'Internal server error' })
		console.error(error)
	}
}

const handleDelete = async (request: NextApiRequest, response: NextApiResponse) => {
	if (!request.body || !request.body._id) {
		return response.status(400).json({ error: 'Bad request' })
	}

	try {
		await mongoConnectionPromise
		const deletedUser = await User.findByIdAndDelete(request.body._id)

		if (deletedUser === null) {
			return response.status(404).json({ error: 'User not found' })
		}

		response.status(200).json({ message: 'User deleted' })
	} catch (error) {
		response.status(500).json({ error: 'Internal server error (MongoDB)' })
		console.error(error)
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
		case 'DELETE':
			await handleDelete(request, response)
			break
		default:
			response.status(405).json({ error: 'Method not allowed' })
	}
}

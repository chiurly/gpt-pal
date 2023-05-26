import mongoose from 'mongoose'

const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
	throw new Error('Missing environment variable: "MONGODB_URI"')
}

let mongoConnectionPromise: Promise<typeof mongoose>

if (process.env.NODE_ENV === 'development') {
	let globalWithMongo = global as typeof globalThis & {
		_mongoConnectionPromise?: Promise<typeof mongoose>
	}

	if (!globalWithMongo._mongoConnectionPromise) {
		globalWithMongo._mongoConnectionPromise = mongoose.connect(MONGODB_URI)
	}

	mongoConnectionPromise = globalWithMongo._mongoConnectionPromise
} else {
	mongoConnectionPromise = mongoose.connect(MONGODB_URI)
}

export default mongoConnectionPromise

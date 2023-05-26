import { Schema, model, models } from 'mongoose'

const userSchema: Schema = new Schema({
	email: {
		type: String,
		required: [true, 'Email required'],
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, 'Password required'],
		select: false,
	},
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})

const User = models.User || model('User', userSchema)

export default User

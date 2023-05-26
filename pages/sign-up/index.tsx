import styles from '@/styles/sign-in.module.css'
import axios, { AxiosError } from 'axios'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SignUp() {
	const router = useRouter()
	const [submitError, setSubmitError] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		let signInResponse

		try {
			await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}api/user`, { email, password })
			signInResponse = await signIn('credentials', { redirect: false, email, password })
			router.push('/dashboard')
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				setSubmitError(error.response.data.error)
			} else if (signInResponse && signInResponse.error) {
				setSubmitError(signInResponse.error)
			} else {
				setSubmitError('An error occurred')
			}
			console.error(error)
		}
	}

	return (
		<>
			<Head>
				<title>Pocket Assistant</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<section className={styles.section}>
				<h1>Sign Up</h1>

				<form className={styles.form} onSubmit={handleSubmit}>
					{submitError && <p className="error">{submitError}</p>}

					<div className={styles['input-parent']}>
						<label htmlFor="email">Email</label>
						<input id="email" type="text" autoComplete="off" onChange={event => setEmail(event.target.value)} />
					</div>

					<div className={styles['input-parent']}>
						<label htmlFor="password">Password</label>
						<input id="password" type="password" onChange={event => setPassword(event.target.value)} />
					</div>

					<button className={styles.submit} type="submit">Sign Up</button>
				</form>

				<p>Already signed up? <Link className="link" href="/sign-in">Sign in</Link></p>
			</section>
		</>
	)
}

import styles from '@/styles/sign-in.module.css'
import { signIn } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SignIn() {
	const router = useRouter()
	const [submitError, setSubmitError] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const signInResponse = await signIn('credentials', {
			redirect: false, email, password
		}).catch(error => {
			setSubmitError(error)
			console.error(error)
		})

		if (!signInResponse) {
			return
		} else if (signInResponse.error) {
			setSubmitError(signInResponse.error)
		} else {
			router.push('/dashboard')
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
				<h1>Sign In</h1>

				<form className={styles.form} onSubmit={handleSubmit}>
					{submitError && <p className="error">{submitError}</p>}

					<div className={styles['input-parent']}>
						<label htmlFor="email">Email</label>
						<input id="email" type="text" onChange={event => setEmail(event.target.value)} />
					</div>

					<div className={styles['input-parent']}>
						<label htmlFor="password">Password</label>
						<input id="password" type="password" onChange={event => setPassword(event.target.value)} />
					</div>

					<button type="submit">Sign In</button>
				</form>

				<p>Not signed up? <Link className="link" href="/sign-up">Sign up</Link></p>
			</section>
		</>
	)
}

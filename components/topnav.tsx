import styles from '@/styles/topnav.module.css'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Topnav() {
	const { data: session, status } = useSession()

	return (
		<nav className={styles.nav}>
			<div className={styles['nav-left']}>
				<Link className={styles['nav-title']} href="/">GPT pal</Link>
			</div>
			<div className={styles['nav-right']}>
				{
					status === 'authenticated' &&
					<>
						<Link className={styles['nav-link']} href="/playground">Playground</Link>
						<Link className={styles['nav-link']} href="/fine-tune">Fine-tunes</Link>
						<Link className={styles['nav-link']} href="/dataset">Datasets</Link>
						<Link className={styles['nav-link']} href="/dashboard">Dashboard</Link>
						<button onClick={() => signOut()}>Sign out</button>
					</>
					|| status === 'unauthenticated' &&
					<>
						<Link className={styles['nav-link']} href="/sign-in">Sign in</Link>
						<Link className={styles['nav-link']} href="/sign-up">Sign up</Link>
					</>
					|| status === 'loading' &&
					<>
						<div>Loading...</div>
					</>
				}
			</div>
		</nav>
	)
}

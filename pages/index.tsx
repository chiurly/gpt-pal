import axios from 'axios'
import Head from 'next/head'
import useSWR, { SWRResponse } from 'swr'

async function fetcherWithConfig([url, config]: [string, Object?]) {
	return axios.get(url, config).then(response => response.data)
}

export function useSWRWrapper(url: string | null, config: Object | null): SWRResponse {
	return useSWR([url, config], fetcherWithConfig)
}

export default function Home() {
	return (
		<>
			<Head>
				<title>GPT pal</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
		</>
	)
}

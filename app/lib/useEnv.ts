import useSWR from 'swr'

const dev = process.env.NODE_ENV === 'development'

interface Env {
  cognitoUserPoolId: string
  cognitoUserPoolWebClientId: string
}

const fetcher = async () => {
  const res = await fetch('/env.json')
  return res.json()
}

export default function useEnv() {
  const { data: env } = useSWR<Env>(dev ? null : '/env.json', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  if (dev) {
    return {
      env: Object.freeze({
        cognitoUserPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
        cognitoUserPoolWebClientId: process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID
      }) as Env
    }
  }

  return { env: Object.freeze(env) }
}

import { useEffect } from 'react'
import Router from 'next/router'
import { useAuthenticator } from '@aws-amplify/ui-react'

export default function useUser({ redirect = '' } = {}) {
  const { user, signOut: _signOut } = useAuthenticator((context) => [context.user])
  const { route } = useAuthenticator((context) => [context.route])

  useEffect(() => {
    if (redirect && route !== 'authenticated') {
      Router.push({ pathname: redirect, query: { redirect: Router.asPath } })
    }
  }, [user, route, redirect])

  const signOut = async ({ redirect = '/' }) => {
    await Router.push(redirect)
    _signOut()
  }

  return { user, signOut }
}

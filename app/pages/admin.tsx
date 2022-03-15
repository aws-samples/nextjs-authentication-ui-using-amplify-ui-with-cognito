import { NextPage } from 'next'
import styles from '../styles/page.module.css'
import useUser from '../lib/useUser'

const Admin: NextPage = () => {
  const { user, loading, loggedOut, signOut } = useUser({ redirect: '/signin' })

  if (loading) return <>Loading...</>
  if (loggedOut) return <>Redirect...</>

  console.log(user.signInUserSession?.idToken?.jwtToken)

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome, {user.attributes?.email}!</h1>

        <p className={styles.description}>
          Sign out and redirect to home: <button onClick={() => signOut({ redirect: '/' })}>SignOut</button>
        </p>
      </main>
    </>
  )
}

export default Admin

import { NextPage } from 'next'
import styles from '../styles/page.module.css'
import useUser from '../lib/useUser'

const Admin: NextPage = () => {
  const { user, signOut } = useUser({ redirect: '/signin' })

  if (!user) return <>Loading...</>

  const session = user.getSignInUserSession()
  const token = session?.getIdToken().getJwtToken()

  console.log(`token: ${token}`)

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

import { NextPage } from 'next'
import Router from 'next/router'
import { useSWRConfig } from 'swr'
import styles from '../styles/page.module.css'
import { Authenticator, useAuthenticator, CheckboxField, AmplifyProvider, Theme } from '@aws-amplify/ui-react'

const themeBlue: Theme = {
  name: 'blue',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: 'rgba(25,120,200,0.1)' },
          20: { value: 'rgba(25,120,200,0.2)' },
          40: { value: 'rgba(25,120,200,0.4)' },
          60: { value: 'rgba(25,120,200,0.6)' },
          80: { value: 'rgb(25,120,200)' },
          90: { value: 'rgb(25,120,200)' },
          100: { value: 'rgb(25,120,200)' },
        },
      },
    },
  },
}

const AuthUI: NextPage = () => {
  const { route } = useAuthenticator((context) => [context.route])
  const { cache } = useSWRConfig()

  if (route === 'authenticated') {
    cache.delete('user')
    const redirect = Router.query.redirect || '/'
    Router.push(redirect + '')
    return <>Redirect...</>
  }

  return (
    <main className={styles.main}>
      <Authenticator
        loginMechanisms={['email']}
        components={{
          SignUp: {
            FormFields() {
              const { validationErrors } = useAuthenticator()
              return (
                <>
                  <Authenticator.SignUp.FormFields />
                  <CheckboxField
                    hasError={!!validationErrors.acknowledgement}
                    name="acknowledgement"
                    value="yes"
                    label={
                      <>
                        I agree with the{' '}
                        <a
                          href="https://aws.amazon.com/terms"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#3366ff', textDecoration: 'underline' }}
                        >
                          Terms & Conditions
                        </a>
                      </>
                    }
                  />
                </>
              )
            },
          },
        }}
        services={{
          async validateCustomSignUp(formData) {
            if (!formData.acknowledgement) {
              return {
                acknowledgement: 'You must agree to the Terms & Conditions',
              }
            }
          },
        }}
      />
    </main>
  )
}

const SignIn: NextPage = () => {
  return (
    <AmplifyProvider theme={themeBlue}>
      <Authenticator.Provider>
        <AuthUI />
      </Authenticator.Provider>
    </AmplifyProvider>
  )
}

export default SignIn

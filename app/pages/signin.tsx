import { NextPage } from 'next'
import Router from 'next/router'
import { Authenticator, useAuthenticator, CheckboxField } from '@aws-amplify/ui-react'
import styles from '../styles/page.module.css'

const SignIn: NextPage = () => {
  const { route } = useAuthenticator((context) => [context.route])

  if (route === 'authenticated') {
    const redirect = Router.query.redirect || '/'
    Router.push(redirect + '')
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
            }
          }
        }}
        services={{
          async validateCustomSignUp(formData) {
            if (!formData.acknowledgement) {
              return {
                acknowledgement: 'You must agree to the Terms & Conditions'
              }
            }
          }
        }}
      />
    </main>
  )
}

export default SignIn

import { PostConfirmationTriggerHandler, PostConfirmationTriggerEvent } from 'aws-lambda'

export const handler: PostConfirmationTriggerHandler = async (event: PostConfirmationTriggerEvent) => {
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    // Store User ID in a database, etc., if necessary.
    console.log(event.userName, event.request.userAttributes?.email)
  }

  return event
}

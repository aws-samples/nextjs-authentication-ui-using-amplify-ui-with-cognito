import * as cdk from 'aws-cdk-lib'
import { FrontendStack, BackendStack, AllInOneStack } from './stack/sample-stack'

const app = new cdk.App()

const backend = new BackendStack(app, 'BackendStack')
const frontend = new FrontendStack(app, 'FrontendStack', {
  backendStack: backend
})
frontend.addDependency(backend)

new AllInOneStack(app, 'AllInOneStack')

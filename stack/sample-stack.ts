import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as path from 'path'
import { RemoteOutputs } from 'cdk-remote-stack'

export class AllInOneStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const postConfirmationFn = new NodejsFunction(this, 'PostConfirmationFn', {
      entry: 'lambda/postConfirmation.ts'
    })

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      lambdaTriggers: {
        postConfirmation: postConfirmationFn
      }
    })

    const userPoolClient = userPool.addClient('UserPoolClient', {
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      accessTokenValidity: Duration.days(1),
      idTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(30)
    })

    new CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId
    })

    new CfnOutput(this, 'CognitoUserPoolWebClientId', {
      value: userPoolClient.userPoolClientId
    })

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteErrorDocument: '404.html',
      websiteIndexDocument: 'index.html',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true
    })

    const websiteIdentity = new cloudfront.OriginAccessIdentity(this, 'WebsiteIdentity')
    websiteBucket.grantRead(websiteIdentity)

    const rewriteFn = new cloudfront.Function(this, 'RewriteFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: 'cloudfrontfunction/rewrite.js'
      })
    })

    const websiteDistribution = new cloudfront.CloudFrontWebDistribution(this, 'WebsiteDistribution', {
      errorConfigurations: [
        {
          errorCachingMinTtl: 300,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/404.html'
        }
      ],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: websiteIdentity
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              functionAssociations: [
                {
                  eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                  function: rewriteFn
                }
              ]
            }
          ]
        }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL
    })

    const frontendEnvVars = {
      cognitoUserPoolId: userPool.userPoolId,
      cognitoUserPoolWebClientId: userPoolClient.userPoolClientId
    }

    new s3deploy.BucketDeployment(this, 'WebsiteDeploy', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '..', 'app', 'out')),
        s3deploy.Source.jsonData('env.json', frontendEnvVars)
      ],
      destinationBucket: websiteBucket,
      distribution: websiteDistribution,
      distributionPaths: ['/*'],
      memoryLimit: 1024
    })

    new CfnOutput(this, 'FrontendEndpoint', {
      description: 'Frontend Endpoint',
      value: websiteDistribution.distributionDomainName
    })
  }
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const postConfirmationFn = new NodejsFunction(this, 'PostConfirmationFn', {
      entry: 'lambda/postConfirmation.ts'
    })

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      lambdaTriggers: {
        postConfirmation: postConfirmationFn
      }
    })

    const userPoolClient = userPool.addClient('UserPoolClient', {
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      accessTokenValidity: Duration.days(1),
      idTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(30)
    })

    new CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId
    })

    new CfnOutput(this, 'CognitoUserPoolWebClientId', {
      value: userPoolClient.userPoolClientId
    })
  }

  getOutputsForFrontend(scope: Stack) {
    const outputs = new RemoteOutputs(scope, 'BackendStackOutputs', { stack: this })
    const cognitoUserPoolId = outputs.get('CognitoUserPoolId')
    const cognitoUserPoolWebClientId = outputs.get('CognitoUserPoolWebClientId')

    return {
      cognitoUserPoolId,
      cognitoUserPoolWebClientId
    }
  }
}

interface FrontendStackProps extends StackProps {
  backendStack: BackendStack
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props)

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteErrorDocument: '404.html',
      websiteIndexDocument: 'index.html',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true
    })

    const websiteIdentity = new cloudfront.OriginAccessIdentity(this, 'WebsiteIdentity')
    websiteBucket.grantRead(websiteIdentity)

    const rewriteFn = new cloudfront.Function(this, 'RewriteFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: 'cloudfrontfunction/rewrite.js'
      })
    })

    const websiteDistribution = new cloudfront.CloudFrontWebDistribution(this, 'WebsiteDistribution', {
      errorConfigurations: [
        {
          errorCachingMinTtl: 300,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/404.html'
        }
      ],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: websiteIdentity
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              functionAssociations: [
                {
                  eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                  function: rewriteFn
                }
              ]
            }
          ]
        }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL
    })

    const frontendEnvVars = props.backendStack.getOutputsForFrontend(this)

    new s3deploy.BucketDeployment(this, 'WebsiteDeploy', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '..', 'app', 'out')),
        s3deploy.Source.jsonData('env.json', frontendEnvVars)
      ],
      destinationBucket: websiteBucket,
      distribution: websiteDistribution,
      distributionPaths: ['/*'],
      memoryLimit: 1024
    })

    new CfnOutput(this, 'FrontendEndpoint', {
      description: 'Frontend Endpoint',
      value: websiteDistribution.distributionDomainName
    })
  }
}

import { Stack, StackProps, CfnParameter } from 'aws-cdk-lib';
import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { UserPool, OAuthScope, AccountRecovery } from 'aws-cdk-lib/aws-cognito'
// import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda'
// import { RestApi, CognitoUserPoolsAuthorizer, LambdaIntegration, Resource, AuthorizationType } from "aws-cdk-lib/aws-apigateway";
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';

export class cdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);

    new CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });

    const environ = AmplifyHelpers.getProjectInfo().envName;
    const appName = AmplifyHelpers.getProjectInfo().projectName;
    const amplifyId = process.env.AWS_APP_ID;
    const domainName = `https://${environ}.${amplifyId}.amplifyapp.com`

    const userPool = new UserPool(this, "UserPool", {
      userPoolName: `${appName}-${environ}`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true
        },
        familyName: {
          required: true,
          mutable: false
        }
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY
    });

    const userPoolClient = userPool.addClient("UserPoolClient", {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: [domainName],
        logoutUrls: [domainName]
      }
    });

  }
}

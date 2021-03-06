import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
    service: 'backend-products',
    frameworkVersion: '2',
    // Add the serverless-webpack plugin
    plugins: [
        'serverless-webpack',
        'serverless-domain-manager',
        'serverless-offline',
        'serverless-dotenv-plugin',
    ],
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        region: '${opt:region, "ap-southeast-2"}',
        stage: '${opt:stage, "dev"}',
        memorySize: 128,
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        },
        // Grant Access to DynamoDB
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: [
                    "dynamodb:BatchGetItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:Scan",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem"
                ],
                Resource: [
                    'arn:aws:dynamodb:${opt:region, "ap-southeast-2"}:${env:AWS_ACCOUNT_ID}:table/VenueProfile',
                    'arn:aws:dynamodb:${opt:region, "ap-southeast-2"}:${env:AWS_ACCOUNT_ID}:table/Products',
                    'arn:aws:dynamodb:${opt:region, "ap-southeast-2"}:${env:AWS_ACCOUNT_ID}:table/Orders',
                    'arn:aws:dynamodb:${opt:region, "ap-southeast-2"}:${env:AWS_ACCOUNT_ID}:table/UserProfile',
                    'arn:aws:dynamodb:${opt:region, "ap-southeast-2"}:${env:AWS_ACCOUNT_ID}:table/UserFavorites',
                ],
            }
        ],
    },
    functions: {
        app: {
            handler: 'handler.handler',
            events: [
                {
                    http: {
                        method: 'ANY',
                        path: '/',
                        cors: true,
                        authorizer: {
                            type: 'COGNITO_USER_POOLS',
                            name: 'Cognito-1',
                            arn: '${self:custom.project.cognito}',
                            identitySource: 'method.request.header.Authorization',
                        }
                    },
                },
                {
                    http: {
                        method: 'ANY',
                        path: '/{proxy+}',
                        cors: true,
                        authorizer: {
                            type: 'COGNITO_USER_POOLS',
                            name: 'Cognito-2',
                            arn: '${self:custom.project.cognito}',
                            identitySource: 'method.request.header.Authorization'
                        }
                    },
                }
            ],
        },
    },
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: {
                forceExclude: [
                    'aws-sdk'
                ],
            },
        },
        project: {
            cognito: '${env:COGNITO_POOL_ID}',
            dev: 'api.dev.appetizr.co',
            prod: 'api.appetizr.co',
        },
        customDomain: {
            domainName: '${self:custom.project.${opt:stage, "dev"}}',
            certificateName: '${self:custom.project.${opt:stage, "dev"}}',
            basePath: 'products',
            stage: '${opt:stage, "dev"}',
            createRoute53Record: true,
            endpointType: 'regional',
            securityPolicy: 'tls_1_2',
            apiType: 'rest',
            autoDomain: false,
        },
        dotenv: {
            exclude: [
                'AWS_ACCESS_KEY_ID',
                'AWS_SECRET_ACCESS_KEY',
                'AWS_REGION',
                'DYNAMODB_LOCAL'
            ],
        },
    },
};

module.exports = serverlessConfiguration;

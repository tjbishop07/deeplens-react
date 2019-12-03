Realtime DeepLens web app using React, AWS API Gateway Websockets, Dynamodb and custom Cognito authorizer.

## Stack

- AWS DeepLens
- AWS Cognito
- AWS Lambda
- AWS WebSocket API
- AWS DynamoDB
- React 16.8+
- Sockette
- Serverless 1.38+

## Create AWS Cognito User Pool

https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html

Once User Pool is created, Replace all <strong>APP_CLIENT_ID</strong> and <strong>USER_POOL_ID</strong> to your created IDs.

## Deploy Backend

```bash
cd backend
serverless deploy
cd ..
```

## Run React App

```bash
cd frontend
npm install
npm start
```

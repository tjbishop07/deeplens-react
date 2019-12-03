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

Once User Pool is created, set the environment variables accordingly. The APP client id is used both in the react application and in the authorzerFunc.

## Configure environment

```
REACT_APP_USER_POOL_ID={AWS cognito user pool id}
REACT_APP_USER_POOL_CLIENT_ID={AWS cognito app client id}
REACT_APP_WS_API_NAME={websocket api url}
```

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

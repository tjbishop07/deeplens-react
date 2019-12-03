"use strict";

const AWS = require("aws-sdk");
const Bluebird = require("bluebird");
AWS.config.update({ region: process.env.AWS_REGION });
const DDB = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
AWS.config.setPromisesDependency(Bluebird);
require("aws-sdk/clients/apigatewaymanagementapi");

const successfullResponse = {
  statusCode: 200,
  body: "Connected"
};

const fetch = require("node-fetch");
fetch.Promise = Bluebird;

exports.handler = async (event, context, callback) => {
  let connectionData;
  console.log("Event received: " + JSON.stringify(event));
  try {
    connectionData = await DDB.scan({
      TableName: process.env.DB_TABLE,
      ProjectionExpression: "connectionId"
    }).promise();
  } catch (err) {
    console.log(err);
    return { statusCode: 500 };
  }
  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      return await send(event, connectionId.S);
    } catch (err) {
      if (err.statusCode === 410) {
        return await deleteConnection(connectionId.S);
      }
      console.log(JSON.stringify(err));
      throw err;
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (err) {
    console.log(err);
    callback(null, JSON.stringify(err));
  }
  callback(null, successfullResponse);
};

const send = (event, connectionId) => {
  const postData = JSON.stringify(event);
  //JSON.parse(event.body).data;
  console.log('sending alert to endpoint: ' + process.env.WSAPI_NAME + '  @' + connectionId)
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: process.env.WSAPI_NAME
  });
  //# event.requestContext.domainName + "/" + event.requestContext.stage
  return apigwManagementApi
    .postToConnection({ ConnectionId: connectionId, Data: postData })
    .promise();
};

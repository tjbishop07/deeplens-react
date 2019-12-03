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

exports.handler = (event, context, callback) => {
  if (event.requestContext.eventType === "CONNECT") {
    addConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        callback(null, JSON.stringify(err));
      });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    deleteConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        callback(null, {
          statusCode: 500,
          body: "Failed to connect: " + JSON.stringify(err)
        });
      });
  }
};

const addConnection = connectionId => {
  const putParams = {
    TableName: process.env.DB_TABLE,
    Item: {
      connectionId: { S: connectionId }
    }
  };

  return DDB.putItem(putParams).promise();
};

const deleteConnection = connectionId => {
  const deleteParams = {
    TableName: process.env.DB_TABLE,
    Key: {
      connectionId: { S: connectionId }
    }
  };

  return DDB.deleteItem(deleteParams).promise();
};

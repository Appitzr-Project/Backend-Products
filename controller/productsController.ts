import { Response, NextFunction } from "express";
import { productsModel, venueProfileModel } from "@appitzr-project/db-model";
import { RequestAuthenticated, validateGroup } from "@base-pojokan/auth-aws-cognito";
import * as AWS from 'aws-sdk';

// declare database dynamodb
const ddb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_LOCAL, convertEmptyValues: true });

/**
 * Index Data Function
 *
 * @param req
 * @param res
 * @param next
 */
export const getProductsPublicById = async (
  req: RequestAuthenticated,
  res: Response,
  next: NextFunction
) => {
  try {
    const idProduct = req.param('id');

    // dynamodb parameter
    const paramDB = {
      TableName: productsModel.TableName,
      KeyConditionExpression: "#ip = :idProduct",
      FilterExpression: "isActive = :ia",
      ExpressionAttributeNames:{
          "#ip": "id"
      },
      ExpressionAttributeValues: {
          ":idProduct": idProduct,
          ":ia": true
      }
    }

    // query to database
    const queryDB = await ddb.query(paramDB).promise();

    // return response
    return res.json({
      code: 200,
      message: "success",
      data: queryDB?.Items[0]
    });
  } catch (e) {
    next(e);
  }
};

export const getProductsVenueById = async (
  req: RequestAuthenticated,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate group
    const userDetail = await validateGroup(req, "venue");

    // dynamodb parameter
    const paramGetVenueId : AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: venueProfileModel.TableName,
      Key: {
        venueEmail: userDetail.email,
        cognitoId: userDetail.sub
      },
      AttributesToGet: ['id']
    }

    // query to database
    const resVenueId = await ddb.get(paramGetVenueId).promise();

    const idProduct = req.param('id');

    // dynamodb parameter
    const paramDB = {
      TableName: productsModel.TableName,
      KeyConditionExpression: "#ip = :idProduct AND #vid = :vi",
      ExpressionAttributeNames:{
          "#ip": "id",
          "#vid": "venueId"
      },
      ExpressionAttributeValues: {
          ":idProduct": idProduct,
          ":vi": resVenueId?.Item.id
      }
    }

    // query to database
    const queryDB = await ddb.query(paramDB).promise();

    // return response
    return res.json({
      code: 200,
      message: "success",
      data: queryDB?.Items[0]
    });
  } catch (e) {
    next(e);
  }
};


/**
 * Index Data Function
 *
 * @param req
 * @param res
 * @param next
 */
 export const getProductByVenueId = async (
  req: RequestAuthenticated,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate group
    const user = await validateGroup(req, "venue");

    const paramGetVenueId : AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: venueProfileModel.TableName,
      Key: {
        venueEmail: user.email,
        cognitoId: user.sub
      },
      AttributesToGet: ['id']
    }

    // query to database
    const resVenueId = await ddb.get(paramGetVenueId).promise();

    // dynamodb parameter
    const paramDB = {
      TableName: productsModel.TableName,
      IndexName: "venueId-index",
      KeyConditionExpression: "venueId = :venueId", 
      ExpressionAttributeValues: {                
              ":venueId": resVenueId?.Item.id              
          }
    }

    // query to database
    const queryDB = await ddb.query(paramDB).promise();

    // return response
    return res.json({
      code: 200,
      message: "success",
      data: queryDB      
    });
  } catch (e) {
    next(e);
  }
};

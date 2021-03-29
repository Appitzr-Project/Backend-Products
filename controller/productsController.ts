import { Response, NextFunction } from "express";
import { productsModel } from "@appitzr-project/db-model";
import { RequestAuthenticated } from "@base-pojokan/auth-aws-cognito";
import * as AWS from 'aws-sdk';

// declare database dynamodb
const ddb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_LOCAL, convertEmptyValues: true });

/**
 * List All Product Venue by Venue ID
 *
 * @param req
 * @param res
 * @param next
*/
export const getProductByVenueIdPublic = async (
  req: RequestAuthenticated,
  res: Response,
  next: NextFunction
) => {
  try {
    const dataGet = req.query;

    // validation if venueid is empty 
    if (dataGet.venueid == '' || dataGet.venueid == null) {
      throw new Error("venueid is required!");
    }

    // get venueid data
    const idVenue = dataGet.venueid;

    // dynamodb parameter
    const paramDB = {
      TableName: productsModel.TableName,
      IndexName: "venueIdProductNameindex",
      KeyConditionExpression: "venueId = :venueId",
      ExpressionAttributeValues: {
        ":venueId": idVenue
      }
    }

    // query to database
    const queryDB = await ddb.query(paramDB).promise();

    // return response
    return res.json({
      code: 200,
      message: "success",
      data: queryDB?.Items
    });
  } catch (e) {
    next(e);
  }
};


/**
 * Get Product by ID
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
      ExpressionAttributeNames: {
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


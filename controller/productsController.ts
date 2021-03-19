import { Response, NextFunction } from "express";
import { productsModel } from "@appitzr-project/db-model";
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
      ExpressionAttributeNames:{
          "#ip": "id"
      },
      ExpressionAttributeValues: {
          ":idProduct": idProduct
      },
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

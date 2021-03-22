import { Response, NextFunction } from "express";
import { validationResult } from 'express-validator';
import { products, productsModel, venueProfileModel } from "@appitzr-project/db-model";
import { RequestAuthenticated, validateGroup, userDetail } from "@base-pojokan/auth-aws-cognito";
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

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
      IndexName: "venueIdProductNameindex",
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
      data: queryDB?.Items
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Store data to database
 * 
 * @param req RequestAuthenticated
 * @param res Response
 * @param next NextFunction
 * @returns 
 */
 export const productsStore = async (
    req: RequestAuthenticated,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // get userdetail from header
      const user = userDetail(req);
  
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
      console.log(resVenueId?.Item.id);
      
      // exapress validate input
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // get input
      const product : products = req.body;
  
      // venue profile input with typescript definition
      const productInput : products = {
        id: uuidv4(),            
        venueId: resVenueId?.Item.id,
        productName: product.productName,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
        proteinType: product.proteinType,
        isActive: product.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
  
      // dynamodb parameter
      const paramsDB : AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: productsModel.TableName,
        Item: productInput,
        ConditionExpression: 'attribute_not_exists(venueId)'
      }
  
      // save data to database
      await ddb.put(paramsDB).promise();
  
      // return result
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: paramsDB?.Item
      });
  
    } catch (e) {
      
      /**
       * Return error kalau expression data udh ada
       */
      if(e?.code == 'ConditionalCheckFailedException') {
        next(new Error('Data Already Exist.!'));
      }
  
      // return default error
      next(e);
    }
  };

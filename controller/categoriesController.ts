import { Response, NextFunction } from "express";
import { categoriesModel } from "@appitzr-project/db-model";
import { RequestAuthenticated } from "@base-pojokan/auth-aws-cognito";
import * as AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_LOCAL, convertEmptyValues: true });


/**
 * List All Product Venue by Venue ID
 *
 * @param req
 * @param res
 * @param next
*/
export const getCategories = async (
    req: RequestAuthenticated,
    res: Response,
    next: NextFunction
) => {
    try {
        let type = req.param("type");
        if(type !== "ProductCategory" && type !== "CultureCategory") {
            return res.send({
                code: 500,
                message: "Param type must be ProductCategory or CultureCategory"
            })
        }

        const paramDB = {
            TableName: categoriesModel.TableName,
            IndexName: "CategoriesTypeIndex",
            KeyConditionExpression: "#type = :type",
            ExpressionAttributeNames: {
              "#type": "type"
            },
            ExpressionAttributeValues: {
                ":type" : type
            },
        }

        const queryDB = await ddb.query(paramDB).promise();

        return res.json({
            code: 200,
            message: "success",
            data: queryDB
        });

    } catch (error) {
        next(error)
    }
}

export const storeCategory = async (
    req: RequestAuthenticated,
    res: Response,
    next: NextFunction
) => {
    
}
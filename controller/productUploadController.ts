import { Response, NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { venueProfileModel } from "@appitzr-project/db-model";
import { RequestAuthenticated, validateGroup } from "@base-pojokan/auth-aws-cognito";
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as Multer from 'multer';
import * as fs from 'fs';

// declare database dynamodb
const ddb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_LOCAL, convertEmptyValues: true });

/**
 * Multer Storage and Upload
 */
const multerUpload = Multer({ dest: '/tmp' });

/**
 * Validator Image Input For Single File
 * Maximum File Size Limit 5 Mb
 * And Format .jpeg, .jpg, and .png
 */
export const productUploadValidate: any[] = [
    // single upload middleware
    multerUpload.single('data'),

    // express validator size and mime type
    body('data')
        .custom((value, { req }) => {
            // size limit 5 MB in byte
            const fileLimit: number = 5242880;

            // check if file exist
            // and size file under fileLimit
            if (req.file && req.file.size < fileLimit) {
                // check mime type file
                if (req.file.mimetype === 'image/png') {
                    return '.png';
                } else if (req.file.mimetype === 'image/jpeg') {
                    return '.jpeg';
                } else {
                    throw new Error('Format Allowed: .jpeg, .jpg or .png');
                }
            } else {
                throw new Error('Upload File Required With Maximum File Size 5 MB/File.!');
            }
        }),
];

export const productMenuUpload = async (
    req: RequestAuthenticated,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate if user is venue or not
        const user = await validateGroup(req, 'venue');

        // exapress validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // venue detail param
        const paramVenueDetail: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: venueProfileModel.TableName,
            Key: {
                venueEmail: user?.email,
                cognitoId: user?.sub,
            },
        };

        // query to find venue data
        const findVenueData = await ddb.get(paramVenueDetail).promise();

        // check if user found or not
        if (!findVenueData) {
            throw new Error('Data Not Found.!');
        }

        // get file upload
        // types from Global Express
        const fileUpload: Express.Multer.File = req.file;

        // file extention
        let fileExtention: string;
        if (fileUpload.mimetype === 'image/png') {
            fileExtention = '.png';
        } else if (fileUpload.mimetype === 'image/jpeg') {
            fileExtention = '.jpeg';
        } else {
            throw new Error('Unknown File.!')
        }

        // generate filename with uuid
        const fileName: string = uuidv4() + fileExtention;

        // generate path directory
        const date = new Date();
        const year: number = date.getFullYear();
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();

        // generate filename with path
        const fullFileName: string = `${year}/${month}/${day}/${fileName}`;
        // generate URL with Full Name
        const fileURL = 'https://' + process.env.AWS_S3_BUCKET + '/' + fullFileName;

        /**
         * Upload File to AWS S3
         */
        const S3 = new AWS.S3();

        // S3 Action Upload Fsile
        await S3.upload({
            ACL: 'public-read',
            Bucket: process.env.AWS_S3_BUCKET,
            Body: Buffer.from(fs.readFileSync(fileUpload.path, 'base64'), 'base64'),
            Key: fullFileName,
            ContentType: fileUpload.mimetype,
        }).promise();

        // return result
        return res.status(200).json({
            code: 200,
            message: 'success',
            data: fileURL
        });
    } catch (e) {
        next(e);
    }
}
import * as express from 'express';
import { Request, Response } from 'express';
import { getProductsPublicById, getProductsVenueById, getProductByVenueId, productsStore } from '../controller/productsController';
import {
    productUploadValidate,
    productMenuUpload
} from '../controller/productUploadController'

// Route Declare
const route = express.Router();

// Route List
route.get('/venue', getProductByVenueId);
route.post('/venue', productsStore);

// route upload image
route.post('/venue/upload', productUploadValidate, productMenuUpload);

// catch all id
route.get('/venue/:id', getProductsVenueById);
route.get('/:id', getProductsPublicById);

// health check api
route.get('/health-check', (req: Request, res: Response) => {
    return res.status(200).json({
        code: 200,
        message: 'success',
        headers: req.headers
    });
})

// export all route
export default route;
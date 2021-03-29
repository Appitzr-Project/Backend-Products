import * as express from 'express';
import { Request, Response } from 'express';
import {
    getProductsPublicById,
    getProductByVenueIdPublic
} from '../controller/productsController';
import {
    getProductsVenueById,
    getProductByVenueId,
    productsStore,
    updateProductById,
    productsStoreValidation,
    productsUpdateValidation,
    deleteProductById
} from '../controller/productVenueController';
import {
    productUploadValidate,
    productMenuUpload
} from '../controller/productUploadController'

// Route Declare
const route = express.Router();

// Route List
route.get('/venue', getProductByVenueId);
route.post('/venue', productsStoreValidation, productsStore);
route.put('/venue/:id', productsUpdateValidation, updateProductById);
route.delete('/venue/:id', deleteProductById);

// route upload image
route.post('/venue/upload', productUploadValidate, productMenuUpload);

// catch all id
route.get('/venue/:id', getProductsVenueById);
route.get('/:id', getProductsPublicById);

// Route Get Products by Id Venue (public)
route.get('/', getProductByVenueIdPublic);

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
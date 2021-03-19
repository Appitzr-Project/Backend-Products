import * as express from 'express';
import { Request, Response } from 'express';
import { getProductsPublicById, getProductsVenueById } from '../controller/productsController';

// Route Declare
const route = express.Router();

// Route List
route.get('/:id', getProductsPublicById);
route.get('/venue/:id', getProductsVenueById);

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
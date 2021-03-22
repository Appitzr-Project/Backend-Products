import * as express from 'express';
import { Request, Response } from 'express';
import { getProductsPublicById, getProductsVenueById, getProductByVenueId, productsStore } from '../controller/productsController';

// Route Declare
const route = express.Router();

// Route List
route.get('/venue/:id', getProductsVenueById);
route.get('/venue', getProductByVenueId);
route.post('/venue', productsStore);
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
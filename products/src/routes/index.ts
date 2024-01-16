import express from "express";
import Products from "../controllers/ProductsController";
const router = express.Router();

router.get("/", Products.index);

router.get("/product", Products.show);

router.post("/", Products.create);

router.put("/product", Products.update);

router.delete("/product", Products.delete);

export default router;

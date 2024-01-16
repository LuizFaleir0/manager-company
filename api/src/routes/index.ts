import express from "express";
import Users from "../controllers/UsersController";
import VerifyToken from "../middlewares/VerifyToken";

const router = express.Router();

router.get("/", VerifyToken, Users.index);

router.get("/user", VerifyToken, Users.show);

router.post("/register", Users.create);

router.delete("/", VerifyToken, Users.delete);

router.post("/login", Users.login);

router.delete("/logout", VerifyToken, Users.logout);

export default router;

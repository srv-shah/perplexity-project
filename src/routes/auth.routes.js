import Router from "express";
import { registerValidator, loginValidator } from "../validators/auth.validators.js";
import { register, verifyEmail, login, getMe } from "../controllers/auth.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc register a new user
 * @access public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, register);


/**
 * @route POST /api/auth/login
 * @desc login a user
 * @access public
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, login);


/***
 * @route GET /api/auth/getMe
 * @desc get logged in user details
 * @access private
 */
authRouter.get("/get-me", authUser, getMe);


/**
 * @route GET /api/auth/verify-email
 * @desc verify user's email address
 * @access public
 * @query { token }
 */
authRouter.get("/verify-email", verifyEmail); 

export default authRouter;
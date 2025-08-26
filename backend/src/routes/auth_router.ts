import express from "express";
import { checkUniqueEmail, checkUniqueUsername, createPendingUser } from "../controllers/auth/registration_form_controller";
import { registerFormValidation } from "../middleware/validate_register_form";
import { verifyEmail } from "../controllers/auth/email_verify_controller";
import { loginLimiter, registrationLimiter } from "../middleware/rate_limiter";
import passport from "passport"
import ssoRouter from "./sso_router"
import { refreshToken } from "../controllers/auth/jwt_controller";
import { authenticateToken } from "../middleware/auth_middleware";
import { logout, validateLogin } from "../controllers/auth/login_controller";
import { forgotPassword } from "../controllers/profile/password_change_controller";

const router = express.Router()

router.route("/form/check-email").get(checkUniqueEmail)

router.get("/form/check-username", checkUniqueUsername)

router.post("/register", registrationLimiter, registerFormValidation, createPendingUser)

router.post("/register-verify", verifyEmail)

router.post("/login", loginLimiter, validateLogin)
router.post("/logout", logout)
// router.post("/login", validateLogin)

router.use("/sso", ssoRouter)

router.post("/refresh-token", refreshToken)

router.post("/forgot-password", forgotPassword)
// router.get("/validate-token", authenticateToken, verifyToken)

export default router

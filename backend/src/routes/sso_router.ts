import passport from "passport"
import express from "express"
// import "../middleware/sso/google_sso_auth"
import { googleSSO } from "../controllers/auth/google_sso_controller"
import "../middleware/sso/github_sso_auth"
// import {ssoCallback } from "../controllers/auth/jwt_controller"

const router = express.Router()

//google
// router.get(
//     "/google",
//     passport.authenticate("google", {scope: ["email", "profile"], prompt: "select_account"})
// )
// router.route("/google/callback")
//     .get(
//         passport.authenticate("google", { 
//             failureRedirect: "/auth/login",
//             session: false
//         }),
//         ssoCallback
//     )

//google compoment based sso
router.post("/google/verify", googleSSO)

//github
// router.get(
//     "/github",
//     passport.authenticate("github", {scope: ["user:email"]})
// )
// router.route("/github/callback")
//     .get(
//         passport.authenticate("github", { 
//             failureRedirect: "/auth/login",
//             session: false
//         }),
//         ssoCallback
//     )

export default router
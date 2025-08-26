import passport from 'passport';
import { Strategy as GitHubStrategy} from 'passport-github2';
import dotenv from "dotenv";
import User from '../../models/user_model';
import crypto from 'crypto';
import bcrypt from 'bcrypt'
import { IUser } from '../../@types/user';

dotenv.config();

type VerifyCallback = (
  error: any,
  user?: Express.User | false | null,
  info?: any
) => void;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/sso/github/callback`,
      scope: ['user:email'] // ensure email is returned
    },
    async (accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback) => {
      try {
        console.log(JSON.stringify(profile.emails[0].value))

        //safety check for emails
        if (!profile._json.email && !profile.emails[0]?.value) {
            return cb(new Error('No email provided by github'));
        }

        // Safely get the email from the profile
        const email = (profile.emails && profile.emails.length > 0)
          ? profile.emails[0].value
          : profile._json.email;
        
        if (!email) {
          return cb(new Error("No email found from GitHub"), null);
        }
        
        let user = await User.findOne({ email: email });
        if (!user) {
            // Generate a secure random password
            const pwdGenerated = crypto.randomBytes(32).toString("hex");
            const hashedPassword = await bcrypt.hash(pwdGenerated, 10);
          
          
            // Use displayName if available, otherwise fall back to username.
            let username = profile.displayName || profile.username;
            //check if there is some user with same username but different email - generate username
            const userSameName = await User.findOne({ username: username})
            if (userSameName) {
                const baseName = username.split(" ")[0]
                const number = crypto.randomInt(1000, 10000)
                username = `${baseName}_${number}`
            }
            
            // Create new user document
            user = await User.create({
                username: username,
                email: email,
                password: hashedPassword, // hashed on pre-save
                registerType: "sso"
            });
        }
        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
    done(null, (user as IUser)._id);

});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

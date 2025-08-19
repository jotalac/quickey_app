import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import { IUser, IUserModel, SocialMediaLink } from "../@types/user.js";

const socialLinksSchema = new Schema<SocialMediaLink>({
    platform: {type: String, required: true},
    url: {type: String, required: true}
}, {_id: false})

const userSchema = new  Schema<IUser>({
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, "Minimun name length is 3 chars"],
      maxlength: [20, "Maximum name length is 3 chars"]
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
        type: String,
        required: [true, "Role error, not set role"],
        default: "user"
    },
    registerType : {
        type: String,
        required: true,
        default: "local"
    },
    profilePicture: {
        type: String,
        default: null,
        required: false
    },
    bio: {
        type: String,
        default: "",
        required: true,
        maxlength: [1000, "Maximum description length is 1000 characters"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    socialLinks: {
        type: [socialLinksSchema],
        required: false,
        default: []
    }
})


// Instance method to compare candidate password with the user's hashed password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

//find user by username
userSchema.statics.findByUsername = function (username: string) {
    return this.findOne({ username })
}

//find user by email
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email })
}

// Virtual property to return a simplified user profile
// userSchema.virtual('profile').get(function () {
//     return {
//         id: this._id,
//         username: this.username,
//         email: this.email,
//         registerType: this.registerType,
//         profilePicture: this.profilePicture,
//         createdAt: this.createdAt
//     };
// });

const User = mongoose.model<IUser, IUserModel>("User", userSchema)

export default User;
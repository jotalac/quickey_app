import {Document, Model} from "mongoose"

export interface SocialMediaLink {
    platform: string,
    url: string,
}

export interface IUser extends Document {
    _id: string,
    username: string,
    email: string,
    password: string,
    role: "user" | "admin",
    registerType: "local" | "sso",
    profilePicture: string | null,
    bio: string | null
    createdAt: Date
    socialLinks: SocialMediaLink[]

    
    comparePassword(candidatePassword: string): Promise<boolean>, // Add this
    // Add virtual property
    // profile: {
    //     id: string;
    //     username: string;
    //     email: string;
    //     registerType: string;
    //     profilePicture: string | null;
    //     bio: string | null,
    //     createdAt: Date;
    // };
}

export interface IUserModel extends Model<IUser> {
    findByUsername(username: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
}
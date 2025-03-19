import mongoose, {Document} from "mongoose";

export interface UserType extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    full_name: string;
    password: string;
    bio: string;
    website: string;
    profile_image: string;
    notifications:  mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    followings: mongoose.Types.ObjectId[];
    search_results: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema<UserType>({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    full_name: {type: String, required: true},
    password: {type: String, required: true},
    bio: {type: String, default: "", maxlength: 180},
    website: {type: String, maxlength: 120},
    profile_image: {type: String, default: 'https://res.cloudinary.com/dkmunyorn/image/upload/v1737282562/profiles/cxjlx87qkz06ucag1ny4.png'},
    notifications: [{type: mongoose.Types.ObjectId, ref: "Notification"}],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    followings: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    search_results: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
});

const User = mongoose.model<UserType>("User", UserSchema);

export default User;
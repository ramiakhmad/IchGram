import User, {UserType} from "../db/models/User";
import {Request, Response} from "express";
import mongoose from "mongoose";
import Notification from "../db/models/Notification";
import {cloudinary} from "../config/cloudinary";

export const getUserByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        if (!req.user) return;
        let user;
        if (username === req.user.username) {
            user = await User.find({username}).select('-password')
                .populate({
                    path: 'followings',
                    select: 'profile_image username _id',
                }).populate({
                    path: 'followers',
                    select: 'profile_image username _id',
                }).populate({
                    path: 'posts',
                    populate: [
                    {
                        path: 'photos',
                        select: 'url'
                    }
                ]
                }).populate({
                    path: 'notifications',
                    options: { sort: { createdAt: -1 }, limit: 10 },
                    populate: [
                        {
                            path: 'post',
                            populate: [
                                {
                                    path: 'photos',
                                    select: 'url'
                                }
                            ]
                        },
                        {
                            path: 'comment',
                            select: 'author',
                            populate: [
                                {
                                    path: 'post',
                                    populate: [
                                        {
                                            path: 'photos',
                                            select: 'url'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            path: 'actionMaker',
                            select: 'username profile_image',
                        },
                    ]
                }).populate('search_results', 'username profile_image');
        } else {
            user = await User.find({username}).select('-password')
                .populate({
                    path: 'followings',
                    select: 'profile_image username _id',
                }).populate({
                    path: 'followers',
                    select: 'profile_image username _id',
                }).populate({
                    path: 'posts',
                    populate: [
                        {
                            path: 'photos',
                            select: 'url'
                        }
                    ]
                })
        }
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        res.status(200).send(user);
    } catch (error) {
        console.error('Error fetching a user: ', error);
        res.status(500).send('Error fetching a user');
    }
};

export const searchUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find({}, 'username profile_image');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error searching users: ', error);
        res.status(500).send('Error searching users');
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        // Check if user exists
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        const { bio, website, new_username } = req.body;

        // Check if new username already exists
        if (new_username && new_username !== username) {
            const newUsernameUser = await User.findOne({ username: new_username });
            if (newUsernameUser) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
            user.username = new_username;
        }

        // Update bio and website
        if (website && website.length <= 120) {
            user.website = website;
        }
        if (bio && bio.length <= 150) {
            user.bio = bio;
        }

        // Upload new profile image to Cloudinary
        const file = req.file;
        if (!file) return;
        const uploadedImage = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'profiles', // Optional folder in Cloudinary
                    public_id: `${username}-profile`, // Optional custom public ID
                    overwrite: true, // Overwrite existing image for the user
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (!result) return;
                        resolve(result.secure_url); // Get the secure URL
                    }
                }
            ).end(file.buffer); // Upload the file buffer
        });

        if (user.profile_image !== uploadedImage) {
            user.profile_image = uploadedImage;
        }

        // Save updated user
        const updatedUser = await user.save();
        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('Error updating a user profile: ', error);
        res.status(500).send('Error updating a user profile');
    }
};


export const followUser = async (req: Request, res: Response) => {
    try {
        const profile = (req as any).profile;
        const userProfile = (req as any).userProfile;
        const followed = (req as any).followed;

        if (followed) {
            res.status(404).send('Already followed');
            return;
        }

        profile.followers.push(userProfile._id);
        userProfile.followings.push(profile._id);
        const newNotification = await Notification.create({
            user: profile._id,
            actionMaker: userProfile._id,
            type: 'started following you'
        });
        profile.notifications.push(newNotification._id);
        await profile.save();
        await userProfile.save();
        res.status(201).send({
            _id: profile._id,
            profile_image: profile.profile_image,
            username: profile.username,
        });
    } catch (error) {
        console.error('Error following a user: ', error);
        res.status(500).send('Error following a user');
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const profile = (req as any).profile;
        const userProfile = (req as any).userProfile;
        const followed = (req as any).followed;

        if (!followed) {
            res.status(404).send('Following not found');
            return;
        }

        profile.followers = profile.followers.filter((f: mongoose.Types.ObjectId) => !f._id.equals(userProfile._id));
        userProfile.followings = userProfile.followings.filter((f: mongoose.Types.ObjectId) => !f._id.equals(profile._id));
        await profile.save();
        await userProfile.save();
        res.status(200).send({
            _id: profile._id,
            profile_image: profile.profile_image,
            username: profile.username,
        });
    } catch (error) {
        console.error('Error deleting a following: ', error);
        res.status(500).send('Error deleting a following');
    }
};

export const addUserToSearchResults = async (req: Request, res: Response) => {
    try {
        const {username} = req.body;
        if (!username || !req.user) {
            res.status(400).send('Users must be provided');
            return;
        }
        const user: UserType | null = await User.findById(req.user.id);
        const searchedUser: UserType | null = await User.findOne({username});
        if (!user || !searchedUser) {
            res.status(404).send('User not found');
            return;
        }
        user.search_results.push(searchedUser._id);
        await user.save();
        res.status(200).send('User added to search results');
     } catch (error) {
        console.error('Error adding user to search results');
        res.status(500).send('Error adding user to search results');
    }
}
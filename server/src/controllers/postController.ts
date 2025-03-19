import User, {UserType} from "../db/models/User";
import Post from "../db/models/Post";
import { Request, Response } from 'express';
import multer from "multer";
import Like from "../db/models/Like";
import mongoose from "mongoose";
import Notification from "../db/models/Notification";
import {MulterRequest} from "../middlewares/uploadImage";
import Photo from "../db/models/Photo";
import {cloudinary} from "../config/cloudinary";
import sharp from "sharp";

// Create a post with Cloudinary photo uploads
export const createPost = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;

        // Validate request data
        if (!content) {
            res.status(400).send('Content is required');
            return;
        }
        if (!req.user) {
            res.status(401).send('User not authenticated');
            return;
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).send('User not found');
            return
        }

        if (!req.files || (req as MulterRequest).files.length === 0) {
            res.status(400).send('No files uploaded');
            return;
        }

        const uploadedPhotos = await Promise.all(
            (req as MulterRequest).files.map(async (file) => {
                try {
                    // Get image metadata
                    const { width, height } = await sharp(file.buffer).metadata();
                    if (!width || !height) return;

                    let transformation = {}; // Default to no transformation

                    // Determine aspect ratio
                    if (width / height >= 1.5) {
                        // Width is much larger -> Apply 16:9
                        transformation = { aspect_ratio: "16:9", crop: "fill", gravity: "auto" };
                    } else if (height / width >= 1.5) {
                        // Height is much larger -> Apply 3:4
                        transformation = { aspect_ratio: "3:4", crop: "fill", gravity: "auto" };
                    }

                    return new Promise<string>((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "posts",
                                transformation: [transformation], // Apply transformation only if necessary
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    if (!result) return;
                                    resolve(result.secure_url); // Return uploaded URL
                                }
                            }
                        ).end(file.buffer); // Upload the buffer data
                    });
                } catch (error) {
                    console.error("Image processing error:", error);
                    return null;
                }
            })
        );

        // Save uploaded photo URLs to the `Photo` collection
        const photoDocuments = await Promise.all(
            uploadedPhotos.map(async (url) => {
                const photo = new Photo({
                    url: url,
                    post: null, // Assign post ID after creating the post
                });
                await photo.save();
                return photo._id; // Return the ID for linking with the post
            })
        );

        // Create the post with linked photo IDs
        const post = await Post.create({
            photos: photoDocuments, // Array of photo ObjectIds
            content,
            author: user._id,
        });

        // Update the `post` field in each `Photo` document
        await Promise.all(
            photoDocuments.map(async (photoId) => {
                await Photo.findByIdAndUpdate(photoId, { post: post._id });
            })
        );

        // Add the post to the user's list of posts
        user.posts.push(post._id);
        await user.save();

        // Populate photos before sending the response
        await post.populate('photos', 'url');

        res.status(201).send(post);
    } catch (error) {
        console.error('Error creating post: ', error);
        if (error instanceof multer.MulterError) {
            res.status(400).send(error.message); // Handle Multer errors
        } else {
            res.status(500).send('Error creating post');
        }
    }
};


export const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            res.status(404).send('Id must be provided');
            return;
        }
        const post= await Post.findById(postId).populate({
            path: 'author', // Populate the author field
            select: 'profile_image username followers', // Include only photo and followers fields
        }).populate('likes')
            .populate({
            path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'profile_image username',
                    },
                    {
                        path: 'likes',
                        select: 'user',
                    }
                ]
        }).populate('photos', 'url');
        res.status(200).send(post);
    } catch (error) {
        console.error('Error getting post by id: ', error);
        res.status(500).send('Error getting post by id');
    }
};

export const getRandomPosts = async (req: Request, res: Response) => {
    try {
        const {count} = req.query;
        const countNumber = Number(count);
        const posts = await Post.aggregate().sample(countNumber);
        const populatedPosts = await Post.populate(posts, [{ path: 'author', select: 'username' },
            { path: 'photos', select: 'url' }]);

        res.status(200).send(populatedPosts);
    } catch (error) {
        console.error('Error getting posts: ', error);
        res.status(500).send('Error getting posts');
    }
};

export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            res.status(400).send('Id must be provided');
            return;
        }
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).send('Post not found');
            return;
        }
        if (!req.user) {
            res.status(401).send('User is not authorized');
            return;
        }
        const receiver = await User.findById(post.author);
        if (!receiver) {
            res.status(404).send('User is not found');
            return;
        }
        const newLike = await Like.create({
            user: req.user.id,
            post: postId
        });
        await newLike.save();
        const newNotification = await Notification.create({
            user: post.author,
            actionMaker: req.user.id,
            post: postId,
            type: 'liked your post'
        });
        post.likes.push(newLike._id);
        post.like_count += 1;
        await post.save();
        receiver.notifications.push(newNotification._id);
        await receiver.save();
        res.status(201).send('Like for post created successfully');
    } catch (error) {
        console.error('Error adding like to a post: ', error);
        res.status(500).send('Error adding like to a post');
    }
};

export const unLikePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if(!post || !req.user) {
            res.status(404).send('Post or user not found');
            return;
        }

        const like = await Like.findOne({ user: req.user.id, post: post._id });
        if (!like) {
            res.status(404).send('Like not found');
            return;
        }

        await Like.deleteOne({ _id: like._id });

        post.likes = post.likes.filter((likeId: mongoose.Types.ObjectId) => likeId.toString() !== like._id.toString());
        post.like_count -= 1;
        await post.save();
        res.status(200).send('Like deleted successfully');
    } catch (error) {
        console.error('Error unliking a post: ', error);
        res.status(500).send('Error unliking a post');
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const post = (req as any).post;
        if(!post || !req.user) return;

        await Post.deleteOne({ _id: post._id });
        res.status(200).send(post);

    } catch (error) {
        console.error('Error deleting a post: ', error);
        res.status(500).send('Error deleting a post');
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const post = (req as any).post;
        if(!post || !req.user) return;

        const {content} = req.body;
        if (!content) {
            res.status(401).send('Content be provided');
        }
        post.content = content;
        post.save();
        res.status(200).send(post);
    } catch (error) {
        console.error('Error updating a post: ', error);
        res.status(500).send('Error updating a post');
    }
};

export const getFollowedPosts = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(404).send('User is not authorized');
            return;
        }
        const userId = req.user.id; // Assume this is set by authentication middleware
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;

        // Find the current user's following list
        const user: UserType = await User.findById(userId).select("followings");
        if (!user) {
            res.status(404).send("User not found");
            return
        }

        // Fetch posts from followed users
        const posts = await Post.find({ author: { $in: user.followings } })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("author", "username profile_image")
            .populate('likes', 'user')
            .populate('photos', 'url');

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Server error");
    }
};
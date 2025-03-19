import {Request, Response} from "express";
import Post from "../db/models/Post";
import Comment from "../db/models/Comment";
import Like from "../db/models/Like";
import mongoose from "mongoose";
import User from "../db/models/User";
import Notification from "../db/models/Notification";

export const addCommentToPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            res.status(400).send('Id must be provided');
            return;
        }
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).send('Post now found');
            return;
        }
        const { content } = req.body;
        if (!content) {
            res.status(400).send('Content is required');
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
        const newComment = await Comment.create({
            post: postId,
            author: req.user.id,
            content: content
        });
        post.comments.push(newComment._id);
        await newComment.save();

        const newNotification = await Notification.create({
            user: post.author,
            actionMaker: req.user.id,
            post: postId,
            type: 'commented on your post'
        });
        receiver.notifications.push(newNotification._id);
        await post.save();
        await receiver.save();
        const populatedComment = await newComment.populate({
            path: 'author',
            select: 'profile_image username',
        });
        res.status(201).send(populatedComment);
    } catch (error) {
        console.error('Error uploading comment: ', error);
        res.status(500).send('Error uploading comment');
    }
};

export const likeComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        if (!commentId) {
            res.status(400).send('Id must be provided');
            return;
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).send('Post now found');
            return;
        }
        if (!req.user) {
            res.status(401).send('User is not authorized');
            return;
        }
        const newLike = await Like.create({
            user: req.user.id,
            comment: commentId
        });
        const receiver = await User.findById(comment.author);
        if (!receiver) {
            res.status(404).send('User is not found');
            return;
        }

        const newNotification = await Notification.create({
            user: comment.author,
            actionMaker: req.user.id,
            comment: comment._id,
            type: 'liked your comment'
        });

        await newLike.save();
        comment.likes.push(newLike._id);
        comment.like_count += 1;
        await comment.save();
        receiver.notifications.push(newNotification._id);
        await receiver.save();
        res.status(201).send('Like for comment created successfully');
    } catch (error) {
        console.error('Error adding like to a comment: ', error);
        res.status(500).send('Error adding like to a comment');
    }
};

export const unLikeComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).send('Post now found');
            return;
        }

        if (!req.user || !(new mongoose.Types.ObjectId(req.user.id).equals(comment.author))) {
            res.status(401).send('User is not authorized');
            return;
        }

        const like = await Like.findOne({ user: req.user.id, comment: comment._id });
        if (!like) {
            res.status(404).send('Like not found');
            return;
        }

        await Like.deleteOne({ _id: like._id });

        comment.likes = comment.likes.filter(likeId => likeId.toString() !== like._id.toString());
        comment.like_count -= 1;
        await comment.save();
        res.status(200).send('Like deleted successfully');
    } catch (error) {
        console.error('Error unliking a comment: ', error);
        res.status(500).send('Error unliking a comment');
    }
};
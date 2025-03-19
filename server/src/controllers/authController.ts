import { Request, Response } from 'express';
import User, {UserType} from "../db/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {TokenPayload} from "../types/express";

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password) {
            res.status(400).send('Username or email and password is required');
            return;
        }
        // Check if user exists
        const user: UserType | null = await User.findOne({$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]});
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            res.status(401).send('Wrong password or username');
            return;
        }
        if (process.env.JWT_KEY) {
            const info: TokenPayload = {username: user.username, id: user._id.toString()};
            const token = jwt.sign(info, process.env.JWT_KEY, {expiresIn: "1h"});
            res.cookie('token', token, {
                httpOnly: true, // Prevent access to cookies via JavaScript
                secure: true,  // Set to false to allow sending cookies over HTTP
                sameSite: 'none', // You can adjust this based on your requirements
                maxAge: 3600 * 1000, // 1 hour in milliseconds
                path: "/",
            });
            res.status(200).json({
                message: 'Successfully logged in with token',
                data: {
                    username: user.username,
                    id: user.id,
                    profile_image: user.profile_image
                }
            });
        } else {
            res.status(401).send('Something went wrong');
        }
    } catch (error) {
        console.error('Error registering a user: ', error);
        res.status(500).send('Error logging in');
    }
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, fullName, email, password } = req.body;
        if (!username || !password || !email || !fullName) {
            res.status(400).send('Username, email, full name and password are required');
        }
        // Check if user exists
        const user = await User.findOne({username: username});
        if (user) {
            res.status(404).send('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, full_name: fullName, email, password: hashedPassword });
        res.status(200).send('Successfully registered!');
    } catch (error) {
        console.error('Error registering a user: ', error);
        res.status(500).send('Error registering');
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { usernameOrEmail } = req.body;
        if (!usernameOrEmail) {
            res.status(400).send('Username or email is required');
        }
        // Check if user exists
        const user = await User.findOne({$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]});
        if (!user) {
            res.status(404).send('User not found');
        }

        // Create a transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
            auth: {
                user: process.env.EMAIL, // Replace with your email
                pass: process.env.EMAIL_KEY, // Replace with your email password or app password
            },
        });

        // Email options
        if (user) {
            const mailOptions = {
                from: 'rami.akhmad@gmail.com', // Sender address
                to: user.email, // Receiver address
                subject: 'Reset password', // Subject line
                text: '<b>Reset your password - </b> <a href="/">Link</a>', // Plain text body
            };
            const info = await transporter.sendMail(mailOptions);
            res.status(201).json(
                {
                    msg: "Email sent",
                    info: info.messageId,
                    preview: nodemailer.getTestMessageUrl(info)
                }
            );
        }
    } catch (error) {
        console.error('Error registering a user: ', error);
        res.status(500).send('Error registering');
    }
};


export const checkAccessToken = (req: Request, res: Response) => {
    if (req.user) {
        res.status(200).json({message: 'Token is valid', username: req.user.username});
    } else {
        res.status(200).json({message: 'Token is not valid'});
    }
}
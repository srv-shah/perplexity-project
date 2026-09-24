import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res){
    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ {email}, {username}]
    })

    if(isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this Username already exists.",
            success: false,
            err: "User already exists"
        })
    }


    const user = await userModel.create({
        username,
        email,
        password
    })

    const emailVarificationToken = jwt.sign(
        { 
            email: user.email, 
        },
        process.env.JWT_SECRET
    );

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity",
        html: `
                <p>Hii ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>, we're excited to have you on board!</p>
                <p>To get started, please verify your email address by clicking the link below:</p>
                <p><a href="http://localhost:3000/api/auth/verify-email?token=${emailVarificationToken}">Verify Email</a></p>
                <p>If you did not create an account, please ignore this email.</p>
                <p> Best regards, <br> The Perplexity Team</p>
            `
    })

    res.status(201).json({
        message: "User registered successfully.",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function login(req, res){
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    console.log("Entered password:", password);
    console.log("Stored password:", user.password);

    if(!user){
        return res.status(400).json({
            message: "User with this email does not exist.",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        return res.status(400).json({
            message: "Invalid email or password.",
            success: false,
            err: "Incorrect password"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message: "Please verify your email address before logging in.",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign(
        { 
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: "7d" 
        }
    );

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully.",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

export async function getMe(req, res){

    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if(!user){
        return res.status(404).json({
            message: "User not found.",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User detail fetched successfully.",
        success: true,
        user
    })
}


export async function verifyEmail(req, res){
    const {token} = req.query;

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({email: decoded.email});

        if(!user) {
            return res.status(400).json({
                message: "Invalid token.",
                success: false,
                err: "user not found"
            })
        }

        user.verified = true;

        await user.save();

        const html = 
        `
            <h1>Email Verified Successfully</h1>
            <p>Thank you for verifying your email address. You can now log in to your account.</p>
            <a href="http://localhost:3000/login"> Go to login <a/>
        `
        return res.send(html);

    } catch(err) {
        return res.status(400).json({
            message: "Invalid or expired token.",
            success: false,
            err: err.message
        })
    }

    
    
}
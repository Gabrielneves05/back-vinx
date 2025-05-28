const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "7d" 
    });
}

// Register an user and sign in
const register = async (req, res) => {
    const { name, email, password } = req.body;

    // check if user already exists
    const user = await User.findOne({ email });

    if(user) {
        res.status(422).json({errors: ["Please use another email."]});

        return;
    }

    // generate hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = await User.create({
        name,
        email,
        password: hashPassword,
    });

    // if user was created successfully, return the token
    if(!newUser) {
        res.status(422).json({errors: ["There was an error, please try again later."]});

        return;
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id),
    });
}

// Sign user in
const login = async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    // check if user exists
    if(!user) {
        res.status(404).json({errors: ["User not found."]});

        return;
    }

    // check if password matches
    if(!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({errors: ["Incorrect password."]});

        return;
    }

    // Return user with token
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id),
    });
}

// Get current logged in user
const getCurrentUser = async (req, res) => {
    const user = req.user;

    res.status(200).json(user);
}

// Update an user
const update = async (req, res) => {
    const { name, password, bio } = req.body;

    let profileImage = null;

    if(req.file) {
        profileImage = req.file.filename;
    }

    const reqUser = req.user;

    const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password");

    if(name) {
        user.name = name;
    }

    if(password) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        user.password = hashPassword;
    }

    if(profileImage) {
        user.profileImage = profileImage;
    }

    if(bio) {
        user.bio = bio;
    }

    await user.save();

    res.status(200).json(user);
}

// Get user by id
const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: ["Invalid user ID."] });
    }

    try {
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ errors: ["User not found."] });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ errors: ["Something went wrong."] });
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById
}
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
    register,
    login,
    getCurrentUser,
}
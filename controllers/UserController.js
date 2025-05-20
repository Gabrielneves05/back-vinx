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
const register = async(req, res) => {
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

module.exports = {
    register,
}
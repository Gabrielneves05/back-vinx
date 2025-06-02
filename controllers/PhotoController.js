const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const image = req.file.filename;

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    // create photo
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name,
    });

    // if photo was created successfully, return data
    if(!newPhoto) {
        res.status(422).json({errors: ["There was an error, please try again later."]});

        return;
    }

    res.status(201).json(newPhoto);
}

// Remove a photo from database
const deletePhoto = async (req, res) => {
    const { id } = req.params;

    const reqUser = req.user;

    try {
        if(!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ errors: ["Invalid photo ID."]});
            
            return;
        }

        const photo = await Photo.findById(id);

        // check if photo exists
        if(!photo) {
            res.status(404).json({errors: ["Photo not found."]});

            return;
        }

        // check if photo belongs to user
        if(!photo.userId.equals(reqUser._id)) {
            res.status(422).json({errors: ["There was an error, please try again later."]});

            return;
        }

        await Photo.findByIdAndDelete(photo._id);

        res.status(200).json({id: photo._id, message: "Photo deleted successfully."});
    } catch (error) {
        console.log(error);
        res.status(500).json({errors: ["An unexpected error occurred, please try again later."]});

        return;
    }
}

// Get all photos
const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();

        if (!photos || photos.length === 0) {
            return res.status(404).json({ message: "There are no photos available." });
        }

        return res.status(200).json(photos);
    } catch (error) {
        return res.status(500).json({ message: "An unexpected error occurred, please try again later." });
    }
};

// Get user photos
const getUserPhotos = async (req, res) => {
    const { id } = req.params;

    const photos = await Photo.find({ userId: id }).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);
}

// Get photos by id
const getPhotoById = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ errors: ["Invalid photo ID."]});
        
        return;
    }

    const photo = await Photo.findById(id);

    // check if photo exists
    if(!photo) {
        res.status(404).json({errors: ["Photo not found."]});

        return;
    }

    res.status(200).json(photo);
}

// Upate a photo
const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
        res.status(404).json({ errors: ["Photo not found."] });

        return;
    }

    // check if photo belongs to user
    if (!photo.userId.equals(reqUser._id)) {
        res.status(422).json({ errors: ["There was an error, please try again later."] });

        return;
    }

    if (title) {
        photo.title = title;
    }

    await photo.save();

    res.status(200).json({ photo, message: "Photo updated successfully." });
}

// Like functionality
const likePhoto = async (req, res) => {
    const { id } = req.params;

    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
        res.status(404).json({ errors: ["Photo not found."] });

        return;
    }

    // check if user already liked photo
    if (photo.likes.includes(reqUser._id)) {
        res.status(400).json({ errors: ["You already liked this photo."] });

        return;
    }

    // Put user id in photo likes array
    photo.likes.push(reqUser._id);

    await photo.save();

    res.status(200).json({ 
        photoId: id, 
        userId: reqUser._id, 
        message: "Photo liked successfully." 
    });
}

// Comment functionality
const commentPhoto = async (req, res) => {
    const { id } = req.params;

    const { comment } = req.body;

    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
        res.status(404).json({ errors: ["Photo not found."] });

        return;
    }

    // put comment in the array comments
    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id,
    }

    photo.comments.push(userComment);

    await photo.save();

    res.status(200).json({
        comment: userComment,
        message: "Comment added successfully.",
    });
}

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
}
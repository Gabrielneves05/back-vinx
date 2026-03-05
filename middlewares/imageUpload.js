const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Destination to store the images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "";

        if(req.baseUrl.includes("users")) {
            folder = "users";
        } else if(req.baseUrl.includes("photos")) {
            folder = "photos";
        }

        const uploadPath = path.join(__dirname, "..", "uploads", folder);

        try {
            fs.mkdirSync(uploadPath, { recursive: true });
        } catch (err) {
            return cb(err);
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            // upload only png and jpg formats
            return cb(new Error("Somente são permitidos arquivos png e jpg."), false);
        }

        cb(undefined, true);
    }
});

module.exports = { imageUpload };
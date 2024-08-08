const multer = require('multer');
var admin = require("firebase-admin");
const firebaseConfig = require('../config/firebaseConfig');

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${process.env.project_id}.firebaseio.com`,
    storageBucket: `gs://${process.env.project_id}.appspot.com`
  });

const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMiddleware = upload.single('image');

const uploadFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: req.file.mimetype,
            cacheControl: "public, max-age=31536000"
        },
        public: true,
        gzip: true
    });

    blobStream.on("error", err => {
        return res.status(500).json({ error: "Unable to upload image" });
    });

    blobStream.on("finish", async () => {
        await blob.makePublic();

        req.file.firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        next();
    });

    blobStream.end(req.file.buffer);
};

module.exports = { uploadMiddleware, uploadFile };

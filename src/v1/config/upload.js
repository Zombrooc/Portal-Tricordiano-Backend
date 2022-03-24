const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3-transform");
const createError = require("http-errors");
const sharp = require("sharp");

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "..", "tmp", "uploads"));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        file.key = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  // s3: multerS3({
  //   s3: new aws.S3(),
  //   bucket: process.env.BUCKET_NAME,
  // contentType: multerS3.AUTO_CONTENT_TYPE,
  // acl: "public-read",
  //   key: (req, file, cb) => {
  //     crypto.randomBytes(16, (err, hash) => {
  //       if (err) cb(err);

  //       const fileName = `${hash.toString("hex")}-${file.originalname}`;

  //       cb(null, fileName);
  //     });
  //   },
  //   shouldTransform: true,
  //   transforms: [
  //     {
  //       id: "original",
  //       transform: function (req, file, cb) {
  //         cb(
  //           null,
  // sharp()
  //   .resize(1080, 1080)
  //   .toFormat("jpeg")
  //   .jpeg({ quality: 70 })
  //   .toBuffer()
  //   .then((data) => {
  //     cb(null, data);
  //   })
  //         );
  //       },
  //     },
  //   ],
  // }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    shouldTransform: true,
    transforms: [
      {
        id: "original",
        transform: function (req, file, cb) {
          cb(null, sharp().resize(1080).toFormat("jpeg").jpeg({ quality: 70 }));
        },

        key: (req, file, cb) => {
          crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);

            const fileName = `${hash.toString("hex")}-${file.originalname}`;

            cb(null, fileName);
          });
        },
      },
    ],
  }),
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new createError(400, "Formato de arquivo inválido."));
    }
  },
};

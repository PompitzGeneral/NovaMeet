import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
aws.config.loadFromPath("s3config.json");

let s3 = new aws.S3();

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "novameet",
  acl: "public-read",
  key: function(req, file, cb){
    cb(null, Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
  }
});

export const userImageUpload = multer({
    dest: "/userImages/",
    limits: {
        fileSize: 100000000,
    },
    storage: s3ImageUploader
});

export const roomImageUpload = multer({
    dest: "/roomImages/",
    limits: {
        fileSize: 100000000,
    },
    storage: s3ImageUploader
});

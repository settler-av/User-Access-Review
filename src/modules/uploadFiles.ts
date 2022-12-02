import multer from "multer";
import {v4 as uuidv4} from "uuid";


const storageAgenda = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/data/agenda");
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
 });
 
const uploadAgenda = multer({
    storage: storageAgenda,
    fileFilter: (req, file, cb) => {
       console.log({file});
        if (file && file.mimetype == "application/pdf") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png files are allowed!'));
        }
    }
});

export default {uploadAgenda};

import os from 'os';
import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'

const imageFilter = (
	request: Request,
	file: Express.Multer.File,
	callback: FileFilterCallback
): void => {
	if (
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg'
	) {
			callback(null, true)
	} else {
			callback(null, false)
	}
}

const storage = multer.diskStorage({
	destination: os.tmpdir(), 
	filename: (req, file, callback) => callback(null, `${file.originalname}`)
});

const uploadImageConfig = multer({ 
	storage: storage, 
	limits: { fileSize: 1024 * 1024 }, //1024 * 1024 = 1mb
	fileFilter: imageFilter
}).single('image_file');

export const uploadImageProfile = (req: Request, res: Response, next: NextFunction) => {

	uploadImageConfig(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			// A Multer error occurred when uploading.
			res.status(400).send({message: 'Bad request'});
		} else if (err) {
			// An unknown error occurred when uploading.
			res.status(500).send({message: 'Internal error'});
		} else {
			// Everything went fine.
			next();
		}
	})

}

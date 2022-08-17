import { join, extname } from "path";
import { writeFile } from "fs";
import multer from "multer";
import { BadRequestError } from "../lib/errors/BadRequest";
import { randomBytes } from "crypto";
//=========================================================================

class UploadService {
  static uploadInDisk = (
    savingDir: string,
    filename: string = null,
    filters: { mimetypes?: string[]; extensions?: string[] } = null,
    maxSize: number = 50
  ) => {
    //-----------------------------------------------------------
    const storage = multer.diskStorage({
      destination: function (req: Request, file, cb) {
        cb(null, savingDir);
      },
      filename: function (req: Request, file, cb) {
        cb(
          null,
          filename ||
            Date.now().toString() +
              "-" +
              randomBytes(2).toString("hex") +
              "-" +
              file.originalname
        );
      },
    });
    //-----------------------------------------------------------
    const filter = UploadService.filterFn(filters);
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return multer({
      storage: storage,
      fileFilter: filter,
      limits: { fileSize: 1024 * 1024 * maxSize /*in bytes => mb*/ },
    });
  };

  static uploadInMemory = (
    filters: IFileFilter = null,
    maxSize: number = 50
  ) => {
    //-----------------------------------------------------------

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return multer({
      storage: multer.memoryStorage(),
      fileFilter: UploadService.filterFn(filters),
      limits: { fileSize: 1024 * 1024 * maxSize /*in bytes => mb*/ },
    });
  };

  static saveInDir(file: any, dir: string) {
    const savingLocation =
      dir + file.originalname + "-" + Date.now() + extname(file.originalname);
    writeFile(savingLocation, file.buffer, (err) => {
      if (err) throw err;
    });
    return savingLocation;
  }

  static filterFn(filters: IFileFilter) {
    return (req: Request, file: any, cb: any) => {
      let isValid = filters === null;
      if (filters && filters.mimetypes) {
        filters.mimetypes.forEach((ft) => {
          if (file.mimetype.startsWith(ft)) isValid = true;
        });
      }
      if (filters && filters.extensions) {
        const ext = extname(file.originalname);
        if (filters.extensions.includes(ext)) isValid = true;
      }
      if (isValid) cb(null, true);
      else cb(new BadRequestError("Invalid file type"), false);
    };
  }
}

interface IFileFilter {
  mimetypes?: string[];
  extensions?: string[];
}

export const uploadFile = (req: any, res: any, next: any) => {
  const _multer = UploadService.uploadInDisk(
    join(__dirname, "../../uploads/blast-files"),
    null,
    { extensions: [".fsa", ".fasta", ".fna", ""] },
    2000
  ).single("file");
  _multer(req, res, (err) => {
    if (err) next(new BadRequestError(err.message));
    if (!req.file) next(new BadRequestError("Fasta file is required."));
    next();
  });
};

export const uploadFileInMemory = (req: any, res: any, next: any) => {
  const _multer = UploadService.uploadInMemory(null, 2000).single("file");
  _multer(req, res, (err) => {
    if (err) next(new BadRequestError(err.message));
    if (!req.file) next(new BadRequestError("file is required."));
    next();
  });
};

export const uploadManyInMemory = (req: any, res: any, next: any) => {
  const _multer = UploadService.uploadInMemory(null, 2000).array("files");
  _multer(req, res, (err) => {
    if (err) next(new BadRequestError(err.message));
    if (!req.files) next(new BadRequestError("files are required."));
    next();
  });
};

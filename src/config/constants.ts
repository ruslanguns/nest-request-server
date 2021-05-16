import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const FILESYSTEM = 'filesystem';

/**
 * Multer configuration for image Files
 */
export const IMAGE_FILE_OPTIONS: MulterOptions = {
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new BadRequestException(`Only image files are allowed`), false);
    }
    return cb(null, true);
  },
};

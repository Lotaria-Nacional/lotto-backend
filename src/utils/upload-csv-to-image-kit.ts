import fs from 'fs';
import path from 'path';
import imageKit from '../lib/image-kit';

async function uploadCsvToImageKit(filePath: string) {
  const fileName = path.basename(filePath);
  const fileData = fs.createReadStream(filePath);

  const response = await imageKit.files.upload({
    file: fileData,
    fileName,
    folder: '/imports',
  });

  return response.url;
}

export default uploadCsvToImageKit;

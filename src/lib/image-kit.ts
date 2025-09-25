import ImageKit from '@imagekit/nodejs';
import env from '../constants/env';

const imageKit = new ImageKit({
  privateKey: env.IMAGE_KIT_PRIVATE_KEY,
});

export default imageKit;

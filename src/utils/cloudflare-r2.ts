import axios from 'axios';
import env from '../constants/env';

export class CloudflareR2 {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.CLOUDFLARE_R2_BASEURL || '';
  }

  private toArrayBuffer(data: Buffer | ArrayBuffer): ArrayBuffer {
    if (data instanceof ArrayBuffer) return data;
    return new Uint8Array(data).buffer;
  }

  private getUrlWithKey(key: string) {
    return `${this.baseUrl}/${key}`;
  }

  async PUT(file: Buffer | ArrayBuffer, key: string, contentType: string) {
    const arrayBuffer = this.toArrayBuffer(file);
    const response = await axios.put(this.getUrlWithKey(key), arrayBuffer, {
      headers: { 'Content-Type': contentType, 'Content-Length': arrayBuffer.byteLength },
    });

    return response.data;
  }

  async GET(key: string) {
    const response = await axios.get(this.getUrlWithKey(key), { responseType: 'arraybuffer' });
    return {
      data: response.data,
      contentType: response.headers['content-type'] || 'application/octet-stream',
    };
  }

  async DELETE(key: string) {
    const response = await axios.delete(this.getUrlWithKey(key));
    return response.data;
  }
}

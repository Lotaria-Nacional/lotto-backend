import axios from 'axios';
import env from '../constants/env';

export class CloudflareR2 {
  private baseUrl: string;

  constructor() {
    const baseUrl = env.CLOUDFLARE_R2_BASEURL;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private toArrayBuffer(data: Buffer | ArrayBuffer): ArrayBuffer {
    if (data instanceof ArrayBuffer) return data;
    return new Uint8Array(data).buffer;
  }

  private getUrlWithKey(key: string) {
    return `${this.baseUrl}/files/${key}`;
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
    return response.data;
  }

  async DELETE(key: string) {
    const response = await axios.delete(this.getUrlWithKey(key));
    return response.data;
  }
}

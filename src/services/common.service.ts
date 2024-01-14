import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CommonService {
  mapper<Source, Destination>(source: Source, destination: any): Destination {
    for (const property in source) {
      if (destination.hasOwnProperty(property)) {
        if (typeof source[property] === 'object') {
          if (source[property] == null) {
            destination[property] = destination[property] || null;
          } else if (destination[property] == null) {
            destination[property] = source[property];
          } else {
            destination[property] = destination[property] || {};
            this.mapper(source[property], destination[property]);
          }
        } else {
          destination[property] = source[property];
        }
      }
    }
    return destination;
  }

  encrypt(text: string, secretKey: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encryptedText = cipher.update(text, 'utf-8', 'hex');
    encryptedText += cipher.final('hex');
    return encryptedText;
  }

  decrypt(encryptedText: string, secretKey: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decryptedText = decipher.update(encryptedText, 'hex', 'utf-8');
    decryptedText += decipher.final('utf-8');
    return decryptedText;
  }
}

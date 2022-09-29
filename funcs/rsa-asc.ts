import moment from 'moment';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import querystring from 'querystring';
import fetch from 'node-fetch';

export namespace AES {
  export function encrypt(data: string, hexKey: string) {
    const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(hexKey, 'hex'), '');
    return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
  }

  export function decrypt(encryptedData: string, hexKey: string): string {
    const decipher = crypto.createDecipheriv('aes-128-ecb', Buffer.from(hexKey, 'hex'), '');
    return decipher.update(encryptedData, 'base64', 'utf8') + decipher.final('utf8');
  }
}

export namespace RSA {
  export function encrypt(data: string, pubkey: string): string {
    const encrypted = crypto.publicEncrypt(
      {
        key: pubkey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data)
    );
    return encrypted.toString('base64');
  }

  export function decrypt(dataEncrypted: string, privkey: string): string {
    const encrypted = crypto.privateDecrypt(
      {
        key: privkey,
        passphrase: '',
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(dataEncrypted, 'base64')
    );
    return encrypted.toString('utf8');
  }
}

export namespace Encryption {
  export function encrypt(text: string, sub_service: string) {
    const [PrivateKeyCP, PublicKeyCP, PublicKeyVT] = KEYS[sub_service];
    const key = crypto.randomBytes(16).toString('hex');
    const data = RSA.encrypt(`value=${AES.encrypt(text, key)}&key=${key}`, PublicKeyVT);
    const signature = crypto.createSign('SHA1');
    signature.update(data);
    signature.end();

    return {
      data,
      signature: signature.sign(PrivateKeyCP, 'base64'),
    };
  }

  export function decrypt(data: string, sub_service: string) {
    const [PrivateKeyCP, PublicKeyCP, PublicKeyVT] = KEYS[sub_service];
    const [_, encryptedData, SIG] = data.match(/DATA=(.+)&SIG=(.+)/) || [];
    const signature = decodeURIComponent(SIG);
    const verify = crypto.createVerify('SHA1');
    verify.update(encryptedData);
    verify.end();
    const integrity = verify.verify(PublicKeyVT, signature, 'base64');
    if (!integrity)
      return {
        data: {},
      };

    const decodedRsaData = RSA.decrypt(encryptedData, PrivateKeyCP);
    const [VALUE, AESKEY] = decodedRsaData.split('&');
    const aesInput = VALUE.replace(/VALUE\=/i, '');
    const aesKey = AESKEY.replace(/KEY\=/i, '');
    const response = AES.decrypt(aesInput, aesKey);
    return {
      data: querystring.parse(response),
    };
  }
}

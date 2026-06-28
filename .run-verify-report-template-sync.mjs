import CryptoJS from 'crypto-js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const JSEncrypt = require('jsencrypt');

const baseUrl = 'http://124.221.155.102/enterprise/prod-api';
const clientId = 'e5cd7e4891bf95d1d19206ce24a7b32e';
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==';

function encryptLoginPayload(payload) {
  const aesKey = CryptoJS.enc.Utf8.parse('0123456789abcdefghijklmnopqrstuv');
  const rsa = new JSEncrypt();
  rsa.setPublicKey(publicKey);
  return {
    encryptedKey: rsa.encrypt(CryptoJS.enc.Base64.stringify(aesKey)),
    encryptedBody: CryptoJS.AES.encrypt(JSON.stringify(payload), aesKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString()
  };
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

const { encryptedKey, encryptedBody } = encryptLoginPayload({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: '',
  clientId,
  grantType: 'password'
});

const login = await requestJson(`${baseUrl}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    clientid: clientId,
    'encrypt-key': encryptedKey
  },
  body: encryptedBody
});
console.log('login:', JSON.stringify(login.body));
if (login.body?.code !== 200) process.exit(2);

const token = login.body.data.access_token;
const sync = await requestJson(`${baseUrl}/enterprise/report-template-sync/run`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    clientid: clientId
  }
});
console.log('template-sync:', JSON.stringify(sync.body));
if (sync.status !== 200 || sync.body?.code !== 200) process.exit(3);

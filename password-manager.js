"use strict";

const { subtle } = require('crypto').webcrypto;

const PBKDF2_ITERATIONS = 100000;

class Keychain {
  constructor() {
    this.kvs = {};      // Encrypted key-value store
    this.masterKey = null;
    this.salt = null;
  }

  static async init(password) {
    const keychain = new Keychain();
    [keychain.masterKey, keychain.salt] = await keychain.deriveKey(password);
    return keychain;
  }

  static async load(password, contents, checksum) {
    const parsedContents = JSON.parse(contents);
    const newChecksum = await Keychain.computeChecksum(contents);

    if (checksum && checksum !== newChecksum) {
      throw new Error("Checksum validation failed");
    }

    const keychain = new Keychain();
    const salt = new Uint8Array(parsedContents.salt);  // Ensure salt is a Uint8Array
    const [masterKey] = await keychain.deriveKey(password, salt);
    keychain.masterKey = masterKey;
    keychain.salt = salt;

    try {
      keychain.kvs = await keychain.decryptKVS(parsedContents.encryptedKVS);
    } catch (error) {
      throw new Error("Failed to load Keychain: Incorrect password");
    }

    return keychain;
  }

  async dump({ includeKVS = false } = {}) {
    const encryptedKVS = await this.encryptKVS();
    const contents = JSON.stringify({
      kvs: includeKVS ? this.kvs : null,
      encryptedKVS,
      salt: Array.from(this.salt)  // Convert Uint8Array to a format JSON can serialize
    });
    const checksum = await Keychain.computeChecksum(contents);
    return [contents, checksum];
  }

  async get(url) {
    return this.kvs[url] || null;
  }

  async set(url, password) {
    this.kvs[url] = password;
  }

  async remove(url) {
    if (url in this.kvs) {
      delete this.kvs[url];
      return true;
    }
    return false;
  }

  async deriveKey(password, salt = null) {
    const passwordBuffer = new TextEncoder().encode(password);
    salt = salt || crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"]);
    const derivedKey = await subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return [derivedKey, salt];
  }

  async encryptKVS() {
    const encoder = new TextEncoder();
    const kvsData = JSON.stringify(this.kvs);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await subtle.encrypt(
      { name: "AES-GCM", iv },
      this.masterKey,
      encoder.encode(kvsData)
    );

    return {
      iv: Array.from(iv),  // Store IV as an array to be JSON-serializable
      encryptedKVS: Array.from(new Uint8Array(encrypted))
    };
  }

  async decryptKVS(encryptedData) {
    const iv = new Uint8Array(encryptedData.iv);
    const encryptedBuffer = new Uint8Array(encryptedData.encryptedKVS).buffer;
    const decrypted = await subtle.decrypt(
      { name: "AES-GCM", iv },
      this.masterKey,
      encryptedBuffer
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  static async computeChecksum(data) {
    const hashBuffer = await subtle.digest("SHA-256", new TextEncoder().encode(data));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
}

module.exports = { Keychain };

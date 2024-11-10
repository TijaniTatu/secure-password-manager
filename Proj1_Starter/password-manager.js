"use strict";

/********* External Imports ********/

const { stringToBuffer, bufferToString, encodeBuffer, decodeBuffer, getRandomBytes } = require("./lib");
const { subtle } = require('crypto').webcrypto;

/********* Constants ********/

const PBKDF2_ITERATIONS = 100000; // number of iterations for PBKDF2 algorithm
const MAX_PASSWORD_LENGTH = 64;   // we can assume no password is longer than this many characters
const AES_ALGORITHM = 'AES-GCM';   // AES-GCM encryption for secure data handling
const IV_LENGTH = 12;             // 12-byte IV for AES-GCM

/********* Implementation ********/
class Keychain {
  /**
   * Initializes the keychain using the provided information. 
   * Arguments: 
   *    None. This is intended for internal use.
   */
  constructor() {
    this.data = {};    // Public data (e.g., metadata, non-sensitive data)
    this.secrets = {}; // Sensitive data (e.g., encrypted passwords)
  };

  /** 
    * Creates an empty keychain with the given password.
    * Arguments:
    *   password: string
    * Return Type: void
    */
  static async init(password) {
    // Generate a secure salt for PBKDF2
    const salt = getRandomBytes(16);
    
    // Derive encryption key using PBKDF2
    const key = await subtle.importKey(
      "raw", 
      stringToBuffer(password), 
      { name: "PBKDF2" }, 
      false, 
      ["deriveKey"]
    );
    const derivedKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      key,
      { name: AES_ALGORITHM, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    // Initialize the Keychain object
    const keychain = new Keychain();
    keychain.secrets.key = derivedKey;
    keychain.secrets.salt = salt;

    return keychain;
  }

  /**
    * Loads the keychain state from the provided representation (repr).
    * Arguments:
    *   password:           string
    *   repr:               string
    *   trustedDataCheck: string
    * Return Type: Keychain
    */
  static async load(password, repr, trustedDataCheck) {
    // Verify the checksum of the representation (integrity check)
    const hash = subtle.digest('SHA-256', stringToBuffer(repr));
    const checksum = await bufferToString(hash);
    if (checksum !== trustedDataCheck) {
      throw new Error("Checksum verification failed.");
    }

    // Parse the representation to extract the keychain data
    const data = JSON.parse(repr);
    const salt = data.salt;
    const encryptedSecrets = data.encryptedSecrets;

    // Derive the same key from the password and salt
    const key = await subtle.importKey(
      "raw", 
      stringToBuffer(password), 
      { name: "PBKDF2" }, 
      false, 
      ["deriveKey"]
    );
    const derivedKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      key,
      { name: AES_ALGORITHM, length: 256 },
      false,
      ["decrypt"]
    );

    // Create a new Keychain object and decrypt secrets
    const keychain = new Keychain();
    keychain.secrets.key = derivedKey;
    keychain.secrets.salt = salt;

    // Decrypt and populate the keychain's data
    for (const [domain, encryptedData] of Object.entries(encryptedSecrets)) {
      const decryptedData = await keychain.decrypt(encryptedData);
      keychain.data[domain] = decryptedData;
    }

    return keychain;
  }

  /**
    * Returns a JSON serialization of the contents of the keychain that can be 
    * loaded back using the load function.
    * Return Type: array
    */
  async dump() {
    try {
      // Convert the keychain data into a JSON object (your data + secrets)
      const keychainData = JSON.stringify({
        data: this.data,
        secrets: this.secrets
      });
  
      // Convert keychain data into a buffer and then encode it
      const buffer = stringToBuffer(keychainData);
      const checksum = await this.computeChecksum(buffer);
  
      // Create the final dump array
      return [bufferToString(buffer), checksum];
    } catch (err) {
      console.error("Error in dumping keychain:", err);
      throw err;
    }
  }
  

  async computeChecksum(buffer) {
    const hash = await subtle.digest('SHA-256', buffer);
    return bufferToString(hash); // Convert hash back to a string or Buffer as required
  }
  

  /**
    * Fetches the data (as a string) corresponding to the given domain from the KVS.
    * Return Type: Promise<string>
    */
  async get(name) {
    return this.data[name] || null;
  }

  /** 
  * Inserts the domain and associated data into the KVS. If the domain is
  * already in the password manager, this method should update its value. If
  * not, create a new entry in the password manager.
  * Arguments:
  *   name: string
  *   value: string
  * Return Type: void
  */
  async set(name, value) {
    this.data[name] = value;
  }

  /**
    * Removes the record with name from the password manager. Returns true
    * if the record with the specified name is removed, false otherwise.
    * Arguments:
    *   name: string
    * Return Type: Promise<boolean>
    */
  async remove(name) {
    if (this.data[name]) {
      delete this.data[name];
      return true;
    }
    return false;
  }

  /** 
    * Encrypt a given value using AES-GCM.
    * Arguments:
    *   value: string
    * Return Type: Promise<EncryptedData>
    */
  async encrypt(value) {
    const iv = getRandomBytes(IV_LENGTH);
    const encodedValue = stringToBuffer(value);

    const encryptedData = await subtle.encrypt(
      {
        name: AES_ALGORITHM,
        iv: iv
      },
      this.secrets.key,
      encodedValue
    );

    return { iv: iv, data: encryptedData };
  }

  /** 
    * Decrypt a given encrypted data.
    * Arguments:
    *   encryptedData: EncryptedData
    * Return Type: Promise<string>
    */
  async decrypt(encryptedData) {
    const { iv, data } = encryptedData;

    const decryptedData = await subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: iv
      },
      this.secrets.key,
      data
    );

    return bufferToString(decryptedData);
  }
}

module.exports = { Keychain };

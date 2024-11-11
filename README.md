# Secure Password Manager Library

This library provides a secure, password-based key-value storage solution for managing sensitive data like credentials. The `Keychain` class uses AES-GCM encryption to protect stored data, allowing for safe storage, retrieval, and serialization of encrypted information.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
  - [Key Derivation](#key-derivation)
  - [Data Encryption and Decryption](#data-encryption-and-decryption)
  - [Data Dump and Load](#data-dump-and-load)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)

## Introduction

The `Keychain` library securely stores credentials using a password-based encryption mechanism. It ensures that only users with the correct password can encrypt or decrypt the stored data. This approach is useful for applications requiring secure storage for sensitive data like login credentials, API keys, or other confidential information.

## Key Features

- AES-GCM encryption for secure data storage.
- Password-based key derivation using PBKDF2 with adjustable iterations.
- Support for serializing and deserializing encrypted data.
- Data integrity validation with SHA-256 checksum.

## How It Works

### Key Derivation

To securely derive an encryption key from the user-provided password, the library uses PBKDF2 (Password-Based Key Derivation Function 2). This key derivation process includes:

- **Password**: User-supplied text to generate the encryption key.
- **Salt**: A random byte array to protect against dictionary attacks.
- **Iterations**: A count that determines how many times the key derivation function is applied, increasing security.

This process results in a master key that is used to encrypt and decrypt data within the keychain.

### Data Encryption and Decryption

The `Keychain` class encrypts and decrypts the key-value store (`kvs`) using AES-GCM, a modern encryption algorithm suitable for secure data storage. The encryption process includes:

1. **Encrypting Data**: Converting the key-value store into an encrypted format with AES-GCM.
2. **Initialization Vector (IV)**: A unique, randomly generated IV used for each encryption session.
3. **Decryption**: Decoding the encrypted key-value pairs with the correct master key and IV.

These steps ensure that data remains secure and can only be accessed by users with the correct password.

### Data Dump and Load

To support backup and restoration, the library offers methods to export (`dump`) and import (`load`) encrypted key-value pairs. Each dump includes:

- **Encrypted Data**: The encrypted key-value store.
- **Salt**: Used in key derivation for data recovery.
- **Checksum**: A SHA-256 hash of the serialized data, ensuring integrity during backup and restoration.

Loading data requires the correct password to derive the master key, allowing for secure decryption of the key-value pairs.

## Installation

To use this library, clone the repository and install the required dependencies:

```bash
git clone https://github.com/Winstone-Were/secure-password-manager.git
cd secure-password-manager
npm install
```

## Usage


```javascript

const { Keychain } = require('./lib.js');

// Initialize a new keychain
const keychain = await Keychain.init('your-password');

// Add credentials
await keychain.set('https://example.com', 'password123');

// Retrieve credentials
const password = await keychain.get('https://example.com');

// Dump keychain for backup
const [contents, checksum] = await keychain.dump();

// Load an existing keychain
const loadedKeychain = await Keychain.load('your-password', contents, checksum);

```

## Testing

This project includes tests written with Mocha. To run the tests:

```bash
npm i mocha

mocha
```

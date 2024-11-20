# Secure Password Manager Library 🔐

This library provides a secure, password-based key-value storage solution for managing sensitive data like credentials. The `Keychain` class uses AES-GCM encryption to protect stored data, allowing for safe storage, retrieval, and serialization of encrypted information.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MIT](https://img.shields.io/badge/License-MIT-green)
![Mocha](https://img.shields.io/badge/Mocha-5.2.0-8d8d8d)

## Introduction 💡

The `Keychain` library securely stores credentials using a password-based encryption mechanism. It ensures that only users with the correct password can encrypt or decrypt the stored data. This approach is useful for applications requiring secure storage for sensitive data like login credentials, API keys, or other confidential information.

## Key Features 🔑

- AES-GCM encryption for secure data storage.
- Password-based key derivation using PBKDF2 with adjustable iterations.
- Support for serializing and deserializing encrypted data.
- Data integrity validation with SHA-256 checksum.

## How It Works ⚙️

### Key Derivation 🔑

To securely derive an encryption key from the user-provided password, the library uses PBKDF2 (Password-Based Key Derivation Function 2). This key derivation process includes:

- **Password**: User-supplied text to generate the encryption key.
- **Salt**: A random byte array to protect against dictionary attacks.
- **Iterations**: A count that determines how many times the key derivation function is applied, increasing security.

This process results in a master key that is used to encrypt and decrypt data within the keychain.

### Data Encryption and Decryption 🔐

The `Keychain` class encrypts and decrypts the key-value store (`kvs`) using AES-GCM, a modern encryption algorithm suitable for secure data storage. The encryption process includes:

1. **Encrypting Data**: Converting the key-value store into an encrypted format with AES-GCM.
2. **Initialization Vector (IV)**: A unique, randomly generated IV used for each encryption session.
3. **Decryption**: Decoding the encrypted key-value pairs with the correct master key and IV.

These steps ensure that data remains secure and can only be accessed by users with the correct password.

### Data Dump and Load 🗃️

To support backup and restoration, the library offers methods to export (`dump`) and import (`load`) encrypted key-value pairs. Each dump includes:

- **Encrypted Data**: The encrypted key-value store.
- **Salt**: Used in key derivation for data recovery.
- **Checksum**: A SHA-256 hash of the serialized data, ensuring integrity during backup and restoration.

Loading data requires the correct password to derive the master key, allowing for secure decryption of the key-value pairs.

## Installation 🛠️

To use this library, clone the repository and install the required dependencies:

```bash
git clone https://github.com/Winstone-Were/secure-password-manager.git
cd secure-password-manager
npm install

```

## Usage 🚀


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

## Testing 🧪

This project includes tests written with Mocha. To run the tests:
If mocha is not installed:
```bash
npm install -g mocha

```
To test:
```bash
mocha
```

## Running the Server🖥️
To run the server, you need to have Node.js installed. Then, you can run the server.
```bash
node server.js
```
This will start the server on port 3000.

## Website🛜
Then open the index.html on your browser
<br>
<br>
<br>

---

# <u> SHORT QUESTIONS ANSWERS </u>
**1. Preventing the Adversary from Learning Password Lengths:**

**🔑Approach:**

 To prevent the adversary from deducing information about password lengths, the implemented password manager pads each password to a fixed, maximum length before encryption (e.g., 64 characters). By ensuring that all encrypted entries appear to have the same length, this approach hides any length-related information about the passwords, making it impossible for an adversary to infer password lengths based on the ciphertext size.

<u>**🌟Advantages**</u>

**Privacy Protection:** Prevents the adversary from inferring password characteristics based on length, which is valuable for privacy since short passwords may indicate simplicity.

**Uniform Encryption Output:** Consistent ciphertext sizes enhance security as no entry reveals length-based metadata.

**⚠️Disadvantages:**

**Increased Storage Requirements:** Padding can lead to substantial increases in storage space, especially if the database contains many short passwords.

**Additional Processing Overhead:** Adding padding introduces minor computational overhead during padding and encryption.

---

**2. Preventing Swap Attacks:**

**🔑Approach:**

 The implemented password manager prevents swap attacks by tying each domain-password pair to a unique HMAC value derived from the domain name. This approach ensures that any attempt to swap entries will result in a mismatch when the domain’s HMAC is verified against the stored data. Furthermore, a SHA-256 checksum of the entire database is computed during serialization. This checksum is verified upon loading, allowing the system to detect any tampering in case an adversary attempts to rearrange entries. With these defenses, the password manager effectively detects and prevents swap attacks.

**🌟Advantages:**

<mark>**Tamper Detection:**</mark> The use of HMAC ensures that any modification to a domain-password pair is detectable since each entry is bound to its unique HMAC.

<mark>**Strong Integrity Assurance:** </mark>The SHA-256 checksum provides an additional layer of defense by verifying the overall database’s integrity, detecting unauthorized changes beyond individual entries.

**⚠️Disadvantages:**

<mark>**Computation Overhead:**</mark> Calculating HMACs and the SHA-256 checksum involves additional computation, which could slow down performance for larger databases.

<mark>**Complexity in Verification:**</mark> If an entry fails verification, determining which part of the database has been tampered with may be challenging without additional mechanisms.

---

**3. Necessity of a Trusted Location for SHA-256 Hash to Defend Against Rollback Attacks:**

**🔑 Approach:**

While storing the SHA-256 hash in a trusted location beyond the adversary’s reach strengthens the system’s defense against rollback attacks, it is not absolutely necessary. Without a trusted storage location, we could implement an alternative mechanism such as version numbers or timestamps for each entry. By verifying these during each load operation, we could detect whether any rollback has occurred. However, storing the hash in a trusted location simplifies the verification process and provides a more straightforward, robust defense against rollback attacks.

**🌟Advantages:**

**Strong Rollback Protection:** A trusted SHA-256 hash or versioning enables robust protection against rollback attacks, ensuring that data cannot be reverted to a previous state undetected.

**Ease of Integrity Check:** With a trusted storage location, verifying integrity becomes straightforward, enhancing reliability.

**⚠️Disadvantages:**

**Dependency on Trusted Storage:** The security model is weakened without a secure, trusted storage location, making the system vulnerable to rollbacks if this alternative is not available.

**Versioning Complexity:** If a trusted storage is unavailable, managing version numbers or timestamps adds complexity to the system and requires meticulous handling to avoid sync issues.

---

## 4. Randomized MACs and Domain Name Lookups:

Using a randomized MAC to look up domain names makes the process more complex. The output is not deterministic since each time you compute the MAC, it might yield a different tag even with the same input and key. With HMAC, you get the same tag (output) every time you use the same key and input, making it easy and more straightforward to generate a tag and use it as a unique key for lookups.

Since each unique generated tag cannot be recreated deterministically for the same input for a randomized MAC, you would need to store each unique tag generated along with its corresponding domain name. Lookups become reliant on a pre-built storage or database of domain-to-tag mappings. This suggests that each time a MAC is generated for a domain name, the corresponding tag must be stored.

When a tag is randomized, you can’t simply recompute the tag and use it directly for a lookup but instead have to use a database that matches tags to domains or includes an alternate lookup structure like an index or hash map. This makes the lookup process complex. Considering that you would have to search through a bigger collection of randomized tags for every query, this adds more computational and storage overhead, particularly as the number of entries increases.

The need to store each unique tag in a database introduces a significant storage penalty. The database searches or even hashed-based retrieval methods would have some non-zero access time. Additionally, depending on the security requirements, you might need to implement additional security checks or hashing to protect against database tampering, adding further complexity and potential latency.

### 💡Potential Solution: 
- Keeping a consistent database index that connects every domain name to the list of its produced tags is one method to lessen these penalties. An inverted index might be used to accomplish this, allowing you to efficiently search by domain and obtain all related tags. This would still result in more storage utilization and more expenses for database administration, though.

---

## 5. Reducing Information Leaked About the Number of Records:

To reduce the information leaked about the number of records in the password manager, we can use a <mark>**hash-based partitioning scheme with padding**</mark>.

### 🔑Approach:
- **Hash-Based Partitioning**: Divide the records into multiple logical partitions and use a consistent hash function to assign each record to a partition based on the record identifier. Each partition holds up to a set maximum number of records, e.g., 8 records per partition.
  
- **Randomized Padding**: The exact count within each partition is hidden by padding and filling empty slots with “dummy records.” These dummy records don’t correspond to actual records but serve as a cover to make changes within a bucket less obvious. For example, if you are in Bucket 4 (which ranges from 8–15 records), you might add enough dummy records so that the displayed count remains stable even if one or two real records are added or removed.

The goal is to obscure the exact number of records in the password manager by grouping counts into specific ranges, or “buckets,” such that only the approximate order of magnitude (based on log2(k)) is visible. This means that if the number of records is anywhere within a certain range, the information leaked will only be the range itself—not the exact count.

### Example:
| No. of Records (k) | Bucket Range | Approximate Information (Leak) |
|--------------------|--------------|--------------------------------|
| 1                  | 1-1          | Log2(k) = 0                    |
| 2-3                | 2-3          | Log2(k) = 1                    |
| 4-7                | 4-7          | Log2(k) = 2                    |
| 8-15               | 8-15         | Log2(k) = 3                    |
| 16-31              | 16-31        | Log2(k) = 4                    |
| 32-63              | 32-63        | Log2(k) = 5                    |
| 64-127             | 64-127       | Log2(k) = 6                    |

In this setup, if the record count `k` is 21, it would reveal only that `k` is between 16 and 31 records. Let `k1 = 8` and `k2 = 15`—two counts that fall within the same "bucket" or range. Since `log2(k1) = 3` and `log2(k2) = 3.9`, both values round down to the same integer bucket of 3, meaning they are indistinguishable from each other in this scheme.

Thus, if an attacker observes the bucketed response (either for 8 or 15 records), they see only that the count is in the range for 2^3 up to 2^4 − 1 (i.e., 8–15 records) and cannot distinguish between 8 and 15.

### 🌟Advantages:
1. **Only Leaks Log2(k)**: The scheme effectively only leaks log2(k), showing the approximate order of magnitude or range in which `k` falls.
2. **Small Changes in Record Count**: Small changes (e.g., adding or removing a few records) do not result in new information unless they move the count to a new bucket.
3. **Easy Scaling**: The system allows for easy scaling by adding partitions as needed, without revealing much about the exact record count.

### ⚠️Potential Drawbacks:
1. **Increased Storage**: Dummy records used for padding increase storage requirements. However, this overhead is often manageable and justifiable for increased security.
2. **Additional Logic**: More logic is required to handle padding and efficiently manage record distributions across partitions.

---

 ## 6. Multi-User Support Without Compromising Security: 

To add multi-user support for specific sites in a password manager system without compromising security for other sites, we can use <mark>**Attribute-Based Encryption (ABE)**</mark> with fine-grained access control.

### 🔑Approach: 
In this approach, each user is assigned unique cryptographic attributes (such as "nytimes-access") to control access to specific passwords. When a password is stored, it is encrypted using <mark>**Attribute-Based Encryption (ABE)**</mark> with conditions tied to these attributes, ensuring only users with the appropriate attribute (e.g., "nytimes-access") can decrypt it. Users can access shared passwords if they possess the correct attribute, while other passwords remain protected by different attributes.

If access needs to be revoked, the attribute can be removed from a user's profile, and the password can be re-encrypted with a new access condition. This allows dynamic access control without the need to re-encrypt all passwords.

### Example:
- Alice and Bob both need access to the "nytimes" password. They would each be granted the “nytimes-access” attribute.
- The password manager encrypts the "nytimes" password using this attribute, ensuring that only Alice and Bob (and not any other user) can access it.
- For other passwords, like Alice’s personal Instagram password, only she has the “Instagram-access” attribute, ensuring Bob cannot decrypt it.

### 🌟Security Benefits:
1. **Granular Access Control**: Only users with the specific attribute can access the password, providing very fine-grained access control.
2. **Confidentiality of Other Passwords**: Users don’t gain access to attributes or credentials they don’t need, preserving the confidentiality of other stored passwords.
3. **Scalability**: As the system grows, new users can be assigned attributes for shared credentials without requiring complex re-encryption of every stored password.

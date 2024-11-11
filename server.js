"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const { Keychain } = require('./Keychain');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let keychainInstance = null;

// Middleware to check if keychain is loaded
function requireKeychain(req, res, next) {
    if (!keychainInstance) {
        return res.status(400).json({ error: "Keychain not initialized. Please create or load a keychain first." });
    }
    next();
}

/**
 * POST /keychain/create
 * Create a new keychain with a password
 * Request Body:
 * {
 *   "password": "your-password"
 * }
 */
app.post('/keychain/create', async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: "Password is required." });
    }
    keychainInstance = await Keychain.init(password);
    res.json({ message: "Keychain created successfully." });
});

/**
 * POST /keychain/load
 * Load an existing keychain from saved contents and checksum
 * Request Body:
 * {
 *   "password": "your-password",
 *   "contents": "serialized-contents",
 *   "checksum": "expected-checksum"
 * }
 */
app.post('/keychain/load', async (req, res) => {
    const { password, contents, checksum } = req.body;
    if (!password || !contents || !checksum) {
        return res.status(400).json({ error: "Password, contents, and checksum are required." });
    }
    try {
        keychainInstance = await Keychain.load(password, contents, checksum);
        res.json({ message: "Keychain loaded successfully." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /keychain/set
 * Set a new credential in the keychain
 * Request Body:
 * {
 *   "url": "https://example.com",
 *   "password": "your-password"
 * }
 */
app.post('/keychain/set', requireKeychain, async (req, res) => {
    const { url, password } = req.body;
    if (!url || !password) {
        return res.status(400).json({ error: "URL and password are required." });
    }
    await keychainInstance.set(url, password);
    res.json({ message: "Credential saved successfully." });
});

/**
 * GET /keychain/get
 * Retrieve a credential from the keychain
 * Query Parameters:
 * ?url=https://example.com
 */
app.get('/keychain/get', requireKeychain, async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "URL is required." });
    }
    const credential = await keychainInstance.get(url);
    if (credential) {
        res.json({ url, password: credential });
    } else {
        res.status(404).json({ error: "Credential not found." });
    }
});

/**
 * DELETE /keychain/remove
 * Delete a credential from the keychain
 * Request Body:
 * {
 *   "url": "https://example.com"
 * }
 */
app.delete('/keychain/remove', requireKeychain, async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: "URL is required." });
    }
    const success = await keychainInstance.remove(url);
    if (success) {
        res.json({ message: "Credential deleted successfully." });
    } else {
        res.status(404).json({ error: "Credential not found." });
    }
});

/**
 * POST /keychain/dump
 * Dump the keychain data securely (encrypted)
 * Request Body:
 * {
 *   "includeKVS": false
 * }
 */
app.post('/keychain/dump', requireKeychain, async (req, res) => {
    const { includeKVS = false } = req.body;
    const [contents, checksum] = await keychainInstance.dump({ includeKVS });
    res.json({ contents, checksum });
});

// Start the server
app.listen(port, () => {
    console.log(`Password manager API listening on http://localhost:${port}`);
});

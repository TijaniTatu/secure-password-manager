"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const { Keychain } = require('./password-manager'); // Import the Keychain class

const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors()); // Enable CORS for all routes



app.use(bodyParser.json());
app.use(express.static('./'))

let keychainInstance = null; // To hold the current keychain instance

// Create a new keychain
app.post('/keychain/create', async (req, res) => {
    try {
        const { password } = req.body;
        keychainInstance = await Keychain.init(password);
        res.status(201).json({ message: 'Keychain created successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Load an existing keychain
app.post('/keychain/load', async (req, res) => {
    try {
        const { password, contents, checksum } = req.body;
        keychainInstance = await Keychain.load(password, contents, checksum);
        res.status(200).json({ message: 'Keychain loaded successfully.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Set a credential
app.post('/keychain/set', async (req, res) => {
    try {
        const { url, password } = req.body;
        await keychainInstance.set(url, password);
        res.status(200).json({ message: 'Credential set successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a credential
app.get('/keychain/get', async (req, res) => {
    try {
        const { url } = req.query;
        const password = await keychainInstance.get(url);
        if (password) {
            res.status(200).json({ password });
        } else {
            res.status(404).json({ error: 'Credential not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove a credential
app.delete('/keychain/remove', async (req, res) => {
    try {
        const { url } = req.body;
        const success = await keychainInstance.remove(url);
        if (success) {
            res.status(200).json({ message: 'Credential removed successfully.' });
        } else {
            res.status(404).json({ error: 'Credential not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dump the keychain contents
app.post('/keychain/dump', async (req, res) => {
    try {
        const { includeKVS } = req.body;
        const [contents, checksum] = await keychainInstance.dump({ includeKVS });
        res.status(200).json({ contents, checksum });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Password manager API listening on http://localhost:${PORT}`);
});
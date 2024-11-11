const API_URL = 'http://localhost:3000/keychain';

document.getElementById('create-keychain').addEventListener('click', async () => {
    const password = document.getElementById('create-password').value;
    const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await response.json();
    alert(data.message || data.error);
});

document.getElementById('load-keychain').addEventListener('click', async () => {
    const password = document.getElementById('load-password').value;
    const contents = document.getElementById('contents').value;
    const checksum = document.getElementById('checksum').value;
    const response = await fetch(`${API_URL}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, contents, checksum })
    });
    const data = await response.json();
    alert(data.message || data.error);
});

document.getElementById('set-credential').addEventListener('click', async () => {
    const url = document.getElementById('url').value;
    const password = document.getElementById('credential-password').value;
    const response = await fetch(`${API_URL}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, password })
    });
    const data = await response.json();
    alert(data.message || data.error);
});

document.getElementById('get-credential').addEventListener('click', async () => {
    const url = document.getElementById('get-url').value;
    const response = await fetch(`${API_URL}/get?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (data.password) {
        document.getElementById('credential-result').innerText = `Password for ${url}: ${data.password}`;
    } else {
        alert(data.error);
        document.getElementById('credential-result').innerText = '';
    }
});

document.getElementById('remove-credential').addEventListener('click', async () => {
    const url = document.getElementById('remove-url').value;
    const response = await fetch(`${API_URL}/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
    const data = await response.json();
    alert(data.message || data.error);
});

document.getElementById('dump-keychain').addEventListener('click', async () => {
    const includeKVS = document.getElementById('includeKVS').checked;
    const response = await fetch(`${API_URL}/dump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeKVS })
    });
    const data = await response.json();
    if (data.contents) {
        document.getElementById('dump-result').innerText = `Contents: ${data.contents}\nChecksum: ${data.checksum}`;
    } else {
        alert(data.error);
        document.getElementById('dump-result').innerText = '';
    }
});
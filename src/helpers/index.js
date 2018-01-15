export function getWSUrl(webUrl) {
    let protocol = 'ws';

    try {
        const url = new URL(webUrl);

        if (url.protocol === 'https:') {
            protocol = 'wss';
        }

        return `${protocol}://${url.host}`;
    }
    catch (err) {
        return `${protocol}://localhost:3000`;
    }
}


import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId();

export function getRemoteIp(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

export function getNewConnectionId(origin) {
    const id = process.env.NODE_ENV === 'test'
        ? 'f91cad9'
        : uid.randomUUID(6);

    return `${origin}-${id}`;
}


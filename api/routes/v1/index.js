import { Router } from 'express';

import sockets from '../../lib/sockets';

export default function chatterboxApiV1(app, srv) {
    const router = new Router();

    sockets(app, srv);

    router.use((req, res) => {
        res.send('<h1>It works!</h1><p>An express server works</p>');
    });

    return router;
}


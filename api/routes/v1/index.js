import { Router } from 'express';
import configureStore from '../../lib/store';

export default function chatterboxApiV1(app, srv) {
    const router = new Router();

    configureStore(app, srv);

    router.use((req, res) => {
        res.send('<h1>It works!</h1><p>An express server works</p>');
    });

    return router;
}


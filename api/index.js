/* eslint-disable global-require */
import logger from './helpers/logger';
import path from 'path';
import express from 'express';
import http from 'http';
import webpack from 'webpack';
import routes from './routes/v1';

import { version } from '../package.json';

export default function run() {
    const port = process.env.PORT || 3000;

    const app = express();
    const srv = http.createServer(app);

    app.use('/api', routes(app, srv));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../src/templates'));

    app.get('/', (req, res) => {
        res.render('index', {
            htmlWebpackPlugin: {
                options: {
                    version
                }
            }
        });
    });

    // serve the react app statically
    /* IFDEV */
    if (process.env.NODE_ENV === 'development' && process.env.CLIENT_ENV !== 'production') {
        const conf = require('../webpack.config')(false);

        const compiler = webpack(conf);

        app.use(require('webpack-dev-middleware')(compiler, {
            publicPath: conf.output.publicPath,
            stats: {
                colors: true,
                modules: false,
                chunks: false,
                reasons: false
            },
            hot: true,
            quiet: false,
            noInfo: false
        }));

        app.use(require('webpack-hot-middleware')(compiler));
    }

    /* ENDIF */

    app.use('/', express.static(path.join(__dirname, '../static')));

    srv.listen(port, () => {
        logger.info('Server listening on port', port);
    });
}


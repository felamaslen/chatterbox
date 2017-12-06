/* eslint-disable global-require */
/**
 * Returns webpack configuration objects
 */

const dotenv = require('dotenv');

if (process.env.DOTENV_INJECT === 'true' || process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

function webpackConfigClient() {
    if (process.env.NODE_ENV === 'production') {
        return require('./webpack/conf.prod')();
    }

    return require('./webpack/conf.dev')();
}

function webpackConfigServer() {
    // build the server app so that it can be run by vanilla node
    return require('./webpack/conf.backend')();
}

module.exports = (buildServer = true) => {
    if (buildServer && process.env.BUILD_SERVER && process.env.BUILD_SERVER === 'true') {
        return [
            webpackConfigClient(),
            webpackConfigServer()
        ];
    }

    return webpackConfigClient();
};


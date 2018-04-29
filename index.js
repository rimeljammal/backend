const path = require('path');
const hapi = require('hapi');
const mongoose = require('mongoose');
const _ = require('lodash');

const config = require(path.resolve('config/config'));

mongoose.connect(config.databaseUrl);

require(path.resolve('users'));

const User = mongoose.model('User');

const init = async() => {
    const server = hapi.server({
        port: 3000
    });

    await server.register([require('vision'), require('inert'), require('lout'), require('hapi-auth-jwt2')]);

    server.auth.strategy('jwt', 'jwt', 
        {
            key: config.jwtKey,
            validate: async function(decoded, request) {
                try {
                    const user = await User
                        .findOne({email:decoded.email})
                        .exec();
                    if(!user)   {
                        return {isValid: false};
                    }
                    request.user = user;
                    return {isValid: true};
                }   catch(e)    {
                    return {isValid: false};
                }
            },
            verifyOptions: {algorithms: ['HS256']}
        });

    server.auth.default('jwt');

    let routes = [];
    const loginRoutes = require(path.resolve('routes/login'));
    const articlesRoutes = require(path.resolve('routes/functions'));
    // const articlesRoutes = require(path.resolve('routes/articles'));

    routes.push(loginRoutes);
    routes.push(articlesRoutes);
    // routes.push(articlesRoutes);

    routes = _.flatMapDeep(routes, (route) => {
        return route;
    });

    server.route(routes);
    await server.start();
    return server;
};

init().then(server =>   {
    console.log('Server running at:' +  server.info.uri);
}).catch(error =>   {
    console.log(error);
});
const path = require('path');
const Boom = require('boom');
const mongoose = require('mongoose');
const joi = require('joi');
const _ = require('lodash');

const User = mongoose.model('User');

const endpoints = [
    {
        method: 'POST',
        path: '/update',
        config: {
            auth: 'jwt',
            validate: {
                payload: {
                    favString: joi.array().required()
                }
            }
        },
        handler: async function (request, h) {
            const loggedInUser = request.user;
            loggedInUser.favorites = request.payload.favString;
            try {
                const modifiedUser = await loggedInUser.save();
                return modifiedUser;
            } catch (e) {
                return Boom.badRequest(e.message);
            }
        }
    }
];

module.exports = endpoints;
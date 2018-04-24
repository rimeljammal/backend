const path = require('path');
const Boom = require('boom');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');

const config = require(path.resolve('config/config'));
const User = mongoose.model('User');
const Utils = require(path.resolve('./utils/utils'));

const endpoints = [
    {
        method: 'POST',
        path: '/register',
        config: {
            auth: false,
            validate:   {
                payload:    {
                    name: joi.string().min(5).required(),
                    email: joi.string().email().required(),
                    password: joi.string().required()
                }
            }
        },
        handler: async function(request, h) {
            try {
                const newUser = new User(request.payload);
                const result = await newUser.save();
                return Utils.sanitizeUser(result);
            }   catch(e)    {
                return Boom.badRequest(e.message);
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        config: {
            auth: false,
            validate:   {
                payload:    {
                    email: joi.string().email().required(),
                    password: joi.string().required()
                }
            }
        },
        handler: async function(req, h) {
            const user = await User.findOne({
                email: req.payload.email
            }).exec();
            if(!user)   {
                return Boom.badRequest('bad username/password');
            }
            const sanitizedUser = Utils.sanitizeUser(user);
            sanitizedUser.token = jwt.sign(sanitizedUser, config.jwtKey);
            return sanitizedUser;
        }
    }
];

module.exports = endpoints;
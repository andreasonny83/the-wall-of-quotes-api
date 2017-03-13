/**
 * the-wall-of-quotes-api
 *
 * @license
 * Copyright (c) 2016-2017 by andreasonny83. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at
 * https://raw.githubusercontent.com/Azurasky1/DragonArena/develop/LICENSE
 */
'use strict';

const router = require('express').Router();
const pkginfo = require('pkginfo')(module);
const firebase = require('firebase');
const request = require('request');

const appName = module.exports.name;
const appVersion = module.exports.version;
const environment = process.env.NODE_ENV || 'DEV';
const debug = process.env.DEBUG === 'true' || environment === 'DEV';

let serviceAccount;
let ref;

_init();

// Routing logic
router
  .get('/status', _status)
  .post('/add', _add);

/**
 * Private Scope
 */

function _firebaseInit() {
  let errorCode;
  let errorMessage;

  firebase
    .initializeApp({
      apiKey: serviceAccount.API_KEY,
      authDomain: serviceAccount.AUTH_DOMAIN,
      databaseURL: serviceAccount.DATABASE_URL
    });

  firebase.auth()
          .signInWithEmailAndPassword(serviceAccount.USER_EMAIL,
                                      serviceAccount.USER_PASSWORD)
          .catch(function(error) {
            errorCode = error.code;
            errorMessage = error.message;
          });

  firebase.database.enableLogging(true);

  ref = firebase.database().ref('/quotes');

  if (debug) {
    console.log('start debug');
    console.log('databaseURL:', serviceAccount.DATABASE_URL);
    if (errorCode) {
      console.log('Error during Firebase authentication:', errorCode, errorMessage);
    }
  }
}

function _init() {
  // serviceAccount stores the firebase serviceAccount configuration
  try {
    serviceAccount = require('../serviceAccount.json');
  } catch (e) {
    serviceAccount = {};
    serviceAccount.DATABASE_URL = process.env.DATABASE_URL || 'DATABASE_URL';
    serviceAccount.API_KEY = process.env.API_KEY || 'API_KEY';
    serviceAccount.AUTH_DOMAIN = process.env.AUTH_DOMAIN || 'AUTH_DOMAIN';
    serviceAccount.USER_EMAIL = process.env.USER_EMAIL || 'USER_EMAIL';
    serviceAccount.USER_PASSWORD = process.env.USER_PASSWORD || 'USER_PASSWORD';
    serviceAccount.RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || 'RECAPTCHA_SECRET';
  }

  // initialize Firebase and perform a user login
  _firebaseInit();
}

// Private functions
function _status(req, res) {
  const data = {
    app: appName,
    version: appVersion,
    status: 200,
    message: 'OK - ' + Math.random().toString(36).substr(3, 8)
  };

  if (debug) {
    console.log('User Email:', serviceAccount.USER_EMAIL);
    console.log('Current user:', firebase.auth().currentUser.uid);
  }

  res.status(200).send(data);
}

function _add(req, res) {
  let captcha = req.body.captcha || null;
  let model = {
    quote: req.body.quote || null,
    author: req.body.author || null,
    creator: req.body.creator || null,
    time: - (firebase.database.ServerValue.TIMESTAMP)
  };

  if (!model.quote ||
      !model.author ||
      !model.creator ||
      !captcha ||
      model.quote.length < 10) {
    return res.status(400).send();
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify` +
                          `?secret=${serviceAccount.RECAPTCHA_SECRET}` +
                          `&response=${captcha}` +
                          `&remoteip=${req.connection.remoteAddress}`;

  if (debug) {
    console.log('captcha:', captcha);
    console.log('model:', model);
  }

  request(verificationUrl, function(error, response, body) {
    body = JSON.parse(body);

    if (body.success !== undefined && !body.success) {
      return res.json({
        'responseCode': 1,
        'responseDesc': 'Failed captcha verification'
      });
    }

    res.json({
      'responseCode': 0,
      'responseDesc': 'Sucess'
    });
  });

  ref.push(model);
}

module.exports = router;

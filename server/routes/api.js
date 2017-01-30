"use strict";

const _ = require('lodash');
const express = require('express');

const router = express.Router();

router.use('/issues', require('./api/issues'));

router.use('/congress', require('./api/congress'));

exports = module.exports = router;

const express = require('express');
const router = express.Router();
const uploader = require('../helpers/uploader');
const {
  addActivity,
  getActivity,
} = require('./../controllers/activitiesControllers');

const uploadFileActivities = uploader('/activities', 'ACT').fields([
  { name: 'image', maxCount: 3 },
]);

// * after verifyJWT
router.get('/:activity_name?', getActivity);
router.post('/', uploadFileActivities, addActivity);

module.exports = router;

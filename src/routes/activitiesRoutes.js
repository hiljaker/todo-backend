const express = require('express');
const router = express.Router();
const uploader = require('../helpers/uploader');
const {
  addActivity,
  getActivity,
  editActivity,
  deleteActivity,
} = require('./../controllers/activitiesControllers');

const uploadFileActivities = uploader('/activities', 'ACT').fields([
  { name: 'image', maxCount: 3 },
]);

// * after verifyJWT get 'req.user'
const testBodyData = (req, res, next) => {
  req.body.data = {
    id: 16,
    activity_name: 'ngoding2',
    description: 'website',
    act_start: '2021-11-10 17:10:00',
    act_finish: '2021-11-10 17:30:00',
  };
  req.body.data = JSON.stringify(req.body.data);
  next();
};

router.post('/', uploadFileActivities, testBodyData, addActivity); // * inputs 'req.body.data' and 'req.files'
router.get('/:id?', getActivity); // * optional params
router.patch('/', uploadFileActivities, testBodyData, editActivity); // * inputs 'req.body.data' and 'req.files'
router.delete('/:id', deleteActivity);

module.exports = router;

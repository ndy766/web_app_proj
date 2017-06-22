var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('chat', {id:req.session.user.id});
});



module.exports = router;

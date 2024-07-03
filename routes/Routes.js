const express = require('express')
const router = express.Router();

const AnswerControl = require('../controllers/AnswerControl');
const BoardControl = require('../controllers/BoardControl');
const ThreadControl = require('../controllers/ThreadControl')
const UserControl = require('../controllers/UserControl');
const { adminAuth, userAuth } = require('../auth/auth');

//answer
router.get('/respostas/', AnswerControl.getAll);
router.get('/respostas/:id', AnswerControl.getById);
router.post('/respostas/', AnswerControl.save);
router.put('/respostas/', AnswerControl.update);
router.delete('/respostas/', AnswerControl.delete);

//board
router.get('/boards/', BoardControl.getAll);
router.get('/boards/:id', BoardControl.getById);
router.post('/boards/', BoardControl.save);
router.put('/boards/', BoardControl.update);
router.delete('/boards/', BoardControl.delete);

//Thread
router.get('/threads/', ThreadControl.getAll);
router.get('/threads/:id', ThreadControl.getById);
router.post('/threads/', ThreadControl.save);
router.put('/threads/', ThreadControl.update);
router.delete('/threads/', ThreadControl.delete);

//User
router.get('/users/', userAuth, UserControl.getAll);
router.get('/users/:id', UserControl.find.getById);
router.post('/users/', UserControl.save);
router.post('/login', UserControl.login)
router.post('/logout', UserControl.logout)
router.put('/users/', UserControl.update);
router.delete('/users/', UserControl.delete);


module.exports = router;
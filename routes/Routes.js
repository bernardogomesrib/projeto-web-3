const express = require('express')
const router = express.Router();

const AnswerControl = require('../controllers/AnswerControl');
const BoardControl = require('../controllers/BoardControl');
const ThreadControl = require('../controllers/ThreadControl')
const UserControl = require('../controllers/UserControl');
const { adminAuth, userAuth } = require('../auth/auth');
const handlerError = require('../middlewares/handlerError');
const handlerValidate = require('../middlewares/handlerValidator');

//answer
router.get('/respostas/', AnswerControl.getAll);
router.get('/respostas/:id', AnswerControl.getById);
router.post('/:threadId/respostas/', userAuth, AnswerControl.save);
router.put('/respostas/', userAuth, AnswerControl.update);
router.delete('/respostas/', userAuth, AnswerControl.delete);

//board
router.get('/boards/', BoardControl.getAll);
router.get('/boards/:id', BoardControl.getById);
router.post('/boards/', adminAuth, BoardControl.save);
router.put('/boards/', adminAuth, BoardControl.update);
router.delete('/boards/', adminAuth, BoardControl.delete)

//Thread
router.get('/threads/', ThreadControl.getAll);
router.get('/threads/:id', ThreadControl.getById);
router.post('/threads/anonymous/:board', ThreadControl.save)
router.post('/:board/threads', userAuth, ThreadControl.save);
router.put('/threads/', userAuth, ThreadControl.update);
router.delete('/threads/', userAuth, ThreadControl.delete);

//User
router.get('/users/', UserControl.getAll);
router.get('/users/:id', UserControl.find.getById);
router.get('/me', userAuth, UserControl.meusDados);
router.post('/users/', handlerError('user'), handlerValidate, UserControl.save);
router.post('/forget', handlerError('forget'), handlerValidate, UserControl.forget)
router.post('/reset/:token', handlerError('reset'), handlerValidate, UserControl.reset)
router.post('/login', handlerError('login'), handlerValidate, UserControl.login)
router.post('/logout', userAuth, UserControl.logout)
router.patch('/users/:id', userAuth, UserControl.update);
router.delete('/users/', userAuth, UserControl.delete);


module.exports = router;
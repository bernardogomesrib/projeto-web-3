const express = require('express')
const router = express.Router();

const AnswerControl = require('../controllers/AnswerControl');
const BoardControl = require('../controllers/BoardControl');
const ThreadControl = require('../controllers/ThreadControl')
const UserControl = require('../controllers/UserControl');
const { adminAuth, userAuth } = require('../auth/auth');
const handlerError = require('../middlewares/handlerError');
const handlerValidate = require('../middlewares/handlerValidator');
const { uploadMiddleware, uploadFile } = require('../middlewares/upload');

router.get('/respostas/', AnswerControl.getAll);
router.get('/respostas/:id', AnswerControl.getById);
router.post('/:threadId/respostas/', userAuth, uploadMiddleware, uploadFile, AnswerControl.save);
router.patch('/respostas/:id', userAuth, uploadMiddleware, uploadFile, AnswerControl.update);
router.delete('/respostas/', userAuth, AnswerControl.delete);

router.get('/boards/', BoardControl.getAll);
router.get('/boards/popular', BoardControl.getPopularBoards);
router.get('/boards/:id', BoardControl.getById);
router.post('/boards/', adminAuth, BoardControl.save);
router.patch('/boards/', adminAuth, BoardControl.update);
router.delete('/boards/', adminAuth, BoardControl.delete);

router.get('/threads/', ThreadControl.getAll);
router.get('/threads/recent', ThreadControl.getRecentThreads);
router.get('/threads/:id', ThreadControl.getById);
router.get('/threads/search/:filters', ThreadControl.searchThreads);
router.get('/boards/:boardId/threads', ThreadControl.getThreadsByBoard);
router.post('/:board/threads/anonymous', uploadMiddleware, uploadFile, handlerError('threads'), handlerValidate, ThreadControl.save);
router.post('/:board/threads', userAuth, uploadMiddleware, uploadFile, handlerError('threads'), handlerValidate, ThreadControl.save);
router.patch('/threads/:id', userAuth, uploadMiddleware, uploadFile, ThreadControl.updateThread);
router.delete('/threads/', userAuth, ThreadControl.delete);

router.get('/users/', adminAuth, UserControl.getAll);
router.get('/users/:id', userAuth, UserControl.getById);
router.get('/me', userAuth, UserControl.meusDados);
router.post('/users/', handlerError('create-user'), handlerValidate, UserControl.save);
router.post('/forget', handlerError('forget'), handlerValidate, UserControl.forget);
router.post('/reset/:token', handlerError('reset'), handlerValidate, UserControl.reset);
router.post('/login', handlerError('login'), handlerValidate, UserControl.login);
router.post('/logout', userAuth, UserControl.logout);
router.patch('/users/:id', userAuth, handlerError('update-user'), handlerValidate, UserControl.update);
router.delete('/users/', userAuth, UserControl.delete);

module.exports = router;

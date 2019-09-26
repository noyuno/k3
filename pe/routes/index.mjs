import express from 'express';
var _router = express.Router();
_router.get('/', (req, res) => {
    res.redirect('/sensor');
});
export const router = _router;

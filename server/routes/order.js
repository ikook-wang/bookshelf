const express = require('express');
const router = express.Router();
const Orders = require('../controllers/orders');

/**
 * @desc    兑换当前书籍
 * @method  {*请求方法} POST
 */
router.post('/buy', function (req, res, next) {
    const { skey, bookid } = req.body;

    if (skey === undefined) {
        res.json({
            result: -1,
            errmsg: '缺少请求参数skey字段，请检查后重试'
        });
        return;
    }

    if (bookid === undefined) {
        res.json({
            result: -1,
            errmsg: '缺少请求参数bookid字段，请检查后重试'
        })
    }

    Orders.buyBookBySkey(req, res, next);
});

module.exports = router;
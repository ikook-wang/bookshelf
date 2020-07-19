const http = require('axios');
const crypto = require('crypto');
// 小程序开发 id 以及秘钥
const { appConfig: config } = require('../conf/app');
// 加解密
const { decryptByAES, encryptSha1 } = require('../util/util');
// 保存用户信息到数数据库中
const { saveUserInfo } = require('../controllers/users');


/**
 * 登录校验中间件
 */
function authorizeMiddleware(req, res, next) {
    return authMiddleware(req).then(function (result) {
        // 将结果存入响应信息的'auth_data'字段
        res['auth_data'] = result;
        return next();
    });
}

function authMiddleware(req) {

    const {
        appid,
        secret
    } = config;

    const {
        code,
        encryptedData,
        iv
    } = req.query;

    // 检查参数完整性
    if ([code, encryptedData, iv].some(item => !item)) {
        return {
            result: -1,
            errmsg: '缺少参数字段，请检查后重试'
        }
    }

    // 获取 session_key 和 open_id
    return getSessionKey(code, appid, secret)
        .then(resData => {
            // 选择加密算法生成自己的登录态标识
            const { session_key } = resData;
            const skey = encryptSha1(session_key);

            let decrypetedData = JSON.parse(decryptByAES(encryptedData, session_key, iv));
            console.log('--------- 使用 encryptedData、session_key、iv 解密的用户数据----------');
            console.log(decrypetedData);
            console.log('--------- 使用 encryptedData、session_key、iv 解密的用户数据----------');

            // 存入用户数据表中
            return saveUserInfo({
                userInfo: decrypetedData,
                session_key,
                skey
            })
        })
        .catch(err => {
            return {
                result: -3,
                errmsg: JSON.stringify(err)
            }
        })

    /**
     * 获取当前用户 seesion_key
     * @param {*} code 
     * @param {*} appid 
     * @param {*} secret 
     */
    function getSessionKey(code, appid, appSecret) {

        const opt = {
            method: 'GET',
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            params: {
                appid: appid,
                secret: appSecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        }

        return http(opt).then(function (response) {
            const data = response.data;

            if (!data.openid || !data.session_key || data.errcode) {
                return {
                    return: -2,
                    errmsg: data.errmsg || '返回数据字段不完整'
                }
            } else {
                return data;
            }
        });
    }

}


module.exports = {
    authorizeMiddleware
}
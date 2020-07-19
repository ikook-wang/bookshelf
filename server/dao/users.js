const moment = require('moment');
const _ = require('./query');
const $sqlQuery = require('./sqlCRUD').user;
const config = require('../conf/app').userConfig;

const user = {

    /**
     * 保存新用户或者更新用户信息
     */
    saveUserInfo: function (userInfo, session_key, skey) {
        console.log("users.js DAO :", userInfo);
        const uid = userInfo.openId,
            create_time = moment().format('YYYY-MM-DD HH:mm:ss'),
            update_time = create_time;

        const insertObj = {
            'uid': uid,                         // 用户的 openId
            'create_time': create_time,         // 插入时间
            'uname': userInfo.nickName,         // 更新时间
            'ugender': userInfo.gender,         // 用户性别
            'uaddress': userInfo.province + ',' + userInfo.country,    // 用户地址
            'update_time': update_time,         // 该用户重新登录时间
            'ubalance': config.credit,          // 该用户的初始积分余额
            'skey': skey,                       // 使用 session_key 加密的登录态
            'sessionKey': session_key,          // 使用临时登录凭证 code 以及小程序信息（APPId，AppSecret）换取 session
            'uavatar': userInfo.avatarUrl       // 该用户的头像路径
        };

        const updateObj = {
            'uname': userInfo.nickName,
            'ugender': userInfo.gender,
            'uaddress': userInfo.province + ',' + userInfo.country,
            'update_time': update_time,
            'skey': skey,
            'sessionkey': session_key,
            'uavatar': userInfo.avatarUrl
        };

        let ubalance;

        return _.query($sqlQuery.hasUser, uid)
            .then(function (res) {
                if (res && res[0] && res[0].userCount) {  // 已经有此用户，则更新用户信息
                    ubalance = res[0].ubalance;
                    return _.query($sqlQuery.update, [updateObj, uid]);
                } else {    //否则，添加此用户
                    ubalance = config.credit;
                    return _.query($sqlQuery.add, insertObj);
                }
            })
            .then(function () {
                const resUserInfo = Object.assign({}, userInfo, { balance: ubalance });
                delete resUserInfo.openId && delete resUserInfo.watermark;
                return {
                    userInfo: resUserInfo,
                    skey: skey
                }
            })
            .catch(function (e) {
                console.log('save userInfo error -- 保存用户错误', JSON.stringify(e));
                return {
                    errmsg: JSON.stringify(e)
                }
            })
    },

    /**
     * 根据用户登录信息获取积分余额
     */
    getUsersBalance: function (skey) {
        return _.query($sqlQuery.getBalance, skey);
    },

    /**
     * 获取用户信息，提供给推送消息使用
     */
    getUserId: function (skey, content, bookid) {
        return _.query($sqlQuery.getId, [skey, content]);
    },

    /**
     * 获取用户已购书籍列表
     */
    getBoughtBooks: function (skey) {
        return _.query($sqlQuery.getBoughtBooks, skey);
    }
}

module.exports = user;
const Push = require('../dao/push');
const Users = require('../dao/users');
const http = require('axios');
const moment = require('moment');

module.exports = {

    /**
     * 向用户推送模板消息
     */
    pushMessageToUser: function (req, res, next) {
        const {
            formid,
            skey,
            content,
            bookid
        } = req.body;

        let access_token = '',
            openid = '',
            uname = '',
            ccontent = '',
            bkname = '',
            bkauthor = '',
            bkfile = '',
            bkpublisher = '',
            bkcover = '',
            utime = moment().format('YYYY-MM-DD HH:mm:ss');

        // 初始化模板id和跳转页面的路由
        const template_id = '7Atof-_EfXTVbBg0dMoERaQ1iHBZV72iX235yDZ5tEE',
            page = '/pages/detail/detail';

        // 获取接口调用凭证 token
        Push.getPusherToken()
            .then((resData) => {

                if (resData && resData[0] && resData[0].token) {
                    access_token = resData[0].token;
                }

                // 获取用户信息
                return Users.getUserId(skey, content, bookid);
            })
            .then((resData) => {
                if (resData && resData[0] && resData[0].uid) {
                    openid = resData[0].uid;
                    uname = resData[0].uname;
                    ccontent = resData[0].ccontent;
                    bkname = resData[0].bkname;
                    bkauthor = resData[0].bkauthor;
                    bkcover = resData[0].bkcover;
                    bkpublisher = resData[0].bkpublisher;
                    bkfile = resData[0].bkfile;
                    utime = moment(resData[0].ctime).format('YYYY-MM-DD HH:mm:ss');
                }

                if (!access_token || !openid) {
                    throw new Error('信息获取失败!');
                } else {
                    // 调用微信后台提供的发送模板消息的接口
                    const paramObj = {
                        touser: openid,
                        template_id,
                        page: page + '?id=' + bookid + '&name=' + bkname + '&author=' + bkauthor + '&image=' + bkcover + '&publisher=' + bkpublisher + '&file=' + bkfile,
                        form_id: formid,
                        data: {
                            keyword1: {
                                value: bkname,
                                color: '#1aad19'
                            },
                            keyword2: {
                                value: ccontent,
                                color: '#1e1e1e'
                            },
                            keyword3: {
                                value: utime,
                                color: '#cdcdcd'
                            }
                        }
                    }

                    return http({
                        url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + access_token,
                        method: 'POST',
                        data: paramObj
                    })
                }
            })
            .then((resData) => {
                console.log(resData,'!!!');
            })
            .catch((error) => {
                console.log('推送评论消息失败::', error);
            })
    }

}
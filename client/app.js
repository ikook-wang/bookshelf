// app.js

const api = require('./config/config.js');

App({
    // 小程序启动生命周期
    onLaunch: function () {
        let that = this;

        // 检查登录状态
        that.checkLoginStatus();
    },

    // 检查本地 storage 中是否有登录态标识
    checkLoginStatus: function () {
        let that = this;
        let loginFlag = wx.getStorageSync('loginFlag');
        if (loginFlag) {
            // 检查 session_key 是否过期
            wx.checkSession({
                // session_key 有效（未过期）
                success: function () {
                    // 直接从 Storage 中获取用户信息
                    let userStorageInfo = wx.getStorageSync('userInfo');
                    if (userStorageInfo) {
                        that.globalData.userInfo = JSON.parse(userStorageInfo);
                    } else {
                        that.showInfo('缓存信息缺失');
                        console.error('登录成功后将用户信息存在Storage的userStorageInfo字段中，该字段丢失');
                    }
                },
                // session_key 过期
                fail: function () {
                    // 跳转到登录授权页，重新登录
                    wx.navigateTo({
                        url: './pages/login/login'
                    })
                }
            });
        } else {
            // 没有登录标识，跳转到登录授权页
            wx.navigateTo({
                url: './pages/login/login'
            });
        }
    },

    // 登录动作
    doLogin: function (callback = () => {}) {
        let that = this;

        wx.login({
            success: function (loginRes) {
                if (loginRes.code) {

                    /**
                     * @desc: 获取用户信息 期望数据如下 
                     *
                     * @param: userInfo       [Object]
                     * @param: rawData        [String]
                     * @param: signature      [String]
                     * @param: encryptedData  [String]
                     * @param: iv             [String]
                     */
                    wx.getUserInfo({
                        withCredentials: true,   // 是否带上登录态信息, 非必填，默认为 true

                        success: function (infoRes) {
                            console.log("getUserInfo 返回值：", infoRes);

                            // 请求服务器的登录接口
                            wx.request({
                                url: api.loginUrl,

                                data: {
                                    code: loginRes.code,            // 临时登录凭证
                                    rawData: infoRes.rawData,       // 用户非敏感信息，用户计算签名
                                    signature: infoRes.signature,    // 签名，用于校验用户信息
                                    encryptedData: infoRes.encryptedData,    // 用户敏感信息
                                    iv: infoRes.iv                           // 解密算法的向量
                                },

                                success: function (res) {
                                    console.log('login success--登录成功！！');
                                    console.log('返回的信息：', res);

                                    res = res.data;

                                    if (res.result === 0) {
                                        that.globalData.userInfo = res.userInfo;
                                        wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
                                        wx.setStorageSync('loginFlag', res.skey);
                                        callback();
                                    } else {
                                        that.showInfo(res.errmsg);
                                    }
                                },

                                fail: function () {
                                    // 调用服务器登录端口失败
                                    that.showInfo('调用登录接口失败');
                                    console.log(error);
                                }

                            });
                        },

                        fail: function () {
                            // 获取 userInfo 失败，去检查是否开启权限
                            wx.hideLoading();
                            that.checkUserInfoPermission();
                        }

                    });

                } else {
                    // 获取 code 失败
                    that.showInfo('登录失败，调用 wx.login 获取 code 失败');
                    console.log('调用 wx.login 获取 code 失败');
                }
            },

            fail: function (error) {
                // 调用 code 失败
                that.showInfo('wx.login 接口调用失败');
                console.log(error);
            }

        });
    },

    // 检查用户信息权限设置
    checkUserInfoPermission: function (callback = () => { }) {
        wx.getSetting({
            success: function (res) {
                if (!rse.autoSetting['spoce.useeInfo']) {
                    wx.openSetting({
                        success: function (autoSetting) {
                            console.log(autoSetting);
                        }
                    });
                }
            },
            fail: function (error) {
                console.log(error);
            }
        });
    },

    // 获取用户登录标示 供全局调用
    getLoginFlag: function () {
        return wx.getStorageSync('loginFlag');
    },

    // 获取书籍已下载路径
    getDownloadPath: function (key) {
        return wx.getStorageSync(key);
    },

    // 封装 wx.showToast 方法
    showInfo: function (info = 'error', icon = 'none') {
        wx.showToast({
            title: info,
            icon: icon,
            duration: 1500,
            mask: true
        });
    },

    // 调用 wx.saveFile 将文件保存到本地
    saveDownloadPath: function (key, filePath) {
        return new Promise((resovle, reject) => {
            wx.saveFile({
                tempFilePath: filePath,
                success: function (res) {
                    // 保存成功， 在 Storage 中标记，下次不再下载
                    let savedFilePath = res.savedFilePath;

                    wx.setStorageSync(key, savedFilePath);
                    resovle(savedFilePath);
                },

                fail: function () {
                    reject(false);
                }
            });
        })
    },

    // 打开书籍文件
    openBook: function (filePath) {
        wx.openDocument({
            filePath: filePath,
            success: function (res) {
                // console.log('打开文档成功');
            },
            fail: function (error) {
                // console.log(error);
            }
        });
    },

    // app全局数据
    globalData: {
        userInfo: null
    }
});
const app = getApp();
const api = require('../../config/config.js');

Page({

    data: {
        bookInfo: {},           // 书籍信息，在打开当前页面中路径的参数中获取
        commentList: [],        // 评论列表
        bookIsBuy: -1,          // 是否已购买
        commentLoading: true,   // 评论loading态
        downloading: false,     // 是否正在下载
        downloadPercent: 0      // 当前书籍下载百分比
    },

    /**
     * 跳转到评论页面
     */
    goComment: function (ev) {

        // 获取dataset
        let info = ev.currentTarget.dataset;
        let navigateUrl = '../comment/comment?';

        for (let key in info) {
            info[key] = encodeURIComponent(info[key]);
            navigateUrl += key + '=' + info[key] + '&';
        }

        navigateUrl = navigateUrl.substring(0, navigateUrl.length - 1);

        wx.navigateTo({
            url: navigateUrl
        });
    },

    /**
     * 打开已下载的书籍
     */
    readBook: function () {
        let that = this;
        let fileUrl = that.data.bookInfo.file;
        let key = 'book_' + that.data.bookInfo.id;

        // 书籍是否已经下载过
        let downloadPath = app.getDownloadPath(key);
        if (downloadPath) {
            app.openBook(downloadPath);
            return;
        }

        const downloadTask = wx.downloadFile({
            url: fileUrl,
            success: function (res) {
                let filePath = res.tempFilePath;
                that.setData({
                    downloading: false
                });

                // 调用文件保存 api(wx.saveFile)将文件保存在本地
                app.saveDownloadPath(key, filePath)
                    .then(function (saveFilePath) {
                        app.openBook(saveFilePath);
                    })
                    .catch(function () {
                        app.showInfo('文件保存失败');
                    })

            },
            fail: function (error) {
                that.showInfo('文档下载失败');
                console.log(error);
            }
        });

        downloadTask.onProgressUpdate(function (res) {
            that.setData({
                downloading: true,
                downloadPercent: res.progress
            });
        });
    },

    /**
     * 点击兑换按钮, 确认兑换提示框
     */
    confirmBuyBook: function () {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '确定用 1 积分兑换此书吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#8a8a8a',
            confirmText: '确定',
            confirmColor: '#1AAD19',
            success: function (res) {
                if (res.confirm) {
                    // 兑换
                    that.buyBook();

                } else if (res.cancel) {
                    // 取消
                }
            }
        });
    },

    /**
     * 进行兑换
     */
    buyBook: function () {
        let that = this;
        let requestData = {
            bookid: that.data.bookInfo.id,
            skey: app.getLoginFlag()
        };

        wx.request({
            url: api.buyBookUrl,
            method: 'POST',
            data: requestData,
            success: function (res) {
                console.log(res);
                if (res.data.result === 0) {
                    // 将按钮置为“打开”
                    // 更新用户兑换币的值
                    that.setData({
                        bookIsBuy: 1
                    });

                    app.globalData.userInfo.balance = res.data.ubalance;
                    wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo));

                    that.showInfo(res.data.errmsg, 'success');
                } else {
                    that.showInfo(res.data.errmsg);
                }
            },
            fail: function (error) {
                that.showInfo('兑换请求失败');
            }
        });
    },

    /**
     * 获取书籍评论列表以及是否以及购买此书籍
     */
    getPageData: function () {
        let that = this;
        let requestData = {
            bookid: this.data.bookInfo.id,
            skey: app.getLoginFlag()
        };

        console.log(requestData);

        wx.request({
            url: api.queryBookUrl,
            method: 'GET',
            data: requestData,
            success: function (res) {
                console.log(res);
                if (res.data.result === 0) {
                    that.setData({
                        commentList: res.data.data.lists || [],
                        bookIsBuy: res.data.data.is_buy
                    });

                    setTimeout(function () {
                        that.setData({
                            commentLoading: false
                        })
                    }, 500);
                } else {
                    that.showInfo('返回评论异常');
                }
            },

            fail: function () {
                that.showInfo('评论请求失败');
            }
        });
    },

    /**
     * 显示 toast
     */
    showInfo: function (info, icon = 'none') {
        wx.showToast({
            title: info,
            icon: icon,
            duration: 1500,
            mask: true
        });
    },

    /**
     * 生命周期函数 -- 监听页面加载，获取打开当前页面中路径的参数
     */
    onLoad: function (options) {
        // console.log(options);
        let _bookInfo = {};

        for (let key in options) {
            _bookInfo[key] = decodeURIComponent(options[key]);
        }

        this.setData({
            bookInfo: _bookInfo
        });

        // 页面加载时去拉取评论列表
        this.getPageData();
    },

    /**
     * 从上级页面返回时，重新拉取评论列表。 此处，即从评论页返回时。
     */
    backRefreshPage: function () {
        let that = this;

        that.setData({
            commentLoading: true
        });

        that.getPageData();
    },

    /**
     * 生命周期函数 -- 监听页面显示
     */
    onShow: function () {
        // 判断是否是从评论页面返回，如果是，则执行返回时的逻辑
        // 此处的缓存是在提交评论时存入
        if (wx.getStorageSync('isFromBack')) {
            wx.removeStorageSync('isFromBack')
            this.backRefreshPage();
        }
    }


})
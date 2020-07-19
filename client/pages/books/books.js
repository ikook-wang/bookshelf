// pages.js

// 获取服务器接口地址
const api = require('./../../config/config.js');

// 获取 app 应用实例
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bookList: [],               // 书籍列表数组
        indicatorDots: false,       // 是否显示轮播图指示点
        autoplay: false,            // 是否自动播放轮播图
        interval: 5000,             // 轮播间隔
        duration: 1000,             // 轮播播放延迟
        circular: true,             // 是否采用衔接滑动
        sideMargin: '100rpx',       // 幻灯片前后边距
        showLoading: true,           // 是否显示 loading 态
        imageBtn: '/images/share.png'
    },

    /**
     * 打开书籍详情页面
     */
    goDetail: function (ev) {
        console.log(ev);
        let info = ev.currentTarget.dataset;

        let navigateUrl = '../detail/detail?';

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
     * 阻止点击分享按钮时跳转页面
     */
    catchDetail: function(ev) {
    },

    /**
     * 获取所有书籍列表
     */
    getBookList: function () {
        let that = this;

        wx.request({
            url: api.getBooksUrl,
            data: {
                is_all: 1
            },
            success: function (res) {
                let data = res.data;
                // console.log(data);

                if (data.result === 0) {
                    setTimeout(function () {
                        that.setData({
                            bookList: data.data,
                            showLoading: false
                        });
                    }, 800);
                }
            },
            error: function (err) {
                console.log(err);
            }

        });
    },

    /**
     * 生命周期函数 -- 监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        that.getBookList();
    },

    /**
     * 生命周期函数 -- 监听页面初次渲染完成
     */
    onReady: function () {
        // console.log('current page is onReady');
    },

    /**
     * 生命周期函数 -- 监听页面显示
     */
    onShow: function () {
        // console.log('current page is onShow');
    },

    /**
     * 设置页面转发信息
     */
    onShareAppMessage: function (res) {

        if (res.from === 'button') {
            let info = res.target.dataset;

            let shareUrl = '/pages/detail/detail?';

            for (let key in info) {
                shareUrl += key + '=' + encodeURIComponent(info[key]) + '&';
            }
            
            shareUrl = shareUrl.substring(0, shareUrl.length - 1);

            // 来自页面内的转发按钮
            return {
                title: res.target.dataset.name,
                path: shareUrl,
                imageUrl: res.target.dataset.image,
                success: function () {
                    // 转发成功
                    console.log('转发成功');
                },
                fail: function () {
                    // 转发失败
                    console.log('转发失败');
                }
            }
        }
        return {
            title: '小书架首页',
            path: '/pages/books/books',
            imageUrl: '/images/bookstore.png',
            success: function () {
                // 转发成功
                console.log('转发成功');
            },
            fail: function () {
                // 转发失败
                console.log('转发失败');
            }
        }
    }
});
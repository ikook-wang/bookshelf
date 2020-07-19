// 获取 app 实例
const app = getApp();

Page({

    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },

    bindGetUserInfo: function (e) {
        if (e.detail.userInfo) {
            this.doLogin();

            // 授权并登录成功后，跳转到小程序首页
            wx.switchTab({
                url: './../../pages/books/books'
            });
        } else {
            // 用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入！！！',
                showCancel: false,
                confirmText: '返回授权',
                success: function (res) {
                    if (res) {
                        console.log('用户点击了「返回授权」');
                    }
                }
            });
        }
    },

    /**
     * 执行登录操作
     */
    doLogin: function () {
        let that = this;
        wx.showLoading({
            title: "登录中...",
            mask: true
        });
        app.doLogin();
    }
})
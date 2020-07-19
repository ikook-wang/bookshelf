// 服务器域名
const baseUrl = 'http://books.chinakook.com/';

// 获取书籍信息接口地址（可选择全部或者单个书籍)
const getBooksUrl = baseUrl + 'api/book/getBooks';

// 登录接口
const loginUrl = baseUrl + 'login';

// 查询当前用户是否已经购买该书籍并返回评论列表接口
const queryBookUrl = baseUrl + 'api/book/queryBook';

// 兑换书籍接口
const buyBookUrl = baseUrl + 'api/order/buy';

// 提交评论接口
const commentUrl = baseUrl + 'api/comment/write';

// 获取当前用户已购书籍接口
const getBoughtBooksUrl = baseUrl + 'api/user/getBoughtBooks';

module.exports = {
    getBooksUrl: getBooksUrl,
    loginUrl: loginUrl,
    queryBookUrl: queryBookUrl,
    buyBookUrl: buyBookUrl,
    commentUrl: commentUrl,
    getBoughtBooksUrl: getBoughtBooksUrl
};
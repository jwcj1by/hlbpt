var api = require('../../api.js');
const app = getApp()
Page({
  data: {
    list: [{ "id": "2", "store_id": "1", "article_cat_id": "2", "title": "帮助中心", "content": "", "sort": "100", "addtime": "1514515248", "is_delete": "0" }, { "id": "1", "store_id": "1", "article_cat_id": "2", "title": "客服咨询", "content": "", "sort": "101", "addtime": "1514515261", "is_delete": "0" }]
  },
  onLoad: function () {
    // var page = this;
    // app.request({
    //   url: api.ass.service_center,
    //   data: {
    //     store_id: 1
    //   },
    //   success: function (res) {
    //     if (res.code == 0) {
    //       // page.setData({ list: res.data });
    //     }
    //   },
    //   complete: function () {
    //     wx.stopPullDownRefresh();
    //   }
    // });
  }
})
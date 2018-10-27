//index.js
var api = require('../../api.js');
var utils = require('../../utils/utils.js');
const app = getApp()
Page({
  data: {
    topTab: [
      { name: '0元购', id: 0 },
      { name: '爱拼团', id: 1 }
    ],
    tabIndex: 0,
    insertTime: [],
    soon: [],
    hideHeaderShow: false,
  },
  onShareAppMessage: function (options) {
    var page = this;
    return {
      path: "/pages/index/index",
      success: function (e) { }
    }
  },
  onPullDownRefresh: function () { // 下拉
    var self = this
    if (self.data.tabIndex == 0) {
      self.apiIndex()
    } else {
      self.apiTan()
    }
  },
  onLoad: function () {
    this.apiIndex()
  },
  apiIndex: function () {
    var page = this;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.index,
      data: {
        store_id: 1
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData(res.data);
          page.data.snapup && page.data.snapup.length > 0 && page.data.snapup.forEach((item, index) => {
            utils.interval(Date.parse(item.time), page, index, page.data.insertTime, function (e) {
              page.setData({ insertTime: e })
            })
          })

          page.data.comingsoon && page.data.comingsoon.length > 0 && page.data.comingsoon.forEach((item, index) => {
            utils.interval(Date.parse(item.time), page, index, page.data.soon, function (e) {
              page.setData({ soon: e })
            })
          })
        }
      },
      complete: function () {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      },
      logins: function (e) {
        page.apiIndex()
      }
    });
  },
  apiTan: function () {
    var page = this;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.indexTan,
      data: {
        store_id: 1
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({snapups:res.data});
        }
      },
      complete: function () {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      },
      logins: function (e) {
        page.apiIndex()
      }
    });
  },
  onTab: function (e) {
    var self = this;
    this.setData({
      tabIndex: parseInt(e.target.id)
    });
    if (e.target.id == 1) {
      if (self.data.snapups) return
      self.apiTan()
    } else {
      if (self.data.snapup) return
      self.apiIndex()
    }
  },
  ontozeros: function () {
    wx.showToast({
      title: '活动已结束',
      image: "/image/icon-warning.png"
    })
  }

})

// user.js
var api = require('../../api.js');
var app = getApp();
Page({
  data: {
    contact_tel: "",
    show_customer_service: 0,
  },
  loadData: function (options) {
    var page = this;
    page.setData({
      store: wx.getStorageSync('store'),
    });
    app.request({
      url: api.user.index,
      success: function (res) {
        if (res.code == 0) {
          page.setData(res.data);
          wx.setStorageSync("share_setting", res.data.share_setting);
          wx.setStorageSync("user_info", res.data.user_info);
        }
      }
    });
  },
  onShow: function () {
    var page = this;
    page.loadData();
  },

  callTel: function (e) {
    var tel = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel, //仅为示例，并非真实的电话号码
    });
  }
});
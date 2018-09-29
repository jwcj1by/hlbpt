var api = require('../../api.js');
var utils = require('../../utils/utils.js');
var app = getApp();
Page({
  data: {
    order_id: '',
    zeros: 0,
    clock: '',
    time:''
  },
  onsharewxqrcode: function () {
    var page = this;
    wx.showLoading({
      title: "正在加载",
    });
    app.request({
      url: api.share.wxqrcode,
      data: {
        scene: page.data.order_id,
        page: "pages/zeroyuan/zeroyuan"
      },
      success: function (res) {
        if (res.code == 0) {

          wx.previewImage({
            current: res.qrcode_path, // 当前显示图片的http链接
            urls: [res.qrcode_path] // 需要预览的图片http链接列表
          })

        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  onLoad: function (options) {
    var page = this;
    var pages = getCurrentPages();
    if (pages.length < 2) {
      page.setData({
        show_index: true,
      });
    }

    page.setData({
      order_id: options.id
    });
    wx.showLoading({
      title: "正在加载",
    });
    app.request({
      url: api.order.detail,
      data: {
        order_id: page.data.order_id,
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            order: res.data,
            time: res.data.group_buy.end_time
          });
          utils.countdown(page, page.data.time)
        } else {
          wx.showModal({
            content: res.msg,
            showCancel: false,
            confirmText: "确认",
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: "/pages/my-tan/my-tan",
                });
              }
            }
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  onShareAppMessage: function () {
    var page = this;
    var user_info = wx.getStorageSync("user_info");
    var res = {
      path: "/pages/tan-detail/tan-detail?id=" + page.data.order_id + "&user_id=" + user_info.id,
      success: function (e) {
        console.log(e);
        // share_count++;
        // if (share_count == 1)
        //   app.shareSendCoupon(page);
      },
      title: "快来参加"+page.data.order.goods_total_price+"元拼"+page.data.order.group_buy.goods_name
    };
    console.log(page.data.order_id)
    return res;
  },
  onCtan:function(){
    var page = this;
    var db = page.data.order.group_buy
    wx.navigateTo({
      url: "/pages/order-submit/order-submit?goods_info=" + JSON.stringify({
        goods_id: page.data.order.goods_list[0].id,
        attr: JSON.parse(db.form_data.goods_info),
        num: page.data.order.num,
        buy_type: db.form_data.buy_type,
        user_type: 1,
        groupbuy_user_id: db.form_data.groupbuy_user_id,
        order_id: page.data.order_id
      }),
    });
  },
  onMyZero: function () {
    var page = this;
    wx.showLoading({
      title: "正在加载",
    });
    app.request({
      url: api.share.promotionsreceive,
      data: {
        order_id: page.data.order_id,
      },
      success: function (res) {
        if (res.code == 0) {
          console.log(res)
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  onToZero: function () {
    var page = this;
    wx.showLoading({
      title: "正在加载",
    });
    app.request({
      url: api.share.promotionshelp,
      data: {
        order_id: page.data.order_id,
      },
      success: function (res) {
        if (res.code == 0) {
          console.log(res)
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  }
})
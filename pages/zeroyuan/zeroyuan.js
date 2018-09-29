var api = require('../../api.js');
var utils = require('../../utils/utils.js');
var app = getApp();
Page({
  data: {
    order_id: '',
    zeros: 0,
    okShow: false,
    zeroZl: '',
    zeroOk: false,
    clock: '',
    time: ''
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
  onShow: function (ops) {
    // if (app.globalData.zeroshare.id){
    //   this.onDetail()
    // }
    console.log(app.globalData.zeroshare)
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
      order_id: options.id ? options.id : options.scene
    });

    if (app.globalData.zeroshare) {
      page.setData({
        order_id: app.globalData.zeroshare.scene
      });
      page.onDetail(app.globalData.zeroshare.scene)
      app.globalData.zeroshare = null
      
    } else {
      page.onDetail(page.data.order_id)
    }
  },
  onDetail: function (order_id) {
    var page = this;
    wx.showLoading({
      title: "正在加载",
    });
    app.request({
      url: api.order.detail,
      data: {
        order_id: order_id,
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            order: res.data,
            zeros: res.data.promotions.helps.finish_percentage,
            time: res.data.promotions.helps.end_time,
            zeroOk: res.data.promotions.helps.is_finished
          });
          utils.countdown(page, page.data.time)
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
      path: "/pages/zeroyuan/zeroyuan?scene=" + page.data.order_id + "&user_id=" + user_info.id,
      success: function (e) {
        console.log(e);
        // share_count++;
        // if (share_count == 1)
        //   app.shareSendCoupon(page);
      },
      title: user_info.nickname + "邀请您帮他助力0元购，是时候证明你们的感情了！"
    };
    return res;
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
          wx.redirectTo({
            url: "/pages/order/order?status=1",
          });
        } else if(res.code == 3) {
          wx.showModal({
            content: res.msg,
            confirmText: "确认",
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: "/pages/order/order?status=-1",
                });
              }
            }
          });
        } else {
          wx.showModal({
            title: "提示",
            content: res.msg,
            confirmText: "确认",
            success: function (res) {
              if (res.confirm) {
                page.submitpay()
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
  submitpay:function(){
    var page = this;
    app.request({
      url: api.order.pay_data,
      data: {
        store_id: 1,
        order_id: page.data.order_id,
        pay_type: 'WECHAT_PAY',
      },
      success: function (res) {
        if (res.code == 0) {
          //发起支付
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success: function (e) {
              wx.redirectTo({
                url: "/pages/order/order?status=1",
              });
            },
            fail: function (e) {
            },
            complete: function (e) {
              if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                wx.showModal({
                  title: "提示",
                  content: "订单尚未支付",
                  showCancel: false,
                  confirmText: "确认",
                  success: function (res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: "/pages/order/order?status=0",
                      });
                    }
                  }
                });
                return;
              }
              if (e.errMsg == "requestPayment:ok") {
                return;
              }
              wx.redirectTo({
                url: "/pages/order/order?status=-1",
              });
            },
          });
          return;
        }
        if (res.code == 1) {
          wx.showToast({
            title: res.msg,
            image: "/image/icon-warning.png",
          });
          return;
        }
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
          page.setData({
            zeroZl: res.data.help_amuont,
            okShow: true
          })
          page.onDetail(page.data.order_id)
        } else {
          wx.showModal({
            content: res.msg,
            showCancel: false
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  onOkShow: function () {
    this.setData({
      okShow: false
    })
  }
})
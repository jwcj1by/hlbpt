// order-submit.js
var api = require('../../api.js');

var app = getApp();
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
import { STORE_ID_SET } from '../../utils/status'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: null, // 地址
    priview_data: {},
    goods_list: [],
    total_price: 0, // 总价
    express_price: 0, // 运费
    cart_id_list: [],
    content: '',
    offline: 0,
    express_price_1: 0.00,
    name: "",
    mobile: ""
  },
  numberSub: function (e) {
    var page = this;
    var list = JSON.parse(page.data.options.goods_info)
    var num = list.num
    if (num <= 1)
      return true
    list.num--
    page.setData({
      options: {
        goods_info: JSON.stringify(list)
      },
    });
    page.getOrderData(page.data.options)
  },
  numberAdd: function (e) {
    var page = this;
    var list = JSON.parse(page.data.options.goods_info)
    var num = list.num
    list.num++
    page.setData({
      options: {
        goods_info: JSON.stringify(list)
      },
    });
    page.getOrderData(page.data.options)
  },
  numberBlur: function (e) {
    var page = this;
    var num = e.detail.value;
    var list = JSON.parse(page.data.options.goods_info)
    if (isNaN(num))
      num = 1;
    if (num <= 0)
      num = 1;
    list.num = parseInt(num);
    page.setData({
      options: {
        goods_info: JSON.stringify(list)
      },
    });
    page.getOrderData(page.data.options)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let _options = options
    let data = {
      cart_id_list: _options.cart_id_list,
      // address_id: 1,
      buy_type: 1
    }
    const RES = await app.fetch({
      url: api.order.submit_preview,
      // method: 'POST',
      data
    })
    this.setData({
      address: RES.address,
      priview_data: RES,
      goods_list: RES.list,
      total_price: RES.total_price,
      express_price: RES.express_price,
      cart_id_list: RES.cart_id_list
    })
  },
  getOffline: function (e) {
    var express = this.data.express_price;
    var express_1 = this.data.express_price_1;
    var offline = e.target.dataset.index;
    if (offline == 1) {
      this.setData({
        offline: offline,
        express_price: 0,
        express_price_1: express
      });
    } else {
      this.setData({
        offline: offline,
        express_price: express_1
      })
    }
  },
  async orderSubmit () {
    let _cart_id_list = this.data.cart_id_list
    wx.showLoading({
      title: "正在提交",
      mask: true,
    });
    //提交订单
    try {
      const RES = await app.fetch({
        url: api.order.submit,
        method: 'POST',
        data: {
          address_id: this.data.address.id,
          offline: 0,
          cart_id_list: JSON.stringify(_cart_id_list),
          buy_type: STORE_ID_SET.FIRST
        }
      })
    } catch (error) {
      console.error(error)
    }
   
  },
  getOrderData: function (options) {
    var page = this;
    var address_id = "";
    if (page.data.address && page.data.address.id)
      address_id = page.data.address.id;
    if (options.cart_id_list) {
      var cart_id_list = JSON.parse(options.cart_id_list);
      wx.showLoading({
        title: "正在加载",
        mask: true,
      })
      app.request({
        url: api.order.submit_preview,
        data: {
          cart_id_list: options.cart_id_list,
          address_id: address_id,
        },
        success: function (res) {
          wx.hideLoading();
          if (res.code == 0) {
            page.setData({
              total_price: parseFloat(res.data.total_price),
              goods_list: res.data.list,
              cart_id_list: res.data.cart_id_list,
              address: res.data.address,
              express_price: parseFloat(res.data.express_price),
              coupon_list: res.data.coupon_list,
              shop_list: res.data.shop_list,
              shop: res.data.shop_list[0] || {},
              name: res.data.address ? res.data.address.name : '',
              mobile: res.data.address ? res.data.address.mobile : '',
              send_type: res.data.send_type,
              level: res.data.level,
              total_price_1: parseFloat(res.data.total_price),
            });
            if (res.data.send_type == 1) { //仅快递
              page.setData({
                offline: 0,
              });
            }
            if (res.data.send_type == 2) { //仅自提
              page.setData({
                offline: 1,
              });
            }
            if (res.data.level) {
              page.setData({
                total_price_1: parseFloat((res.data.total_price * res.data.level.discount / 10).toFixed(2))
              });
            }
          }
          if (res.code == 1) {
            wx.showModal({
              title: "提示",
              content: res.msg,
              showCancel: false,
              confirmText: "返回",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1,
                  });
                }
              }
            });
          }
        }
      });
    }
    if (options.goods_info) {
      wx.showLoading({
        title: "正在加载",
        mask: true,
      });

      var cde = {
        goods_info: options.goods_info,
        address_id: address_id,
        buy_type: JSON.parse(options.goods_info).buy_type
      }
      if (JSON.parse(options.goods_info) && JSON.parse(options.goods_info).user_type == 1) {
        cde.groupbuy_user_id = JSON.parse(options.goods_info).groupbuy_user_id
        cde.user_type = 1
      }
      app.request({
        url: api.order.submit_preview,
        data: cde,
        success: function (res) {
          wx.hideLoading();
          if (res.code == 0) {
            page.setData({
              total_price: res.data.total_price,
              goods_list: res.data.list,
              goods_info: res.data.goods_info,
              address: res.data.address,
              express_price: parseFloat(res.data.express_price),
              coupon_list: res.data.coupon_list,
              shop_list: res.data.shop_list,
              shop: res.data.shop_list[0] || {},
              name: res.data.address ? res.data.address.name : '',
              mobile: res.data.address ? res.data.address.mobile : '',
              send_type: res.data.send_type,
              level: res.data.level,
              total_price_1: parseFloat(res.data.total_price),
            });
            if (res.data.send_type == 1) { //仅快递
              page.setData({
                offline: 0,
              });
            }
            if (res.data.send_type == 2) { //仅自提
              page.setData({
                offline: 1,
              });
            }
            if (res.data.level) {
              page.setData({
                total_price_1: parseFloat((res.data.total_price * res.data.level.discount / 10).toFixed(2))
              });
            }
          }
          if (res.code == 1) {
            wx.showModal({
              title: "提示",
              content: res.msg,
              showCancel: false,
              confirmText: "返回",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1,
                  });
                }
              }
            });
          }
        }
      });
    }
  },
  copyText: function (e) {
    var text = e.currentTarget.dataset.text;
    if (!text)
      return;
    wx.setClipboardData({
      data: text,
      success: function () {
        wx.showToast({
          title: "已复制内容",
        });
      },
      fail: function () {
        wx.showToast({
          title: "复制失败",
          image: "/image/icon-warning.png",
        });
      },
    });
  },
  showCouponPicker: function () {
    var page = this;
    if (page.data.coupon_list && page.data.coupon_list.length > 0) {
      page.setData({
        show_coupon_picker: true,
      });
    }
  },
  pickCoupon: function (e) {
    var page = this;
    var index = e.currentTarget.dataset.index;
    if (index == '-1' || index == -1) {
      page.setData({
        picker_coupon: false,
        show_coupon_picker: false,
      });
    } else {
      var new_total_price = page.data.total_price - page.data.coupon_list[index].sub_price;
      if (page.data.level) {
        new_total_price = new_total_price * page.data.level.discount / 10;
      }
      page.setData({
        picker_coupon: page.data.coupon_list[index],
        show_coupon_picker: false,
        new_total_price: parseFloat(new_total_price.toFixed(2)),
      });
    }
  },
  numSub: function (num1, num2, length) {
    return 100;
  },
  showShop: function (e) {
    var page = this;
    if (page.data.shop_list && page.data.shop_list.length > 1) {
      page.setData({
        show_shop: true,
      });
    }
  },
  pickShop: function (e) {
    var page = this;
    var index = e.currentTarget.dataset.index;
    if (index == '-1' || index == -1) {
      page.setData({
        shop: false,
        show_shop: false,
      });
    } else {
      page.setData({
        shop: page.data.shop_list[index],
        show_shop: false,
      });
    }
  },
  KeyName: function (e) {
    this.setData({
      name: e.detail.value
    });
  },
  KeyMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },

});
// standard-good-detail.js
var api = require('../../api.js');
var utils = require('../../utils/utils.js');
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var p = 1;
var is_loading_comment = false;
var is_more_comment = true;
var share_count = 0;
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await

Page({
  data: {
    clock: '',
    cartbuy: '',
    groupTime: [],
    cartPrice: '',
    id: null,
    types: '',
    promotions_id: '',
    time: '',
    goods: {},
    show_attr_picker: false,
    form: {
      number: 1,
    },
    tab_detail: "active",
    tab_comment: "",
    tab_goods: "",
    comment_list: [],
    comment_count: {
      score_all: 0,
      score_3: 0,
      score_2: 0,
      score_1: 0,
    },
    autoplay: false,
    hide: "hide",
    show: false,
    x: wx.getSystemInfoSync().windowWidth,
    y: wx.getSystemInfoSync().windowHeight - 20,
    hideHeaderShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    share_count = 0;
    p = 1;
    is_loading_comment = false;
    is_more_comment = true;
    this.setData({
      store: wx.getStorageSync('store'),
      types: options.type,
      promotions_id: options.promotions_id || ''
    });

    var parent_id = 0;
    var user_id = options.id;

    var scene = decodeURIComponent(options.scene);
    if (user_id != undefined) {
      parent_id = user_id;
    } else if (scene != undefined) {
      console.log("scene string=>" + scene);
      //var scene_obj = utils.scene_decode(scene);
      //console.log("scene obj=>" + JSON.stringify(scene_obj));
      // if (scene_obj.uid && scene_obj.gid) {
      //   parent_id = scene_obj.uid;
      //   options.id = scene_obj.gid;
      // } else {
      //   parent_id = scene;
      // }
    }
    app.loginBindParent({
      parent_id: parent_id
    });
    var page = this;
    page.setData({
      id: options.id,
    });
    page.getGoods();
    page.getCommentList();
  },
  onPullDownRefresh: function () { // 下拉
    var self = this
    self.getGoods();
  },
  onToTan: function (e) {
    var page = this
    console.log(e.currentTarget.dataset.v)
    var v = e.currentTarget.dataset.v
    wx.navigateTo({
      url: "/pages/order-submit/order-submit?goods_info=" + JSON.stringify({
        goods_id: page.data.id,
        attr: JSON.parse(v.goods_info),
        num: 1,
        buy_type: v.buy_type,
        user_type: v.user_type,
        nick_name: v.nick_name
      }),
    })
  },
  getGoods: function () {
    var page = this;
    var d = {
      store_id: 1,
      id: page.data.id
    }
    if (page.data.types != 'tan' && page.data.promotions_id) {
      d.promotions_id = page.data.promotions_id
    }
    wx.showLoading({
      title: "正在加载",
      mask: true,
    })
    app.request({
      url: api.default.goods,
      data: d,
      success: function (res) {
        wx.stopPullDownRefresh()
        if (res.code == 0) {

          page.setData({
            goods: res.data,
            attr_group_list: res.data.attr_group_list,
            time: res.data.group_buy ? res.data.group_buy.end_time : ''
          });

          if (page.data.goods.group_buy) {

            page.data.goods.group_buy && page.data.goods.group_buy.buyers.length > 0 && page.data.goods.group_buy.buyers.forEach((item, index) => {
              utils.interval(Date.parse(item.end_date), page, index, page.data.groupTime, function (e) {
                page.setData({
                  groupTime: e
                });
              });
            })

            utils.countdown(page, page.data.time)

          }

          var detail = res.data.detail;
          WxParse.wxParse("detail", "html", detail, page);

        }
        if (res.code == 1) {
          wx.showModal({
            title: "提示",
            content: res.msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: "/pages/index/index"
                });
              }
            }
          });
        }
      },
      complete: function () {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    })
  },
  getCommentList: function (more) {
    var page = this
    if (more && page.data.tab_comment != "active")
      return;
    if (is_loading_comment)
      return;
    if (!is_more_comment)
      return;
    is_loading_comment = true;
    app.request({
      url: api.default.comment_list,
      data: {
        store_id: 1,
        goods_id: page.data.id,
        page: p,
      },
      success: function (res) {
        if (res.code != 0)
          return;
        is_loading_comment = false;
        p++;
        page.setData({
          good_rate: res.data.good_rate,
          all_comments: res.data.all_comments,
          comment_list: more ? page.data.comment_list.concat(res.data.list) : res.data.list,
        });
        if (res.data.list.length == 0)
          is_more_comment = false;
      }
    });
  },
  onGoodsImageClick: function (e) {
    var page = this
    var urls = []
    var index = e.currentTarget.dataset.index;
    //console.log(page.data.goods.pic_list);
    for (var i in page.data.goods.pic_list) {
      urls.push(page.data.goods.pic_list[i].pic_url);
    }
    wx.previewImage({
      urls: urls, // 需要预览的图片http链接列表
      current: urls[index],
    });
  },
  numberSub: function () {
    var page = this;
    var num = page.data.form.number;
    if (num <= 1)
      return true;
    num--;
    page.setData({
      form: {
        number: num,
      }
    });
  },
  numberAdd: function () {
    var page = this;
    var num = page.data.form.number;
    num++;
    page.setData({
      form: {
        number: num,
      }
    });
  },
  numberBlur: function (e) {
    var page = this;
    var num = e.detail.value;
    num = parseInt(num);
    if (isNaN(num))
      num = 1;
    if (num <= 0)
      num = 1;
    page.setData({
      form: {
        number: num,
      }
    });
  },
  addCart() { // 添加至购物车
    this.setData({
      cartPrice: 'one',
      cartbuy: 'ADD_CART'
    })
    this.buybg()
  },
  buyNow() { // 现在购买
    this.setData({
      cartPrice: 'two',
      cartbuy: 'BUY_NOW'
    })
    this.buybg()
  },
  buybg() {
    var page = this
    if (!page.data.show_attr_picker) {
      page.setData({
        show_attr_picker: true,
      })
    }
  },
  submitBuy() {
    this.submit(this.data.cartbuy);
  },
  submitCart() {
    this.submit(this.data.cartbuy)
  },
  submit(type) {
    var page = this
    if (!page.data.show_attr_picker) {
      page.setData({
        show_attr_picker: true,
      })
      return true;
    }
    if (page.data.miaosha_data && page.data.miaosha_data.rest_num > 0 && page.data.form.number > page.data.miaosha_data.rest_num) {
      wx.showToast({
        title: "商品库存不足，请选择其它规格或数量",
        image: "/image/icon-warning.png"
      });
      return true;
    }

    if (page.data.form.number > page.data.goods.num) {
      wx.showToast({
        title: "商品库存不足，请选择其它规格或数量",
        image: "/image/icon-warning.png"
      })
      return true
    }

    var attr_group_list = page.data.attr_group_list
    var checked_attr_list = []

    for (var i in attr_group_list) {
      var attr = false;
      for (var j in attr_group_list[i].attr_list) {
        if (attr_group_list[i].attr_list[j].checked) {
          attr = {
            attr_id: attr_group_list[i].attr_list[j].attr_id,
            attr_name: attr_group_list[i].attr_list[j].attr_name,
          };
          break;
        }
      }
      if (!attr) {
        wx.showToast({
          title: "请选择" + attr_group_list[i].attr_group_name,
          image: "/image/icon-warning.png"
        });
        return true;
      } else {
        checked_attr_list.push({
          attr_group_id: attr_group_list[i].attr_group_id,
          attr_group_name: attr_group_list[i].attr_group_name,
          attr_id: attr.attr_id,
          attr_name: attr.attr_name,
        });
      }
    }

    page.setData({
      show_attr_picker: false,
    })

    let buy_type = '' // buy_type字段，1为普通购买，2为0元购，3为拼团

    if (type == 'ADD_CART') { // 添加购物车
      buy_type = 1
      this.commit_cart(checked_attr_list, page.data.form.number)
    }

    if (type == 'BUY_NOW') { //立即购买
      wx.navigateTo({
        url: "/pages/order-submit/order-submit?goods_info=" + JSON.stringify({
          goods_id: page.data.id,
          attr: checked_attr_list,
          num: page.data.form.number,
          buy_type: 3
        })
      })
    }
  },
  async commit_cart(attr, num) {
    let _this = this
    let _attr_ids = []
    attr.forEach((item) => {
      _attr_ids.push({attr_id: item.attr_id})
    })
    try {
      let res_add_cart = await app.fetch({
        url: api.cart.add_cart,
        method: 'POST',
        data: {
          goods_id: _this.data.id,
          attr: JSON.stringify(_attr_ids),
          num
        }
      })

      // 将商品保存至本地
      let cart_info = wx.getStorageSync('cart_info') || []
      cart_info.push(this.data.goods)
      wx.setStorageSync('cart_info', cart_info)
      wx.showToast({
        mask: true,
        title: '加入购物成功'
      })
    } catch (error) {}
  },
  hideAttrPicker: function () {
    var page = this;
    page.setData({
      show_attr_picker: false,
    });
  },
  showAttrPicker: function () {
    var page = this;
    page.setData({
      show_attr_picker: true,
    });
  },
  attrClick: function (e) {
    var page = this;
    var attr_group_id = e.target.dataset.groupId;
    var attr_id = e.target.dataset.id;
    var attr_group_list = page.data.attr_group_list;
    for (var i in attr_group_list) {
      if (attr_group_list[i].attr_group_id != attr_group_id)
        continue;
      for (var j in attr_group_list[i].attr_list) {
        if (attr_group_list[i].attr_list[j].attr_id == attr_id) {
          attr_group_list[i].attr_list[j].checked = true;
        } else {
          attr_group_list[i].attr_list[j].checked = false;
        }
      }
    }
    page.setData({
      attr_group_list: attr_group_list,
    });

    var check_attr_list = [];
    var check_all = true;
    for (var i in attr_group_list) {
      var group_checked = false;
      for (var j in attr_group_list[i].attr_list) {
        if (attr_group_list[i].attr_list[j].checked) {
          check_attr_list.push(attr_group_list[i].attr_list[j].attr_id);
          group_checked = true;
          break;
        }
      }
      if (!group_checked) {
        check_all = false;
        break;
      }
    }
    if (!check_all)
      return;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.default.goods_attr_info,
      data: {
        goods_id: page.data.goods.id,
        attr_list: JSON.stringify(check_attr_list),
      },
      success: function (res) {
        wx.hideLoading();
        if (res.code == 0) {
          var goods = page.data.goods;
          if (res.data.groupbuy) {
            goods.original_price = res.data.price // 单买价
            goods.price = res.data.groupbuy.groupbuy_price // 团价
            goods.num = res.data.num;
          } else {
            goods.original_price = res.data.price // 单买价
            goods.price = res.data.price // 0元购
            goods.num = res.data.num;
          }


          page.setData({
            goods: goods,
            miaosha_data: res.data.miaosha,
          });
        }
      }
    });

  },
  onZan: function (e) {
    var page = this
    console.log(e)
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });
    app.request({
      url: api.order.order_praise,
      data: {
        comment_id: e.currentTarget.id,
      },
      success: function (res) {
        wx.hideLoading();
        if (res.code == 0) {
          var dd = page.data.comment_list
          dd.forEach(function (v, index, array) {
            if (index == e.currentTarget.dataset.i) {
              v.is_praised = 'yes'
            }
          })
          page.setData({
            comment_list: dd
          })
        } else {
          wx.showModal({
            content: res.msg,
            showCancel: false
          });
        }
      }
    });
  },
  favoriteAdd: function () {
    var page = this;
    app.request({
      url: api.user.favorite_add,
      method: "post",
      data: {
        goods_id: page.data.goods.id,
      },
      success: function (res) {
        if (res.code == 0) {
          var goods = page.data.goods;
          goods.is_favorite = 1;
          page.setData({
            goods: goods,
          });
        }
      }
    });
  },
  favoriteRemove: function () {
    var page = this;
    app.request({
      url: api.user.favorite_remove,
      method: "post",
      data: {
        goods_id: page.data.goods.id,
      },
      success: function (res) {
        if (res.code == 0) {
          var goods = page.data.goods;
          goods.is_favorite = 0;
          page.setData({
            goods: goods,
          });
        }
      }
    });
  },
  tabSwitch: function (e) {
    var page = this;
    var tab = e.currentTarget.dataset.tab;
    if (tab == "detail") {
      page.setData({
        tab_detail: "active",
        tab_comment: "",
        tab_goods: ""
      });
    } else if (tab == "goods") {
      page.setData({
        tab_detail: "",
        tab_comment: "",
        tab_goods: "active"
      });
    } else {
      page.setData({
        tab_detail: "",
        tab_comment: "active",
        tab_goods: ""
      });
    }
  },
  onMome: function () {
    this.setData({
      tab_detail: "",
      tab_comment: "active",
      tab_goods: ""
    });
  },
  commentPicView: function (e) {
    // console.log(e);
    // var page = this;
    // var index = e.currentTarget.dataset.index;
    // var pic_index = e.currentTarget.dataset.picIndex;
    // wx.previewImage({
    //   current: page.data.comment_list[index].pic_list[pic_index],
    //   urls: page.data.comment_list[index].pic_list,
    // });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page = this;
    page.getCommentList(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var page = this;
    var user_info = wx.getStorageSync("user_info");
    var res = {
      path: "/pages/goods/goods?id=" + this.data.id + "&user_id=" + user_info.id,
      success: function (e) {
        console.log(e);
        share_count++;
        if (share_count == 1)
          app.shareSendCoupon(page);
      },
      title: page.data.goods.name,
      imageUrl: page.data.goods.pic_list[0].pic_url,
    };
    return res;
  },
  play(e) {
    var url = e.target.dataset.url; //获取视频链接
    this.setData({
      url: url,
      hide: '',
      show: true,
    });
    var videoContext = wx.createVideoContext('video');
    videoContext.play();
  },

  close: function (e) {
    if (e.target.id == 'video') {
      return true;
    }
    this.setData({
      hide: "hide",
      show: false
    });
    var videoContext = wx.createVideoContext('video');
    videoContext.pause();
  },
  hide: function (e) {
    if (e.detail.current == 0) {
      this.setData({
        img_hide: ""
      });
    } else {
      this.setData({
        img_hide: "hide"
      });
    }
  },

  showShareModal: function () {
    var page = this;
    page.setData({
      share_modal_active: "active",
      no_scroll: true,
    });
  },

  shareModalClose: function () {
    var page = this;
    page.setData({
      share_modal_active: "",
      no_scroll: false,
    });
  },

  getGoodsQrcode: function () {
    var page = this;
    page.setData({
      goods_qrcode_active: "active",
      share_modal_active: "",
    });
    if (page.data.goods_qrcode)
      return true;
    app.request({
      url: api.default.goods_qrcode,
      data: {
        goods_id: page.data.id,
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            goods_qrcode: res.data.pic_url,
          });
        }
        if (res.code == 1) {
          page.goodsQrcodeClose();
          wx.showModal({
            title: "提示",
            content: res.msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {

              }
            }
          });
        }
      },
    });
  },

  goodsQrcodeClose: function () {
    var page = this;
    page.setData({
      goods_qrcode_active: "",
      no_scroll: false,
    });
  },

  saveGoodsQrcode: function () {
    var page = this;
    if (!wx.saveImageToPhotosAlbum) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false,
      });
      return;
    }

    wx.showLoading({
      title: "正在保存图片",
      mask: false,
    });

    wx.downloadFile({
      url: page.data.goods_qrcode,
      success: function (e) {
        wx.showLoading({
          title: "正在保存图片",
          mask: false,
        });
        wx.saveImageToPhotosAlbum({
          filePath: e.tempFilePath,
          success: function () {
            wx.showModal({
              title: '提示',
              content: '商品海报保存成功',
              showCancel: false,
            });
          },
          fail: function (e) {
            wx.showModal({
              title: '图片保存失败',
              content: e.errMsg,
              showCancel: false,
            });
          },
          complete: function (e) {
            console.log(e);
            wx.hideLoading();
          }
        });
      },
      fail: function (e) {
        wx.showModal({
          title: '图片下载失败',
          content: e.errMsg + ";" + page.data.goods_qrcode,
          showCancel: false,
        });
      },
      complete: function (e) {
        console.log(e);
        wx.hideLoading();
      }
    });

  },

  goodsQrcodeClick: function (e) {
    var src = e.currentTarget.dataset.src;
    wx.previewImage({
      urls: [src],
    });
  },
  closeCouponBox: function (e) {
    this.setData({
      get_coupon_list: ""
    });
  }

});
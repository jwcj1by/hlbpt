var util = require('./utils/utils.js');
var api = require('./api.js');
import regeneratorRuntime from 'libs/regenerator-runtime/runtime' // 支持async await

App({
  is_on_launch: true,
  launchStore() { // 每次进入将本地数据同步store
    let _globalData = this.globalData
    let user_info = wx.getStorageSync('user_info')
    let is_login = wx.getStorageSync('is_login')
    let access_token = wx.getStorageSync('access_token')
    if (user_info)
      _globalData.user_info = user_info
    if (is_login)
      _globalData.is_login = is_login
    if (access_token)
      _globalData.access_token = access_token
  },
  fetch(options) { // 请求封装
    const access_token = this.globalData.access_token
    if (access_token) {
      if (!options.data) {
        options.data = {}
      }
      options.data.access_token = access_token;
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        header: options.header || {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: options.data || {},
        method: options.method || "GET",
        dataType: options.dataType || "json",
        success(response) {
          if (response.data.code === 0) {
            resolve(response.data.data)
          } else {
            reject()
          }
        },
        fail(error) {
          reject(error)
        }
      })
    })

  },
  onLaunch() { // app 初始化
    this.launchStore()
    if (!wx.getStorageSync('access_token')) {
      this.login();
    }
    // return
    // this.getStoreData();
    // this.getCatList();
  },
  onShow: function (ops) {
    var slef = this

    if (ops && (ops.scene == 1007 || ops.scene == 1008 || ops.scene == 1011 || ops.scene == 1012 || ops.scene == 1013)) {
      slef.globalData.zeroshare = ops.query
      console.log(ops)
    } else {
      slef.globalData.zeroshare = null
    }
  },
  setGloTabBarBadge(_len) { // 设置角标
    if (_len > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: `${_len}`
      })
    } else {
      wx.removeTabBarBadge({
        index: 2
      })
    }
    this.globalData.shopping_cart_num = _len
  },
  async getShoppingCart() {
    try {
      const RES = await this.fetch({
        url: api.cart.list
      })
      const LIST = RES.list
      wx.setStorageSync('cart_list', LIST)
      this.setGloTabBarBadge(LIST.length)
    } catch (error) {
      console.error(error)
    }
  },
  getStoreData: function () {
    var page = this;
    this.request({
      url: api.default.store,
      data: {
        store_id: 1
      },
      success: function (res) {
        if (res.code == 0) {
          wx.setStorageSync("store", res.data.store);
          wx.setStorageSync("store_name", res.data.store_name);
          wx.setStorageSync("show_customer_service", res.data.show_customer_service);
          wx.setStorageSync("contact_tel", res.data.contact_tel);
          wx.setStorageSync("share_setting", res.data.share_setting);
        }
      },
      complete: function () {
        page.login();
      }
    });
  },
  getCatList: function () {
    this.request({
      url: api.default.cat_list,
      data: {
        store_id: 1
      },
      success: function (res) {
        if (res.code == 0) {
          var cat_list = res.data.list || [];
          wx.setStorageSync("cat_list", cat_list);
        }
      }
    });
  },
  login (object) {
    wx.navigateTo({
      url: '/pages/authorized/authorized'
    })
    return

    var pages = getCurrentPages();
    var page = pages[(pages.length - 1)];
    wx.showLoading({
      title: "正在登录",
      mask: true,
    });
    wx.login({
      success: function (res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({
            success: function (res) {

              getApp().request({
                url: api.passport.login,
                method: "post",
                data: {
                  code: code,
                  user_info: res.rawData,
                  encrypted_data: res.encryptedData,
                  iv: res.iv,
                  signature: res.signature
                },
                success: function (res) {
                  wx.hideLoading();

                  if (res.code == 0) {
                    wx.setStorageSync("access_token", res.data.access_token);
                    wx.setStorageSync("user_info", {
                      nickname: res.data.nickname,
                      avatar_url: res.data.avatar_url,
                      is_distributor: res.data.is_distributor,
                      parent: res.data.parent,
                      id: res.data.id,
                      is_clerk: res.data.is_clerk
                    });
                    // var parent_id = wx.getStorageSync("parent_id");
                    var p = getCurrentPages();
                    var parent_id = 0;
                    if (p[0].options.user_id != undefined) {
                      var parent_id = p[0].options.user_id;
                    } else if (p[0].options.scene != undefined) {
                      var parent_id = p[0].options.scene;
                    }

                    getApp().bindParent({
                      parent_id: parent_id || 0
                    });

                    if (page == undefined) {
                      return;
                    }
                    wx.redirectTo({
                      url: "/" + page.route + "?" + util.objectToUrlParams(page.options),
                      fail: function () {
                        wx.switchTab({
                          url: "/" + page.route,
                        });
                      },
                    });
                    if (object.logins)
                      object.logins({
                        code: 1
                      })
                  } else {
                    wx.showToast({
                      title: res.msg
                    });
                  }
                }
              });
            },
            fail: function (res) {
              wx.showModal({
                content: '需要您的授权才能使用哦',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {

                    wx.openSetting({
                      success: function (ss) {
                        console.log(ss)
                      }
                    })
                  }
                }
              })
            }
          });
        } else {

        }

      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  request(object) {
    var access_token = wx.getStorageSync("access_token");
    if (access_token) {
      if (!object.data)
        object.data = {};
      object.data.access_token = access_token;
    }
    wx.request({
      url: object.url,
      header: object.header || {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: object.data || {},
      method: object.method || "GET",
      dataType: object.dataType || "json",
      success: function (res) {
        if (res.data.code == -1) {
          getApp().login(object);
        } else {
          if (object.success)
            object.success(res.data);
        }
      },
      fail: function (res) {
        var app = getApp();
        if (app.is_on_launch) {
          app.is_on_launch = false;
          wx.showModal({
            title: "网络请求出错",
            content: res.errMsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                if (object.fail)
                  object.fail(res);
              }
            }
          });
        } else {
          wx.showToast({
            title: res.errMsg,
            image: "/image/icon-warning.png",
          });
          if (object.fail)
            object.fail(res);
        }
      },
      complete: function (res) {
        if (object.complete)
          object.complete(res);
      }
    });
  },
  saveFormId: function (form_id) {
    this.request({
      url: api.user.save_form_id,
      data: {
        form_id: form_id,
      }
    });
  },

  loginBindParent: function (object) {
    var access_token = wx.getStorageSync("access_token");
    if (access_token == '') {
      return true;
    }
    getApp().bindParent(object);
  },
  bindParent: function (object) {
    if (object.parent_id == "undefined" || object.parent_id == 0)
      return;

    var user_info = wx.getStorageSync("user_info");
    var share_setting = wx.getStorageSync("share_setting");
    if (share_setting.level > 0) {
      var parent_id = object.parent_id;
      if (parent_id != 0) {
        getApp().request({
          url: api.share.bind_parent,
          data: {
            parent_id: object.parent_id
          },
          success: function (res) {
            if (res.code == 0) {
              user_info.parent = res.data
              wx.setStorageSync('user_info', user_info);
            }
          }
        });
      }
    }
  },
  editTabBar: function () {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.globalData.tabBar;
    for (var i = 0; i < tabBar.list.length; i++) {
      tabBar.list[i].active = false;
      if (tabBar.list[i].pagePath == _pagePath) {
        tabBar.list[i].active = true; //根据页面地址设置当前页面状态  
      }
    }
    _curPage.setData({
      tabBar: tabBar
    })
  },
  globalData: {
    is_login: false,
    access_token: '',
    userInfo: null,
    zeroshare: null,
    shopping_cart_num: 0
  }
})
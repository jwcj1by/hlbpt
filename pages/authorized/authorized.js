// pages/authorized/authorized.js
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
const api = require("../../api.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var e = this;
    wx.login({
      success: function (a) {
        if (a.code) {
          e.setData({
            code: a.code
          })
        }
      }
    })
  },
  async userInfoHandler(e) { // 点击授权后的回调
    wx.showLoading()
    if (e.detail.userInfo) {
      try {
        const RES = await app.fetch({
          url: api.passport.login,
          method: 'POST',
          data: {
            code: this.data.code,
            user_info: e.detail.rawData,
            encrypted_data: e.detail.encryptedData,
            iv: e.detail.iv,
            signature: e.detail.signature
          }
        })

        wx.setStorageSync("access_token", RES.access_token)
        wx.setStorageSync("user_info", {
          nickname: RES.nickname,
          avatar_url: RES.avatar_url,
          is_distributor: RES.is_distributor,
          parent: RES.parent,
          id: RES.id,
          is_clerk: RES.is_clerk
        })
        app.globalData.access_token = RES.access_token
        app.getShoppingCart()
        wx.navigateBack() //返回上一页
      } catch (error) {
        wx.showModal({
          title: '用户信息授权失败',
          showCancel: false,
          success() {
            wx.navigateBack() //返回上一页
          }
        })
      }
    }
  }
})
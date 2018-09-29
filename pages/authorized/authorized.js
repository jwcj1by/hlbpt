// pages/authorized/authorized.js
var t = require("../../api.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     var e = this;
      wx.login({
        success: function (a) {
          if (a.code) {         
            console.log(a.code);
            e.setData({
              code : a.code
            })
          }
        }
      })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  userInfoHandler: function (e) {
        if (e.detail.userInfo) {
            console.log(e.detail);
            console.log(e.detail.userInfo.avatarUrl)
            
            getApp().request({
              url: t.passport.login,
              method: "post",
              data: {
                code: this.data.code,
                user_info: e.detail.rawData,
                encrypted_data: e.detail.encryptedData,
                iv: e.detail.iv,
                signature: e.detail.signature
              },
              success: function (t) {

                if (wx.hideLoading(), 0 == t.code) {
                  wx.setStorageSync("access_token", t.data.access_token), wx.setStorageSync("user_info", {
                    nickname: t.data.nickname,
                    avatar_url: t.data.avatar_url,
                    is_distributor: t.data.is_distributor,
                    parent: t.data.parent,
                    id: t.data.id,
                    is_clerk: t.data.is_clerk
                  });
                  
                  
                } else wx.showToast({
                  title: t.msg
                })


              }
            })

            wx.navigateBack()   //返回上一页
        } else {
            wx.showModal({
                title: '用户信息授权失败',
                showCancel: false,
                success(){
                    wx.navigateBack()   //返回上一页
                }
            })
        }
    }
})
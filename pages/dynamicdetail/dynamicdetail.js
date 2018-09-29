var api = require('../../api.js');
var utils = require('../../utils/utils.js');
const app = getApp()
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    inputValue: '',
    onShows: false,
    id: ''
  },
  onShowd: function () {

    this.setData({
      onShows: !this.data.onShows
    })
  },
  onToAssociation: function () {
    wx.navigateTo({
      url: '/pages/association/association'
    })
  },
  onLoad: function (e) {
    var page = this;
    page.setData({
      id: e.id
    })

    app.request({
      url: api.ass.article_detail,
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.code == 0) {
          let d = res.data
          // d.addtime = utils.formatTime(d.addtime)
          wx.setNavigationBarTitle({
            title: res.data.title
          })
          page.setData(d);
          WxParse.wxParse("content", "html", d.content, page, 30);
          console.log(page)
        }
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });

    // page.onComments(e)

    // page.zanlist(e)

  },
  onComments: function (e) {
    var page = this;
    app.request({
      url: api.ass.comments,
      data: {
        article_id: page.data.id
      },
      success: function (res) {
        if (res.code == 0) {
          let d = res
          d.data.forEach(v => {
            v.addtime = utils.formatTime(v.addtime)
          })

          page.setData(d);
          // WxParse.wxParse("content", "html", res.data.about.content, page);
        }
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });
  },
  zanlist: function (e) {
    var page = this;
    app.request({
      url: api.ass.zans,
      data: {
        article_id: page.data.id
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData(res.data);

        }
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  onSay: function () {
    let self = this
    if (self.data.inputValue == '') {
      wx.showToast({
        title: '评论不能为空',
      })
      return
    }
    app.request({
      url: api.ass.send_comments,
      method: 'post',
      data: {
        article_id: self.data.id,
        content: self.data.inputValue
      },
      success: function (res) {
        wx.showToast({
          title: '已发表',
          icon: 'success'
        })
        self.onComments(self.data.id)
        self.setData({
          onShows: false
        })
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    });
  },
  onZan: function () {
    let page = this
    app.request({
      url: api.ass.give_zan,
      method: 'post',
      data: {
        article_id: page.data.id
      },
      success: function (res) {
        page.zanlist(page.data.id)
      }
    });
  }
})

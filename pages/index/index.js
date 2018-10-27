//index.js
import api from '../../api.js'
import utils from '../../utils/utils.js'
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
import {
  STORE_ID_SET
} from '../../utils/status'

const app = getApp()

Page({
  data: {
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    nav_category: [],
    goods_list: [],
    banner_adv: [],
    active_nav: 0,
    current_page: 1,
    goodListScrollTop: 0,
    isReachLastPage: false, // 是否到达最后一页
    isOnPullDownRefreshing: false, // 是否正在下拉刷新
    isLoading: false, // 当前是否在加载
    active_cat_id: 0,
    nav_icon_list: []
  },
  async onLoad() {
    // 转发分享
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  async onShow() {
    app.getShoppingCart()
    await this.getNavBar()
    await this.getBanner()
    await this.getBaseMsg()

    const _current_catgory_id = wx.getStorageSync('current_catgory_id')
    if (_current_catgory_id) {
      wx.removeStorageSync('current_catgory_id')

      if (_current_catgory_id === this.data.active_nav) {
        return
      }
      let _activeCatId = this.data.nav_category[_current_catgory_id].id
      this.setData({
        active_nav: _current_catgory_id,
        active_cat_id: _activeCatId,
        goods_list: [],
        isReachLastPage: false
      })
      await this.getGoodList(_activeCatId)
    } else {
      await this.getGoodList(this.data.active_cat_id)
    }
  },
  async onPullDownRefresh() { // 下拉刷新
    this.setData({
      isOnPullDownRefreshing: true,
      isReachLastPage: false,
      current_page: 1
    })
    await this.getGoodList()
    this.setData({
      isOnPullDownRefreshing: false
    })
    wx.stopPullDownRefresh()
    this.setPageScrollTop()
  },
  async onReachBottom() { // 上拉触底
    this.lodingShow()
    let active_nav = this.data.active_nav
    let current_page = this.data.current_page

    if (!this.data.isReachLastPage) { // 当前不是最后一页
      this.setData({
        current_page: current_page + 1
      })
      await this.getGoodList(active_nav, current_page + 1)
    }
    this.lodingHide()
  },
  /**
   * 自定义函数
   */
  async getNavBar() {
    try {
      let res_top_category = await app.fetch({
        url: api.default.cat_list,
        data: {
          store_id: STORE_ID_SET.FIRST
        }
      })

      let _recommend = {
        big_pic_url: "",
        id: "0",
        list: [],
        name: "推荐",
        parent_id: "0",
        pic_url: "http://honglaba.me/uploads/image/78/78d36d3228851d25ed5cadb58b0a700e.jpg",
        store_id: "0"
      }

      let nav_category = res_top_category.list
      nav_category.unshift(_recommend)

      this.setData({
        nav_category,
        active_cat_id: nav_category[this.data.active_nav].id
      })

    } catch (error) {}
  },
  async getBanner() {
    try {
      let req_data_banner = {
        url: api.default.ad,
        data: {
          slug: 'index'
        }
      }
      let res_banner_adv = await app.fetch(req_data_banner)

      let banner_adv = res_banner_adv.list

      this.setData({
        banner_adv
      })
    } catch (error) {}
  },
  async getBaseMsg() {
    try {
      const RES = await app.fetch({
        url: api.default.index
      })
      const nav_icon_list = RES.nav_icon_list
      this.setData({
        nav_icon_list
      })
      console.log(RES.nav_icon_list)
    } catch (error) {
      console.error(error)
    }
  },
  async getGoodList(cat_id = this.data.active_cat_id, page = 1, limit = 8) { // 获取商品列表
    if (this.data.isReachLastPage) { // 如果当前为最后一页则不执行
      return
    }
    const _currList = this.data.goods_list
    try {
      let req_data_good_list = {
        url: api.default.goods_list,
        data: {
          page,
          limit,
          sort: 1
        }
      }

      if (cat_id == 0) { // 推荐属性
        req_data_good_list.data.tag = 3
      } else {
        req_data_good_list.data.cat_id = cat_id
      }

      let res_good_list = await app.fetch(req_data_good_list)

      // 商品列表数据
      let goods_list = res_good_list.list

      goods_list.forEach(element => {
        let services = element.service.split(',')
        element.services = services
      })

      if (!this.data.isOnPullDownRefreshing) { // 当前不是在下拉刷新
        goods_list = _currList.concat(goods_list)
      }

      this.setData({
        goods_list
      })

      //  如果当前为最后一页
      console.log(this.data.current_page, 'this.data.current_page')
      console.log(res_good_list.page_count, 'res_good_list.page_count')
      if (this.data.current_page >= res_good_list.page_count) {
        this.setData({
          isReachLastPage: true
        })
      }

    } catch (error) {}
  },
  async onNavClick(e) { // tab栏点击
    wx.showLoading({
      title: '卖力加载中...'
    })
    let _navCategory = this.data.nav_category
    let _currId = e.currentTarget.dataset.id
    this.setPageScrollTop()
    wx.showNavigationBarLoading()
    this.setData({
      active_nav: _currId,
      isReachLastPage: false,
      current_page: 1,
      isOnReachBottom: false,
      goods_list: [],
      active_cat_id: _navCategory[_currId].id
    })
    await this.getGoodList(_navCategory[_currId].id)
    wx.hideLoading({
      title: '卖力加载中...'
    })
    setTimeout(() => {
      wx.hideNavigationBarLoading()
    }, 500)
  },
  lodingShow() { // 显示加载
    this.setData({
      isLoading: true
    })
  },
  lodingHide() { // 隐藏加载
    this.setData({
      isLoading: false
    })
  },
  setPageScrollTop() { // 页面重回顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  navigatorClick (e) {
    let _index = e.currentTarget.dataset.index
    if (_index === 2) {
      wx.navigateTo({
        url: `../pingtuan/pingtuan`
      })
    }
    return
    var page = this;
    var open_type = e.currentTarget.dataset.open_type;
    var url = e.currentTarget.dataset.url;
    if (open_type != 'wxapp')
      return true;
    url = parseQueryString(url);
    url.path = url.path ? decodeURIComponent(url.path) : ""
    wx.navigateToMiniProgram({
      appId: url.appId,
      path: url.path,
      complete: function (e) {
        console.log(e);
      }
    });
    return false;

    function parseQueryString(url) {
      var reg_url = /^[^\?]+\?([\w\W]+)$/,
        reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
        arr_url = reg_url.exec(url),
        ret = {};
      if (arr_url && arr_url[1]) {
        var str_para = arr_url[1],
          result;
        while ((result = reg_para.exec(str_para)) != null) {
          ret[result[1]] = result[2];
        }
      }
      return ret;
    }
  },
  async onGoodClick(e) { // 跳转至商品详情
    let goods_id = e.detail.dataset.msg.id
    wx.navigateTo({
      url: `../standard-good-detail/standard-good-detail?id=${goods_id}`
    })
  }
})
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
    isOnReachBottom: false, // 是否正在下拉刷新
    isLoading: false // 当前是否在加载
  },
  async onLoad() {
    await this.getNavBar()
    await this.getBanner()
    await this.getGoodList(this.data.active_nav)
  },
  async onPullDownRefresh() { // 下拉刷新
    this.setData({
      isOnPullDownRefresh: true,
      isReachLastPage: false,
      current_page: 1
    })
    await this.onLoad()
    this.setData({
      isOnPullDownRefresh: false
    })
    wx.stopPullDownRefresh()
    this.setPageScrollTop()
  },
  async onReachBottom() { // 上拉触底
    let active_nav = this.data.active_nav
    let current_page = this.data.current_page

    if (!this.data.isReachLastPage) { // 当前不是最后一页
      this.setData({
        current_page: current_page + 1,
        isOnReachBottom: true
      })
      await this.getGoodList(active_nav, current_page + 1)
      this.setData({
        isOnReachBottom: false
      })
    }
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

      let nav_category = res_top_category.list

      this.setData({
        nav_category
      })

    } catch (error) {
      console.error(error)
    }

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
  async getGoodList(cat_id, page = 1, limit = 4) { // 获取商品列表
    try {
      this.lodingShow()
      let req_data_good_list = {
        url: api.default.goods_list,
        data: {
          page,
          limit
        }
      }

      if (cat_id == 0) { // 推荐属性
        req_data_good_list.data.tag = 3
      } else {
        req_data_good_list.data.cart_id = cat_id
      }

      let res_good_list = await app.fetch(req_data_good_list)

      // 商品列表数据
      let goods_list = res_good_list.list

      goods_list.forEach(element => {
        let services = element.service.split(',')
        element.services = services
      })

      if (this.data.isOnReachBottom) { // 当前为上拉加载
        goods_list = this.data.goods_list.concat(goods_list)
      }

      this.setData({
        goods_list
      })

      //  如果当前为最后一页
      if (this.data.current_page >= res_good_list.page_count) {
        this.setData({
          isReachLastPage: true
        })
      }
      this.lodingHide()
    } catch (error) {}
  },
  async onNavClick(e) { // tab栏点击
    this.setPageScrollTop()
    wx.showNavigationBarLoading()
    let curr_id = e.currentTarget.dataset.id
    this.setData({
      active_nav: curr_id,
      isReachLastPage: false,
      current_page: 1
    })
    await this.getGoodList(curr_id)
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
  async onGoodClick(e) { // 跳转至商品详情
    console.log(e)
    let goods_id = e.currentTarget.dataset.msg.id
    // let detail = await app.fetch({
    //   url: api.default.goods,
    //   data: {
    //     id: goods_id
    //   }
    // })

    wx.navigateTo({
      url: `../standard-good-detail/standard-good-detail?id=${goods_id}`
    })
  }
})
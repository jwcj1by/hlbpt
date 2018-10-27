// pages/category/category.js
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
import api from '../../api.js'
import {
  STORE_ID_SET
} from '../../utils/status'
const app = getApp()
Page({
  data: {
    nav_category: [],
    goods_list: [],
    isOnReachBottom: false,
    current_page: 1,
    isReachLastPage: false,
    isLoading: false,
    category_list_show: true,
    key_word: ''
  },
  async onShow() {
    this.setData({
      nav_category: [],
      goods_list: [],
      isOnReachBottom: false,
      current_page: 1,
      isReachLastPage: false,
      isLoading: false,
      category_list_show: true,
      key_word: ''
    })
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

    } catch (error) {}
  },
  async getList(event) {
    const _currIndex = event.currentTarget.dataset.id
    wx.setStorageSync('current_catgory_id', _currIndex + 1)

    wx.switchTab({
      url: `/pages/index/index`
    })
  },
  async runSearch(event) {
    const _insertCode = event.detail.value.replace(/(^\s*)|(\s*$)/g, '')

    if (!_insertCode) {
      this.setData({
        nav_category: [],
        goods_list: [],
        isOnReachBottom: false,
        current_page: 1,
        isReachLastPage: false,
        isLoading: false,
        category_list_show: true,
        key_word: ''
      })
      this.onShow()
      return
    }

    this.setData({
      category_list_show: false,
      key_word: _insertCode
    })

    this.getGoodList({
      keyword: _insertCode
    })
  },
  async getGoodList({
    keyword
  }, page = 1, limit = 4) { // 获取商品列表
    // if (!keyword.replace(/(^\s*)|(\s*$)/g, '')) {
    //   return
    // }
    try {
      this.lodingShow()
      let req_data_good_list = {
        url: api.default.goods_list,
        data: {
          page,
          limit
        }
      }

      req_data_good_list.data.keyword = keyword

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
  searchOnfocus(event) {
    // this.setData({
    //   category_list_show: false
    // })
  },
  async onGoodClick(e) { // 跳转至商品详情
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
  },
  async onReachBottom() { // 上拉触底
    let active_nav = this.data.active_nav
    let current_page = this.data.current_page

    if (!this.data.isReachLastPage) { // 当前不是最后一页
      this.setData({
        current_page: current_page + 1,
        isOnReachBottom: true
      })
      await this.getGoodList({
        keyword: this.data.key_word
      }, current_page + 1)

      this.setData({
        isOnReachBottom: false
      })
    }
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
  }
})
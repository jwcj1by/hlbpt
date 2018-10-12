// category-detail-list/category-detail-list.js
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
import api from '../../api.js'
import {
  STORE_ID_SET
} from '../../utils/status'
const app = getApp()

Page({
  data: {
    goods_list: [],
    isOnReachBottom: false,
    current_page: 1,
    isReachLastPage: false,
    isLoading: false
  },
  onLoad(config) {
    const _cart_id = config.cart_id
    if (_cart_id) {
      this.getGoodList({
        _cart_id
      })
    }
  },
  async getGoodList({
    cat_id,
    keyword
  }, page = 1, limit = 4) { // 获取商品列表
    try {
      this.lodingShow()
      let req_data_good_list = {
        url: api.default.goods_list,
        data: {
          page,
          limit
        }
      }

      if (cart_id) {
        req_data_good_list.data.cart_id = cat_id
      } else if (keyword) {
        req_data_good_list.data.keyword = keyword
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
})
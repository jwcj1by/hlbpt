import api from '../../api.js'
import utils from '../../utils/utils.js'
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await

const app = getApp()

Page({
  data: {
    cart_list: [],
    total_price: 0
  },
  async onLoad() {
    try {
      const _RES = await app.fetch({
        url: api.cart.list
      })
      const LIST = _RES.list
      this.unitPriceFactory(LIST)
      this.totalPriceFactory(LIST)
    } catch (error) {}
  },
  unitPriceFactory(unitList) { // 单价设置
    let _unitList = unitList
    _unitList.forEach((element) => {
      element.unit_price = element.price / element.num
    })
    this.setData({
      cart_list: _unitList
    })
  },
  totalPriceFactory() { // 总价设置
    let _unitList = this.data.cart_list
    let _totalPrice = 0
    _unitList.forEach((element) => {
      let _unitPrice = element.unit_price
      let _unitNum = element.num
      _totalPrice += _unitPrice * _unitNum
    })
    this.setData({
      total_price: _totalPrice
    })
  },
  async _syncNum(id, val) { // 后台同步数量
    let num = val
    let cart_id = id
    try {
      await app.fetch({
        url: api.cart.change_cart,
        method: 'POST',
        data: {
          cart_id,
          num
        }
      })
    } catch (error) {}
  },
  async numberAdd(e) { // 增加数量
    let _cartList = this.data.cart_list
    let _unitId = e.currentTarget.dataset.id
    let _unitItem = _cartList[_unitId]

    if (_unitItem.num <= _unitItem.max_num) {
      _unitItem.num++

      await this._syncNum(_unitItem.cart_id, _unitItem.num)

      this.setData({
        cart_list: _cartList
      })
      this.totalPriceFactory()
    }
  },
  async numberSub(e) { // 减少数量
    let _cartList = this.data.cart_list
    let _unitId = e.currentTarget.dataset.id
    let _unitItem = _cartList[_unitId]

    if (_unitItem.num > 1) {
      _unitItem.num--

      await this._syncNum(_unitItem.cart_id, _unitItem.num)

      this.setData({
        cart_list: _cartList
      })
      this.totalPriceFactory()
    }
  },
  async numberBlur(e) { // 输入数量
    let _cartList = this.data.cart_list
    let _unitId = e.currentTarget.dataset.id
    let _value = e.detail.value
    let _unitItem = _cartList[_unitId]

    if (_value < 1) {
      _unitItem.num = 1
    } else if (_value > _unitItem.max_num) {
      _unitItem.num = _unitItem.max_num
    } else {
      _unitItem.num = _value
    }

    await this._syncNum(_unitItem.cart_id, _unitItem.num)

    this.setData({
      cart_list: _cartList
    })

    this.totalPriceFactory()
  },
  settleAccounts() { // 去结算
    // wx.showLoading({
    //   title: "正在提交",
    //   mask: true,
    // })
    let data = {
        
    }
    app.fetch({
      url: api.order.submit,
      method: 'POST',
      data
    })
    wx.navigateTo({url: '/pages/shopping-cart-submit/shopping-cart-submit'})
  }
})
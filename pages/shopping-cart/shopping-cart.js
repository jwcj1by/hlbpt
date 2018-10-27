import api from '../../api.js'
import utils from '../../utils/utils.js'
import {
  add,
  sub,
  mul,
  div
} from '../../utils/utils'
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await

const app = getApp()

Page({
  data: {
    editing: false,
    cart_list: [],
    cart_id_list: [],
    total_price: 0,
    isSelectedAll: false,
    isPageOnload: true
  },
  async onShow() {
    this.setData({
      editing: false,
      cart_list: [],
      cart_id_list: [],
      total_price: 0,
      isSelectedAll: false,
      isPageOnload: true
    })
    try {
      const _RES = await app.fetch({
        url: api.cart.list
      })
      const LIST = _RES.list
      wx.setStorageSync('cart_list', LIST)
      app.setGloTabBarBadge(LIST.length) // 设置角标
      await this.unitPriceFactory(LIST)
      await this.totalPriceFactory(LIST)
      await this.selectedFactory()
      this.setData({
        isPageOnload: false
      })
    } catch (error) {}
  },
  onHide() {
    this.setData({
      editing: false,
      cart_list: [],
      cart_id_list: [],
      total_price: 0,
      isSelectedAll: false,
      isPageOnload: true
    })
  },
  // 编辑购物车
  editCart() {
    this.setData({
      editing: !this.data.editing
    })
  },
  // 选择商品
  selectEle(event) {
    let _index = event.currentTarget.dataset.id
    let _cart_list = this.data.cart_list
    let _isAllSelected = true // 默认为全选
    _cart_list[_index].isChecked = !_cart_list[_index].isChecked
    _cart_list.forEach(element => {
      if (!element.isChecked) {
        _isAllSelected = false
      }
    })
    this.setData({
      cart_list: _cart_list,
      isSelectedAll: _isAllSelected
    })
    this.totalPriceFactory()
    this.setCartIdList()
  },
  // 判断当前是否为全选
  judgeMomentIsSelectAll() {
    let _cart_list = this.data.cart_list
    let _is_all_selected = true
    if (_cart_list.length == 0) {
      _is_all_selected = false
    } else {
      _cart_list.forEach(element => {
        if (!element.isChecked) {
          _is_all_selected = false
        }
      })
    }

    this.setData({
      isSelectedAll: _is_all_selected
    })
  },
  // 添加数量
  async addEleNum(event) {
    let _index = event.target.dataset.index

    let _cartList = this.data.cart_list
    let _unitId = event.currentTarget.dataset.id
    let _unitItem = _cartList[_unitId]

    if (_unitItem.num <= _unitItem.max_num) {
      _unitItem.num++

      await this._syncNum(_unitId, _unitItem.num)

      this.setData({
        cart_list: _cartList
      })
      this.totalPriceFactory()
    }
  },
  // 减少数量
  async reduceEleNum(event) {
    let _unitId = event.currentTarget.dataset.id
    let _cartList = this.data.cart_list
    let _unitItem = _cartList[_unitId]
    let _nNum = _unitItem.num

    if (_nNum >= 1) {
      _nNum--
      if (_nNum === 0) { // 自动删除商品
        try {
          const RES = await app.fetch({
            url: api.cart.delete,
            data: {
              cart_id_list: [_unitItem.cart_id]
            }
          })
          let aData = this.data.cart_list
          aData.splice(_unitId, 1)
          app.setGloTabBarBadge(aData.length) // 设置角标
          this.setData({
            cart_list: aData
          })

          wx.showToast({
            title: '删除成功'
          })

        } catch (error) {}
      } else {
        await this._syncNum(_unitId, _nNum)
      }
      this.totalPriceFactory()
    }
  },
  // 设置被选择商品列表
  setCartIdList() {
    let _cart_list = this.data.cart_list
    let _cart_id_list = []
    _cart_list.forEach(element => {
      if (element.isChecked) {
        _cart_id_list.push(element.cart_id)
      }
    })
    this.setData({
      cart_id_list: _cart_id_list
    })
  },
  // 为每个商品加上选择属性
  selectedFactory() {
    let _cart_list = this.data.cart_list
    _cart_list.forEach(element => {
      element.isChecked = false
    })
    this.setData({
      cart_list: _cart_list
    })
  },
  toggleSelectAll() { // 全选按钮
    let _cart_list = this.data.cart_list
    let _boolSeleted = this.data.isSelectedAll

    _cart_list.forEach(element => {
      element.isChecked = !_boolSeleted
    })

    this.setData({
      isSelectedAll: !_boolSeleted,
      cart_list: _cart_list
    })

    this.totalPriceFactory()
    this.setCartIdList()
  },
  unitPriceFactory(unitList) { // 单价设置
    let _unitList = unitList
    _unitList.forEach((element) => {

      element.unit_price = div(element.price, element.num)
    })
    this.setData({
      cart_list: _unitList
    })
  },
  totalPriceFactory(unitList = this.data.cart_list) { // 总价设置
    let _unitList = unitList
    let _totalPrice = 0
    _unitList.forEach((element) => {
      if (element.isChecked) {
        let _unitPrice = element.unit_price
        let _unitNum = element.num
        _totalPrice = add(_totalPrice, mul(_unitPrice, _unitNum))
      }
    })
    this.setData({
      total_price: _totalPrice
    })
  },
  async _syncNum(id, val) { // 后台同步数量
    let _id = id
    let _nNum = val
    let _cartList = this.data.cart_list
    try {
      const RES = await app.fetch({
        url: api.cart.change_cart,
        method: 'POST',
        data: {
          cart_id: _cartList[_id].cart_id,
          num: _nNum
        }
      })
      _cartList[id].num = _nNum
      this.setData({
        cart_list: _cartList
      })
    } catch (error) {}
  },
  async numberAdd(e) { // 增加数量
    let _cartList = this.data.cart_list
    let _unitId = e.currentTarget.dataset.id
    let _unitItem = _cartList[_unitId]

    if (_unitItem.num <= _unitItem.max_num) {
      _unitItem.num++

      await this._syncNum(_unitId, _unitItem.num)

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

      await this._syncNum(_unitId, _unitItem.num)

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

    await this._syncNum(_unitId, _unitItem.num)

    this.setData({
      cart_list: _cartList
    })

    this.totalPriceFactory()
  },
  // 编辑完成
  editComplate() {

  },
  // 编辑-删除
  async editDel() {
    // wx.showModal({
    //   title: '提示',
    //   content: '是否确认删除'
    // })
    let _cart_id_list = this.data.cart_id_list
    let _cart_list = this.data.cart_list
    _cart_list = _cart_list.filter((element, index) => {
      // 如果不是选中, 则添加到新队列
      if (!_cart_id_list.includes(element.cart_id)) {
        return true
      }
    })
    //
    try {
      const RES = await app.fetch({
        url: api.cart.delete,
        data: {
          cart_id_list: _cart_id_list
        }
      })

      wx.showToast({
        title: '删除成功!'
      })
    } catch (error) {}
    app.getShoppingCart()
    this.toggleSelectAll()
    this.setData({
      cart_list: _cart_list
    })

    this.setCartIdList()
    this.judgeMomentIsSelectAll()
  },
  settleAccounts() { // 去结算
    if (this.data.cart_id_list.length > 0) {
      wx.navigateTo({
        url: `/pages/shopping-cart-submit/shopping-cart-submit?cart_id_list=${JSON.stringify(this.data.cart_id_list)}`
      })
    } else {
      wx.showToast({
        title: '您还没有选择商品哦',
        icon: 'none'
      })
    }


  }
})
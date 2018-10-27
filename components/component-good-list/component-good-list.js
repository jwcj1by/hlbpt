// components/component-good-list/component-good-list.js
import api from '../../api.js'
import utils from '../../utils/utils.js'
import regeneratorRuntime from '../../libs/regenerator-runtime/runtime' // 支持async await
import {
  STORE_ID_SET
} from '../../utils/status'

const app = getApp()

Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    goodsList: {
      type: Array,
      value: [],
    }
  },
  methods: {
    onGoodClick(e) {
      this.triggerEvent('goodclick', e.currentTarget)
    }
  }
})
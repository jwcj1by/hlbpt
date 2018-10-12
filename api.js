// var _api_root = 'https://fireco.cppwork.com/api/';
// var _api_root = 'https://pt.lapp.honglaba.com/api/'
// var _api_root = 'http://honglaba.me/api/'
var _api_root = 'https://gxj.zhijiexiao.com/api/'
// 0元购首页：domain + /api/promotions/home
// 爱拼团首页：domain + /api/group-buy/home
// 帮助中心：domain + /api/default/article-detail?id=2
// 客服咨询：domain + /api/default/article-detail?id=1
// 分享二维码接口：domain + /api/wx-applet/qrcode   scene    page
// 我的0元购：domain + /api/promotions/list
// 助力接口：domain + /api/promotions/help   order_id
// 0元购领取：domain + /api/promotions/receive   order_id
// 我的拼团：domain + /api/group-buy/list
// order/praise
var api = {
  index: _api_root + 'promotions/home',
  indexTan: _api_root + 'group-buy/home',
  ass: {
    index: _api_root + 'main/index',
    bus_card: _api_root + 'main/bus-card',
    members: _api_root + 'main/members',
    apply: _api_root + 'main/apply-desc',
    comments: _api_root + 'main/comments',
    send_comments: _api_root + 'auth-main/send-comments',
    association_banner: _api_root + 'main/association-banner',
    association_news: _api_root + 'main/association-news',
    association_cons: _api_root + 'main/association-cons',
    support: _api_root + 'main/support',
    article_detail: _api_root + 'default/article-detail',
    zans: _api_root + 'main/zans',
    give_zan: _api_root + 'auth-main/give-zan',
    service_center: _api_root + 'main/service-center'
  },
  default: {
    store: _api_root + 'default/store',
    index: _api_root + 'default/index',
    ad: _api_root + 'default/ad',
    goods_list: _api_root + 'default/goods-list',
    cat_list: _api_root + 'default/cat-list',
    goods: _api_root + 'default/goods',
    district: _api_root + 'default/district',
    goods_attr_info: _api_root + "default/goods-attr-info",
    upload_image: _api_root + "default/upload-image",
    comment_list: _api_root + "default/comment-list",
    article_list: _api_root + "default/article-list",
    article_detail: _api_root + "default/article-detail",
    video_list: _api_root + "default/video-list",
    goods_qrcode: _api_root + "default/goods-qrcode",
    coupon_list: _api_root + "default/coupon-list",
    topic_list: _api_root + "default/topic-list",
    topic: _api_root + "default/topic",
  },
  cart: {
    list: _api_root + 'cart/list',
    add_cart: _api_root + 'cart/add-cart',
    delete: _api_root + 'cart/delete',
    change_cart: _api_root + 'cart/change-cart'
  },
  passport: {
    login: _api_root + 'passport/login',
    on_login: _api_root + 'passport/on-login',
  },
  order: {
    order_praise: _api_root + 'order/praise',
    submit_preview: _api_root + 'order/submit-preview',
    submit: _api_root + 'order/submit',
    pay_data: _api_root + 'order/pay-data',
    list: _api_root + 'order/list',
    revoke: _api_root + 'order/revoke',
    confirm: _api_root + 'order/confirm',
    count_data: _api_root + 'order/count-data',
    detail: _api_root + 'order/detail',
    refund_preview: _api_root + 'order/refund-preview',
    refund: _api_root + 'order/refund',
    refund_detail: _api_root + 'order/refund-detail',
    comment_preview: _api_root + 'order/comment-preview',
    comment: _api_root + 'order/comment',
    express_detail: _api_root + 'order/express-detail',
    clerk: _api_root + "order/clerk",
    clerk_detail: _api_root + 'order/clerk-detail',
    get_qrcode: _api_root + 'order/get-qrcode',
  },
  user: {
    promotionslist: _api_root + 'promotions/list',
    groupbuylist: _api_root + 'group-buy/list',
    address_list: _api_root + 'user/address-list',
    address_detail: _api_root + 'user/address-detail',
    address_save: _api_root + 'user/address-save',
    address_set_default: _api_root + 'user/address-set-default',
    address_delete: _api_root + 'user/address-delete',
    save_form_id: _api_root + "user/save-form-id",
    favorite_add: _api_root + "user/favorite-add",
    favorite_remove: _api_root + "user/favorite-remove",
    favorite_list: _api_root + "user/favorite-list",
    index: _api_root + "user/index",
    wechat_district: _api_root + "user/wechat-district",
    add_wechat_address: _api_root + "user/add-wechat-address",
    topic_favorite: _api_root + "user/topic-favorite",
    topic_favorite_list: _api_root + "user/topic-favorite-list",
    member: _api_root + "user/member"
  },
  share: {
    wxqrcode: _api_root + 'wx-applet/qrcode',
    promotionsreceive: _api_root + 'promotions/receive',
    promotionshelp: _api_root + 'promotions/help',
    join: _api_root + 'share/join',
    check: _api_root + 'share/check',
    get_info: _api_root + 'share/get-info',
    get_price: _api_root + 'share/get-price',
    apply: _api_root + 'share/apply',
    cash_detail: _api_root + 'share/cash-detail',
    get_qrcode: _api_root + 'share/get-qrcode',
    shop_share: _api_root + 'share/shop-share',
    bind_parent: _api_root + 'share/bind-parent',
    get_team: _api_root + 'share/get-team',
    get_order: _api_root + 'share/get-order',
  },
  coupon: {
    index: _api_root + 'coupon/index',
    share_send: _api_root + 'coupon/share-send',
    receive: _api_root + 'coupon/receive',
  },
  miaosha: {
    list: _api_root + 'miaosha/list',
    goods_list: _api_root + 'miaosha/goods-list',
  },
};
module.exports = api;
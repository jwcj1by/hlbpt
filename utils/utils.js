function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function objectToUrlParams(obj) {
  var str = "";
  for (var key in obj) {
    str += "&" + key + "=" + obj[key];
  }
  return str.substr(1);
}

function countdown(that) {
  let se = (new Date(that.data.time).getTime() - new Date().getTime()) / 1000
  // 渲染倒计时时钟
  that.setData({
    clock: dateformat(se)
  });

  if (se <= 0) {
    that.setData({
      clock: "已经截止"
    });
    // timeout则跳出递归
    return;
  }

  setTimeout(function () {
    se -= 1;
    countdown(that);
  }, 1000)
}
function dateformat(micro_second) {
  var second = Math.floor(micro_second);
  // 小时位
  var _h = Math.floor(second / 3600);
  // 分钟位
  var _m = Math.floor((second - _h * 3600) / 60);
  // 秒位
  var _s = (second - _h * 3600 - _m * 60);

  var h = _h < 10 ? ("0" + _h) : ("" + _h)
  var m = _m < 10 ? ("0" + _m) : ("" + _m)
  var s = _s < 10 ? ("0" + _s) : ("" + _s)

  return h + ":" + m + ":" + s
}

function interval(lastTime, _this, index,inser,setDates) {
  interval = setInterval(function () {
    var insertTime = inser;
    // 获取现在的时间
    var nowTime = new Date();
    var nowTime = Date.parse(nowTime);//当前时间戳
    var differ_time = lastTime - nowTime;//时间差

    if (differ_time >= 0) {
      var differ_day = Math.floor(differ_time / (3600 * 24 * 1e3));//相差天数
      if (differ_day > 0) {
        differ_day = differ_day * 24
      }
      var differ_hour = Math.floor(differ_time % (3600 * 1e3 * 24) / (1e3 * 60 * 60)) + differ_day;//相差小时

      var differ_minute = Math.floor(differ_time % (3600 * 1e3) / (1000 * 60));//相差分钟
      var s = Math.floor(differ_time % (3600 * 1e3) % (1000 * 60) / 1000);

      if (differ_hour.toString().length < 2) {
        differ_hour = "0" + differ_hour;
      }
      if (differ_minute.toString().length < 2) {
        differ_minute = "0" + differ_minute;
      }
      if (s.toString().length < 2) {
        s = "0" + s;
      }
      var str = differ_hour + ':' + differ_minute + ':' + s;
      insertTime[index] = str;
      setDates(insertTime)
    } else {
      console.log("不进行倒计时");
      insertTime[index] = "00:00:00";
      setDates(insertTime)
      clearInterval(interval);
    }
  }, 1000);

}

function deepClone(obj) /* 深度克隆 */ {
  var str, newobj = obj.constructor === Array ? [] : {}
  if (typeof obj !== 'object') {
    return
  } else if (window && window.JSON) {
    str = JSON.stringify(obj), //序列化对象
      newobj = JSON.parse(str) //还原
  } else { //如果不支持以上方法
    for (var i in obj) {
      newobj[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
    }
  }
  return newobj
}

// 浮点数处理
export function add(a, b) {
  var c, d, e
  try {
    c = a.toString().split(".")[1].length
  } catch (f) {
    c = 0
  }
  try {
    d = b.toString().split(".")[1].length
  } catch (f) {
    d = 0
  }
  return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e
}

export function sub(a, b) {
  var c, d, e
  try {
    c = a.toString().split(".")[1].length
  } catch (f) {
    c = 0
  }
  try {
    d = b.toString().split(".")[1].length
  } catch (f) {
    d = 0
  }
  return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e
}

export function mul(a, b) {
  var c = 0,
    d = a.toString(),
    e = b.toString()
  try {
    c += d.split(".")[1].length
  } catch (f) {}
  try {
    c += e.split(".")[1].length
  } catch (f) {}
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c)
}

export function div(a, b) {
  var c, d, e = 0,
    f = 0
  try {
    e = a.toString().split(".")[1].length
  } catch (g) {}
  try {
    f = b.toString().split(".")[1].length
  } catch (g) {}
  return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e))
}
// - 
module.exports = {
  add,
  sub,
  mul,
  div,
  deepClone,
  formatTime: formatTime,
  objectToUrlParams: objectToUrlParams,
  interval: interval,
  countdown: countdown
};
$(function () {
  var single = $(".single-slider");
  var width = 60;
  var scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  var tag = false;
  addSlider(single, width, scale, tag);
});

var scales;
var spanWidth;
var isClick = true;

function addSlider(single, width, scale, tag) {
  scales = scale;
  if (width > 100) return alert("滑块长度按百分比显示");
  var sliderDiv = "<div id='slider-box'>" + "<div id='slider' onclick='sliderClick(this, event)'>" + "<div class='slider-index'></div>" + "</div>" + "<div class='slider-style' onmousedown='sliderDown(this, event)'></div>" + "<span class='slider-tab'></span>" + "</div>";
  single.after(sliderDiv);
  var slider = $("#slider-box");
  slider.css("width", width + "%");
  var singleVal = 0;
  if (single.val()) singleVal = single.val();
  addSliderIndex(slider, scale, singleVal, tag);
}

function addSliderIndex(slider, scale, singleVal, tag) {
  var indexWidth = slider.width();
  var scaleLength = scale.length;
  spanWidth = (100 / (scaleLength - 1)).toFixed(2);
  $(".slider-style").css({
    "left": singleVal * spanWidth + "%",
    "margin-left": -$(".slider-style").width() / 2
  });
  var spanHtml = "";
  for (var i = 0; i < scale.length; i++) {
    spanHtml += "<span style='left:" + i * spanWidth + "%'>" + (scale[i] != '|' ? '<ins>' + scale[i] + '</ins>' : '') + "</span>";
  }
  $(".slider-index").html(spanHtml);
  $('ins', scale).each(function () {
    $(this).css({
      marginLeft: -$(this).outerWidth() / 2
    });
  });
  if (tag) {
    var sliderS = $(".slider-style").offset().left - parseFloat($(".slider-style").css("margin-left")) - $("#slider").offset().left;
    var val = Math.round(((sliderS / indexWidth) * 100).toFixed(1) / spanWidth);
    $(".slider-tab").html(scale[val] + ":00-" + scale[val + 1] + ":00");
    var tabW = $(".slider-tab").width() / 2;
    var tabLeft = ((sliderS / indexWidth) * 100).toFixed(1);
    $(".slider-tab").css({
      "left": tabLeft + "%",
      "margin-left": -tabW
    });
  } else {
    $(".slider-tab").css("display", "none");
  }
}


function sliderDown(el, ev) {
  isClick = false;
  var Ev = ev || window.event;
  var _this = $(el);
  var _thisW = parseFloat(_this.css("width")) / 2;
  var sliderX;
  var va = $(".single-slider").val() * spanWidth;

  if (document.addEventListener) {
    document.addEventListener("mousemove", moveHandler, true);
    document.addEventListener("mouseup", upHandler, true);
  } else if (document.attachEvent) {
    el.setCapture();
    el.attachEvent("onmousemove", moveHandler);
    el.attachEvent("onmouseup", upHandler);
    el.attachEvent("onlosecapture", upHandler);
  }

  if (Ev.stopPropagation) Ev.stopPropagation();
  else Ev.cancelBubble = true;

  if (Ev.preventDefault) Ev.preventDefault();
  else Ev.returnValue = false;

  function moveHandler(Ev) {
    var sliderS = _this.offset().left - parseFloat(_this.css("margin-left")) - $("#slider").offset().left;
    var sub = parseFloat(_this.css("left"));
    if (sub <= 0) {
      sliderX = Number(((sliderS / $("#slider").width()) * 100).toFixed(1));
    } else {
      var sLeft = Number(((sub / $("#slider").width()) * 100).toFixed(1));
      sliderX = sLeft;
    }
    var l = (((Ev.clientX - $("#slider").offset().left) / $("#slider").width()) * 100).toFixed(1);
    if (l < 0) {
      l = 0;
    } else if (l > 100) {
      l = 100;
    };
    var Tvular = (sliderX * 100 + (spanWidth / 2) * 100) / 100;
    var Fvular = (sliderX * 100 - (spanWidth / 2) * 100) / 100;
    var vasl = parseInt(sliderX / spanWidth);
    if (vasl === 0) vasl = 1;
    var tabW = $(".slider-tab").width() / 2;
    if (l > sliderX) {
      if (l > Tvular) {
        va = (vasl + 1) * spanWidth;
        $(".slider-tab").html(scales[vasl + 1] + ":00-" + (scales[vasl + 1] + 1) + ":00");
      }
    } else {
      if (l < Fvular) {
        va = (vasl - 1) * spanWidth;
        $(".slider-tab").html(scales[vasl - 1] + ":00-" + (scales[vasl - 1] + 1) + ":00");
      }
    }
    _this.css("margin-left", -_thisW);
    _this.css("left", va + "%");
    $(".slider-tab").css("margin-left", -tabW);
    $(".slider-tab").css("left", va + "%");
    if (Ev.stopPropagation) Ev.stopPropagation();
    else Ev.cancelBubble = true;
  };

  function upHandler(Ev) {
    var sliderS = _this.offset().left - parseFloat(_this.css("margin-left")) - $("#slider").offset().left;
    var val = Math.round((((sliderS / $("#slider").width()) * 100).toFixed(1)) / spanWidth);
    $(".single-slider").val(val);
    if (document.removeEventListener) {
      document.removeEventListener("mouseup", upHandler, true);
      document.removeEventListener("mousemove", moveHandler, true);
    } else if (document.detachEvent) {
      el.detachEvent("onlosecapture", upHandler);
      el.detachEvent("onmouseup", upHandler);
      el.detachEvent("onmousemove", moveHandler);
      el.releaseCapture();
    }

    if (Ev.stopPropagation) Ev.stopPropagation();
    else Ev.cancelBubble = true;
//    scroolRequest();
    return isClick = true;
  }
}

function sliderClick(el, ev) {
  if (!isClick) return false;
  var that = $(el);
  var Ev = ev || window.event;
  var mouseX = (((Ev.clientX - that.offset().left) / that.width()) * 100).toFixed(1);
  var val = Math.round(mouseX / spanWidth);
  var slideDis = val * spanWidth;
  $(".slider-style").animate({
    "left": slideDis + "%",
  }, 500, "easeOutBounce", function () {
    $(".single-slider").val(val);
//    scroolRequest();
  });
  $(".slider-tab").animate({
    "left": slideDis + "%",
  }, 500, "easeOutBounce", function () {
    $(".slider-tab").html(scales[val] + ":00-" + (scales[val] + 1) + ":00");
    var tabW = $(".slider-tab").width() / 2;
    $(".slider-tab").css("margin-left", -tabW);
  })
}


jQuery.extend(jQuery.easing, {
  easeOutExpo: function (x, t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  },
});
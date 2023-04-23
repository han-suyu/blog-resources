
  var draw = function (img) {
    img.onload = function (e) {
      var canvas = document.getElementById("canvas");
      var context = canvas.getContext("2d");
      context.shadowBlur = 20;
      context.shadowColor = "#000000";
      var h = (900 * img.height) / img.width
      img.width = 900
      img.height = h
      canvas.width = 900;
      canvas.height = h;
      context.drawImage(img, 0, 0, img.width, img.height);
      canvas = $("#canvas");
      $(".zhanshi").show();
      $(".info_detail").show();
      $(".picker_view").show();
      canvas.click(function (e) {
        var canvasOffset = canvas.offset();
        var canvasX = Math.floor(e.pageX - canvasOffset.left);
        var canvasY = Math.floor(e.pageY - canvasOffset.top);
        var colorData = document.getElementById("canvas").getPixelColor(canvasX, canvasY);
        // 获取该点像素的数据
        // console.log(colorData);
        var color = colorData.rgb;
        $(".zhanshi").css("background", color);
        $(".info_detail_rgb").html(color);
        $(".info_detail_hex").html(colorData.hex);

        var cursorX = (e.pageX - 5) + "px";
        var cursorY = (e.pageY - 5) + "px";
        $("#cursor").stop(true, true).css({
          "display": "inline-block",
          "left": cursorX,
          "top": cursorY
        }).fadeOut(2500);
      });
    }

  }
  $(".picker_choseImg_btn").click(function () {
    $(".operation_chose").click();
  })
  //选择图片
  $(".operation_chose").change(function (e) {
    $("#picker_view").css("display", "inline-block");

    var imgFile = e.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(imgFile)
    reader.onload = function (e) {
      var img = new Image();
      img.src = URL.createObjectURL(imgFile);
      draw(img)
    }
  })






  HTMLElement.prototype.getPixelColor = function (x, y) {
    var thisContext = this.getContext("2d");
    var imageData = thisContext.getImageData(x, y, 1, 1);
    // 获取该点像素数据
    var pixel = imageData.data;
    var r = pixel[0];
    var g = pixel[1];
    var b = pixel[2];
    var a = pixel[3] / 255
    a = Math.round(a * 100) / 100;
    var rHex = r.toString(16);
    r < 16 && (rHex = "0" + rHex);
    var gHex = g.toString(16);
    g < 16 && (gHex = "0" + gHex);
    var bHex = b.toString(16);
    b < 16 && (bHex = "0" + bHex);
    var rgbaColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    var rgbColor = "rgb(" + r + "," + g + "," + b + ")";
    var hexColor = "#" + rHex + gHex + bHex;
    return {
      rgba: rgbaColor,
      rgb: rgbColor,
      hex: hexColor,
      r: r,
      g: g,
      b: b,
      a: a
    };
  }



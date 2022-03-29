// HTTP status code constants
const OK = 200;
const ERROR = 400;

$(document).ready(function() {
    // 初始化插件
    $(this).initPlugin();

    // Enable Pjax Support
    if ($.support.pjax) {
        let pjaxContainer = '#pjax-container';
        $(document).pjax('a:not(.nop, [target="_blank"])', pjaxContainer, {
            timeout: 3000
        }).on('pjax:send', function() {
            NProgress.start();
        }).on('pjax:complete', function() {
            NProgress.done();
        }).on('pjax:end', function(e) {
            $(this).initPlugin();
        }).on('pjax:beforeReplace', function() {
            $(this).destroyPlugin();
        });

        // 表单提交
        $(document).on('submit', 'form[data-pjax]', function(e) {
            let $q = $('#input-search-text'),
                q = $.trim($q.val());
            if (q === '') {
                $q.val('').focus();
                return false;
            }

            $.pjax.submit(e, pjaxContainer)
        });
    }

    // Copy
    var clipboard = new ClipboardJS('.btn-copy');
    clipboard.on('success', function(e) {
        let text = e.trigger.innerHTML;
        e.trigger.innerHTML = '已复制';
        setTimeout(function() {
            e.trigger.innerHTML = text;
        }, 3000);
    });

    // a.btn-copy
    $(document).on('click', '.btn-copy', function(e) {
        e.preventDefault();
    });

    // Clear Content
    $(document).on('click', '.btn-clear-content', function(e) {
        e.preventDefault();

        let target = $(this).data('target');
        if (!target) {
            return;
        }

        let $target = $(target);
        if ($target.is('input') || $target.is('textarea')) {
            $target.val('');
        }
    });

    // mp3 play
    $(document).on('touchend click', 'a[data-pron]', function(e) {
        e.preventDefault();

        // url is defined in the page (outside app.js)
        if (typeof(url) === 'undefined') {
            return;
        }

        let source = url + $(this).data('pron');
        media.audio.play(source);
    });

    // 验证码
    $(document).on('click', '.captcha-refresh', function(e) {
        e.preventDefault();
        util.captcha.refresh();
    });

  
    //   $(".ui_navrow>div.dropdown-container").on({
    //     mouseover : function(){
    //         $(this).children("div").show();
    //     } ,
    //     mouseout : function(){
    //         $(this).children("div").hide();
    //     } 
    //   }) ;
    // Dropdown
    // $(document).on("mouseover", "[data-dropdown]", function(e) {
    //     // e.preventDefault();
    //     // e.stopPropagation();

    //     let $this = $(this);

    //     // hide all first
    //     $('.dropdown-panel').hide();
    //     // then, show the specified dropdown-panel
    //     let $dropdownPanel = $this.next($this.data('dropdown'));
    //     // if not find at `next` position
    //     if ($dropdownPanel.length === 0) {
    //         $dropdownPanel = $($this.data('dropdown'));
    //     }
    //     if ($dropdownPanel.length === 0) {
    //         return;
    //     }

    //     $dropdownPanel.show().find('[role="menu"]').attr({
    //         'aria-expanded': true,
    //         'aria-hidden': false
    //     });
    // });
    
    // // 点击页面其他地方，让下拉菜单消失
    // $(document).on("click", "body", function(e) {
    //     $('.dropdown-panel').hide().find('[role="menu"]').attr({
    //         'aria-expanded': false,
    //         'aria-hidden': true
    //     });
    // });

    // // 除了 .dropdown-panel 本身
    // $(document).on('click', '.dropdown-panel', function(e) {
    //     if ($(this).data('no-hidden') === 1) {
    //         e.stopPropagation();
    //     }
    // });

    // Collapse Toggle
    $(document).on("click", "[data-toggle=collapse]", function(e) {
        e.preventDefault();

        var $this = $(this);
        var collapse = $this.attr('href') ? $this.attr('href') : $this.data('target');
        if (!collapse) {
            return;
        }

        var speed = $this.data('speed') ? $this.data('speed') : '';
        $(collapse).slideToggle(speed);

        if ($this.hasClass('dropright') || $this.hasClass('dropdown')) {
            if ($this.hasClass('dropright')) {
                $this.removeClass('dropright').addClass('dropdown');
            } else {
                $this.removeClass('dropdown').addClass('dropright');
            }
        }
    });

    // contenteditable maxlength restrict
    $(document).on("keydown", "[contenteditable]", function(e) {
        var $this = $(this);
        var maxlength = $this.attr('maxlength');
        if (maxlength !== undefined) {
            maxlength = parseInt(maxlength);
            if ($this.text().length === maxlength && e.keyCode != 8) {
                e.preventDefault();
            }
        }
    });

    // 下载
    $(document).on('click', '.js-download', function(e) {
        e.preventDefault();

        var $this = $(this);

        var type = $this.data('type');
        var name = $this.data('name');
        var filename = $this.data('filename');

        var options = {
            type: type,
            params: {
                name: name,
                filename: filename
            }
        };

        // download
        util.download.file(options);
    });

    // 打印
    $(document).on('click', '.js-print', function(e) {
        e.preventDefault();

        var $this = $(this);
        var printable = $this.data('printable') ? $this.data('printable') : '.printable';
        var options = {
            noPrintSelector: '[data-no-print]',
            append: '<div class="print-date">打印时间：' + new Date().toLocaleString() + '</div>'
        };
        $(printable).print(options);
    });

    // 保存为图片
    $(document).on('click', '.js-save-as-image', function(e) {
        e.preventDefault();

        var $this = $(this);

        var save = function() {
            var text = $this.html();
            $this.html('正在生成图片...');
            var filename = $this.data('filename') ? $this.data('filename') : '下载';
            var scale = $this.data('scale') ? $this.data('scale') : 2;
            scale = parseInt(scale);
            // scale 只能取 1 或 2
            scale = Math.min(scale, 2);
            scale = Math.max(scale, 1);
            var $imageContainer = $this.data('screenshot') ? $($this.data('screenshot')) : $('.screenshotable');
            var width = $imageContainer.outerWidth(),
                height = $imageContainer.outerHeight();
            var canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            var context = canvas.getContext("2d");
            // 然后将画布缩放，将图像放大两倍画到画布上
            context.scale(scale, scale);
            // 获取元素相对于视察的偏移量
            var rect = $imageContainer.get(0).getBoundingClientRect();
            // 设置 context 位置，值为相对于视窗的偏移量负值，让图片复位
            context.translate(-rect.left, -rect.top);

            var offset = $imageContainer.offset();
            html2canvas($imageContainer.get(0), {
                canvas: canvas,
                scale: scale,
                backgroundColor: "transparent",
                x: offset.left,
                y: offset.top,
                useCORS: true
            }).then(function(canvas) {
                util.download.image(canvas, {
                    filename: filename
                });

                $this.html(text);
            });
        }

        var beforeSave = $this.data('beforeSave');
        if (beforeSave && window.clickHandler[beforeSave] && typeof window.clickHandler[beforeSave] === 'function') {
            window.clickHandler[beforeSave]($this, function() {
                save();
            });
        } else {
            save();
        }
    });

    /**
     * 分享到微信，弹窗
     */
    $(document).on("click", '.btn-share-to-wechat', function(e) {
        e.preventDefault();

        if (this.modal) {
            this.modal.open();
            return;
        }

        var options = {
            footer: true,
            closeMethods: ['escape'],
            cssClass: ['modal-wechat-qrcode'],
            beforeOpen: function() {
                var $pageQRcodeContainer = $('#page-qrcode-container');
                if ($pageQRcodeContainer.data('exists') == 1) {
                    return;
                }

                // 要生成二维码的文本
                var wechatUrl = $('#page-canonical-url').val() + '?ref=qrcode&source=wechat';
                // 生成二维码选项
                var _options = {
                    text: wechatUrl,
                    width: 240,
                    height: 240,
                    border: 10
                };
                // 是否添加图标到二维码
                var icon = $('#image-url').length > 0 ? $('#image-url').val() : null;
                if (icon) {
                    $.extend(_options, {
                        iconSrc: icon,
                        iconRadius: 8,
                        iconBorderWidth: 6,
                        iconBorderColor: '#fff'
                    });
                }
                // 生成二维码
                new QRCode($pageQRcodeContainer[0], _options);
                $pageQRcodeContainer.data('exists', 1);
            },
            onOpen: function() {
                $('.tingle-modal-box').attr('role', 'dialog');
            },
            footerButtons: [{
                label: '关闭',
                cssClass: 'btn btn-primary btn-lg',
                callback: function() {
                    // 下面的 this 是指向 modal 的实例
                    this.close();
                }
            }]
        };
        var content = $('#share-to-wechat-template').html();
        this.modal = (new modal(content, options)).open();
    });
});

/* ====================================================================
 *
 * jQuery 插件方法：定义在 $.fn 上
 *
 * ==================================================================== */

// 销毁页面插件
$.fn.destroyPlugin = function() {
    window.loaded = null;
    window.resize = null;
    window.onresize = null;

    // ------ 必须要执行的操作 --------
    // 销毁 datepicker
    if ($.fn.datepicker) {
        $('.datepicker').datepicker('destroy');
    }

    // 由每个页面自行定义具体的销毁逻辑
    if (window.unloaded && typeof window.unloaded === 'function') {
        window.unloaded();
    }
}

// 初始化页面插件
$.fn.initPlugin = function() {
    // 异步加载 styles ...
    if (styles !== undefined) {
        styles = styles.map(function(style) {
            return STATIC_URL + style;
        });
        $('.async-page-style').remove();
        (function(styles) {
            if (typeof styles === 'string') {
                loader.style(styles);
            } else {
                for (let i in styles) {
                    loader.style(styles[i]);
                }
            }
        })(styles);
    }

    // 异步按顺序加载 scripts ...
    if (typeof scripts !== undefined && scripts.length > 0) {
        scripts = scripts.map(function(script) {
            return STATIC_URL + script;
        });
        (function(scripts) {
            loader.scripts(scripts, function() {
                // 依次初始化各个插件
                $(this).executePlugin();

            });
        })(scripts);
    } else {
        // 依次初始化各个插件
        $(this).executePlugin();
    }
}

// 执行各个插件方法
$.fn.executePlugin = function() {
    $(this).imageLazyload()
           .initArticleHeader()
           .initTooltip()
           .initSticky()
           .initUploader()
           .initRangeSlider()
           .initDatePicker()
           .initDoubleRainbowPicker()
           .initColorPickers()
           .initSelect2()
           .initCodeMirror()
           .codeHighlight()
           .searchResultHighlight()
           .initEventHandler();

    // 页面加载完成时执行
    if (window.loaded && typeof window.loaded === 'function') {
        window.loaded();
    }

    // 窗口缩放时执行
    if (window.resize && typeof window.resize === 'function') {
        window.onresize = function() {
            window.resize();
        }
    }
}

// 图片延迟加载实现，通过 IntersectionObserver API 实现
$.fn.imageLazyload = function() {
    // 加载图片
    const loadImage = image => {
        let src = image.getAttribute('data-src');
        let srcset = src.replace(/(\.[0-9a-z]+)$/i, '@2x$1');
        // 把 src 和 srcset 补充完整
        src = STATIC_URL + src;
        srcset = STATIC_URL + srcset;

        // 通过 Promise 异步获取图片
        util.image.fetch(src).then(() => {
            image.src = src;
        }).then(() => {
            // 获取 2x 图片，必须放到 then() 里面
            util.image.fetch(srcset).then(() => {
                image.setAttribute('srcset', srcset + ' 2x');
            });
        });
    };

    // 定义图片延迟加载函数
    const lazyload = image => {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.disconnect();
                }
            });
        });

        io.observe(image);
    };

    // 要延迟加载的那些图片
    let images = document.querySelectorAll('[data-src]');

    // 判断浏览器是否支持 IntersectionObserver API
    if ('IntersectionObserver' in window) {
        // 支持：使用 lazyLoad 函数延迟按需加载图片
        images.forEach(lazyload);
    } else {
        // 不支持：直接加载图片
        images.forEach(image => {
            loadImage(image);
        });
    }

    return this;
};

// 页面 click, change 等处理程序
$.fn.initEventHandler = function() {
    /**
     * 为具有 [data-click-handler] 属性的元素绑定点击事件处理程序
     */
    $(document).off("click", "[data-click-handler], [data-click-emitter]").on("click", "[data-click-handler], [data-click-emitter]", function(e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.data('spp') !== undefined) {
            e.stopPropagation();
        }

        if (!window.clickHandler) {
            return;
        }

        var handler = $this.data('click-handler');
        if (!handler) {
            if (typeof window.clickHandler === 'function') {
                window.clickHandler($(e.target));
            }
        } else {
            if (window.clickHandler[handler] && typeof window.clickHandler[handler] === 'function') {
                window.clickHandler[handler]($(e.target));
            }
        }
    });

    /**
     * 为具有 [data-change-handler] 属性的元素绑定值改变事件处理程序
     */
    $(document).on("change", '[data-change-handler]', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!window.changeHandler) {
            return;
        }

        var $this = $(e.target);
        var handler = $(this).data('change-handler');
        if (!handler) {
            if (typeof window.changeHandler === 'function') {
                window.changeHandler($this);
            }
        } else {
            if (window.changeHandler[handler] && typeof window.changeHandler[handler] === 'function') {
                window.changeHandler[handler]($this);
            }
        }
    });

    /**
     * 为具有 [data-keyup-trigger] 属性的元素绑定 keyup 事件处理程序
     * 即绑定回车按键处理程序
     */
    $(document).on("keyup", "[data-keyup-trigger]", function(e) {
        if (e.which != 13) {
            return;
        }

        var $this = $(this);
        var trigger = $this.data('keyup-trigger');
        if (!trigger) {
            return;
        }

        $this.blur();
        $(trigger).trigger('click');
    });

    return this;
};

// 侧边栏跟随滚动
$.fn.initSticky = function() {
    if ($.fn.stick_in_parent && $('.sticker').length > 0) {
        var $this, offsetTop = 16;
        $('.sticker').each(function() {
            $this = $(this);
            if ($this.data('offset-top') !== undefined) {
                offsetTop = $this.data('offset-top');
            }
            $this.stick_in_parent({
                offset_top: offsetTop
            }).on("sticky_kit:stick", function(e) {
                if (typeof _sticky === 'object' && typeof _sticky.onstick === 'function') {
                    _sticky.onstick(e);
                }
            }).on("sticky_kit:unstick", function(e) {
                if (typeof _sticky === 'object' && typeof _sticky.onunstick === 'function') {
                    _sticky.onunstick(e);
                }
            });
        });
    }

    return this;
};

// 初始化上传控件
$.fn.initUploader = function() {
    if ($.fn.dmUploader && $('.imageupload').length > 0) {
        $('.imageupload').each(function() {
            let options = {};
            if (typeof _options !== 'undefined') {
                let key = $(this).data('key');
                key = key ? key : 'default';
                if (_options[key]) {
                    $.extend(options, _options[key]);
                }
            }
            let uploaderIns = (new uploader('.imageupload')).init(options);
            $(this).data('uploader', uploaderIns);
        });
    }

    return this;
};

// 初始化 Range Slider 控件
$.fn.initRangeSlider = function() {
    $range = $('input[type="range"]');
    if ($range.length === 0) {
        return this;
    }

    if ($.fn.rangeslider) {
        // 先销毁，再循环 init 每个 range 元素
        $range.rangeslider('destroy').each(function() {
            var $this = $(this);
            var key = $this.data('key') ? $this.data('key') : 'default';
            var $target = $this.data('target') ? $($this.data('target')) : null;

            // 默认选项
            var options = {
                polyfill: false,

                // Default CSS classes
                rangeClass: 'rangeslider',
                disabledClass: 'rangeslider-disabled',
                horizontalClass: 'rangeslider-horizontal',
                verticalClass: 'rangeslider-vertical',
                fillClass: 'rangeslider-fill',
                handleClass: 'rangeslider-handle',

                // Callback function
                onInit: function() {
                    // console.log('Range Slider Initialized.');
                    if ($target !== null) {
                        $target.html($this.val());
                    }
                },

                // Callback function 移动鼠标的时候触发
                onSlide: function(position, value) {
                    if ($target !== null) {
                        $target.html(value);
                    }
                },

                // Callback function 放开鼠标的时候触发
                onSlideEnd: function(position, value) {
                    $this.attr('aria-valuenow', value);
                }
            };

            // 合并自定义选项（如果有）
            if (typeof(_rangeSliderOptions) === 'object' && _rangeSliderOptions[key] !== undefined) {
                $.extend(options, _rangeSliderOptions[key]);
            }

            // 初始化 Range Slider 控件
            $this.rangeslider(options);
        });
    }

    return this;
};

// 初始化日期选择控件
$.fn.initDatePicker = function() {
    if ($.fn.datepicker && $('.datepicker').length > 0) {
        let options = {
            // [MUST] define the language first...
            language: 'zh-CN',
            autoHide: true,
            format: 'yyyy-mm-dd'
        };
        $('.datepicker').each(function() {
            $(this).datepicker(options);
        });
    }

    return this;
};

// 初始化颜色选择控件，使用 DoubleRainbow
$.fn.initDoubleRainbowPicker = function() {
    if (typeof(DoubleRainbow) === 'function' && $('.double-rainbow-picker').length > 0) {
        $('.double-rainbow-picker').each(function() {
            new DoubleRainbow(this).init();
        });
    }

    return this;
};

// 使用 Spectrum 在指定元素上初始化颜色选择控件
$.fn.initColorPicker = function() {
    let $this = $(this);
    let key = $this.data('key') ? $this.data('key') : 'default';
    let palette = [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(153, 153, 153)","rgb(183, 183, 183)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(239, 239, 239)", "rgb(243, 243, 243)", "rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)", "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ];

    // 默认选项
    let options = {
        color: 'black',
        preferredFormat: 'hex',
        showInput: true,
        showPalette: true,
        showAlpha: true,
        showInput: true,
        showButtons: true,
        showSelectionPalette: true,
        hideAfterPaletteSelect: true,
        palette: palette
    };

    // 合并自定义选项（如果有）
    if (typeof(_colorPickerOptions) === 'object' && _colorPickerOptions[key] !== undefined) {
        // 合并 default 的选项
        if (key !== 'default') {
            if (_colorPickerOptions['default'] !== undefined) {
                // extend() 方法第一个参数为空对象，以保证 default 不会被改变
                _colorPickerOptions[key] = $.extend({}, _colorPickerOptions['default'], _colorPickerOptions[key]);
            }
        }

        $.extend(options, _colorPickerOptions[key]);
    }

    // 初始化颜色选择器
    $this.spectrum(options);
};

// 初始化颜色选择控件
$.fn.initColorPickers = function() {
    // 先删除所有 color picker 元素
    $('.sp-container').remove();

    if ($.fn.spectrum && $('.color-picker').length > 0) {
        $('.color-picker').each(function() {
            $(this).initColorPicker();
        });
    }

    return this;
};

// 初始化 select2 控件
$.fn.initSelect2 = function() {
    if ($.fn.select2 && $('.select2').length > 0) {
        $('.select2').each(function() {
            let $this = $(this);
            var key = $this.data('key') ? $this.data('key') : 'default';

            // 默认选项
            var options = {
                minimumInputLength: 0
            };

            // 合并自定义选项（如果有）
            if (typeof(_select2Options) === 'object' && _select2Options[key] !== undefined) {
                $.extend(options, _select2Options[key]);
            }

            // 初始化 select2 控件
            $this.select2(options);
        });
    }

    return this;
};

// 初始化 Codemirror 控件
$.fn.initCodeMirror = function() {
    if (typeof(CodeMirror) !== "undefined") {
        // 先删除，否则，在浏览器按「后退」按钮时，每次都会出现新的 CodeMirror 实例
        $('.CodeMirror').remove();

        // CodeMirror normal usage...
        $('.codemirror-control').each(function() {
            var $this = $(this);
            var bindto = $this.data('bindto');
            var copyBindto = $this.data('copyBindto');
            copyBindto = copyBindto === undefined ? '.btn-copy-code' : copyBindto;
            var clearBindto = $this.data('clearBindto');
            clearBindto = clearBindto === undefined ? '.btn-clear-code' : clearBindto;

            // Codemirror 配置
            var config = {
                theme: "default",
                lineNumbers: true,
                cursorHeight: .85,
                matchBrackets: true,
                autoCloseBrackets: true,
                indentUnit: 4,
                htmlMode: true,
                // styleActiveLine: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "customergutter"]
            };

            // 渲染模式
            if ($this.data('mode')) {
                $.extend(config, {
                    mode: $this.data('mode')
                });
            }

            // 是否显示行号
            if ($this.data('line-numbers') != null) {
                $.extend(config, {
                    lineNumbers: $this.data('line-numbers') == '0' ? false : true
                });
            }

            // 是否显示gutter
            if ($this.data('gutters') == '0') {
                $.extend(config, {
                    gutters: []
                });
            }

            // 是否禁止按回车键
            if ($this.data('disable-enter-key')) {
                $.extend(config, {
                    extraKeys: {
                        'Enter': function() {
                            return false;
                        }
                    }
                });
            }

            // 是否自动换行
            if ($this.data('line-wrapping')) {
                $.extend(config, {
                    lineWrapping: true
                });
            }

            // 是否是只读（判断依据是判断 textarea 是否有 readonly 属性）
            if ($this.is('[readonly]')) {
                $.extend(config, {
                    readOnly: 'nocursor'
                });
            }

            // 实例化 CodeMirror 对象
            var myeditor = CodeMirror.fromTextArea(this, config);
            $this.data('cm-editor', myeditor);

            // 监听内容编辑事件
            var changeHandler = $this.data('change-handler');
            myeditor.on('change', function(cm, change) {
                var value = cm.getValue();
                $(copyBindto).prop('disabled', value === '');

                // 如果有 textarea 元素有 changeHandler，才执行赋值和触发 change 事件的操作
                if (changeHandler !== undefined) {
                    $this.val(value).trigger('change');
                }
            });

            // 绑定到指定元素上，以便引用
            if (bindto && $(bindto).length > 0) {
                $(bindto).data('cm-editor', myeditor);
            }

            // 清空 CodeMirror 的内容
            $(document).off('click', clearBindto).on('click', clearBindto, function() {
                myeditor.setValue("");
                myeditor.clearHistory();
            });

            // 复制 CodeMirror 的内容
            if (typeof(ClipboardJS) !== 'undefined') {
                new ClipboardJS(copyBindto, {
                    text: function(trigger) {
                        return myeditor.getValue();
                    }
                }).on('success', function(e) {
                    myeditor.execCommand('selectAll');
                    let text = e.trigger.innerHTML;
                    e.trigger.innerHTML = '已复制';
                    setTimeout(function() {
                        e.trigger.innerHTML = text;
                    }, 3000);
                });
            }
        });
    }

    return this;
};

// 初始化 Tooltip
$.fn.initTooltip = function() {
    if (typeof(Tooltip) !== 'undefined' && $('[data-toggle="tooltip"]').length > 0) {
        $('[data-toggle="tooltip"]').each(function() {
            var $this = $(this);
            var options = {
                placement: $this.data('placement') ? $this.data('placement') : 'bottom',
                title: $this.data('title'),
                html: true
            }
            new Tooltip($this, options);
        });
    }

    return this;
};

// headable: 为工具介绍里面的 h1/h2/h3/h4 生成id属性
$.fn.initArticleHeader = function() {
    if ($('.headable').length > 0) {
        var slugs = [];
        $('.headable').find('h1,h2,h3,h4').each(function(index) {
            var $this = $(this);
            // 获取标签ID属性
            var idText = $this.attr('id');
            // 如果没有 id 属性，则添加（有就不管了）
            if (!idText) {
                idText = util.string.slugify($this.text());
                if (idText === '') {
                    idText = 'heading-' + (index + 1);
                }

                // 判断是否有重复的slug
                if ($.inArray(idText, slugs) !== -1) {
                    idText = idText + '-' + (index + 1);
                }
                // 存入数据
                slugs.push(idText);

                // 赋值给id属性
                $this.attr({
                    id: idText
                });
            }

            // 插入一个锚链接
            $this.prepend('<a href="#' + idText + '" class="anchor"><span></span></a>');
        });
    }

    return this;
};

$.fn.codeHighlight = function() {
    Prism.highlightAll();
    return this;
};

// 高亮搜索结果
$.fn.searchResultHighlight = function() {
    if ($.fn.highlight) {
        let query = $('.query-text').val();
        $('.highlightable').highlight(query);
    }

    return this;
}
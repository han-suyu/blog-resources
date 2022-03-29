const OK = 200;
const ERROR = 400;
const UNAUTHORIZED = 401;
$(document).ready(function () {
    const ALLOW_REGISTER = false;
    const $entrance = $('#entrance');
    checkLogin();
    $(this).initPlugin();
    if ($.support.pjax) {
        let pjaxContainer = '#pjax-container';
        $(document).pjax('a:not(.nop, [target="_blank"])', pjaxContainer, {timeout: 3000}).on('pjax:send', function () {
            NProgress.start();
        }).on('pjax:complete', function () {
            NProgress.done();
        }).on('pjax:end', function (e) {
            checkLogin();
            $(this).initPlugin();
        }).on('pjax:beforeReplace', function () {
            $(this).destroyPlugin();
        });
        $(document).on('submit', 'form[data-pjax]', function (e) {
            let $q = $('#input-search-text'), q = $.trim($q.val());
            if (q === '') {
                $q.val('').focus();
                return false;
            }
            $.pjax.submit(e, pjaxContainer)
        });
    }

    function checkLogin() {
        if (ALLOW_REGISTER !== true) {
            return;
        }
        http.u('auth.checking').then((json) => {
            let current = $entrance.data('name');
            if (json.code == OK) {
                $entrance.removeClass('unsigned');
                if (current !== json.data.name || $entrance.html() === '') {
                    $entrance.data('name', json.data.name);
                    return {'signed': true, 'update': true, 'template': 1, 'name': json.data.name};
                }
                return {'signed': true, 'update': false};
            } else {
                $entrance.addClass('unsigned');
                if (current || $entrance.html() === '') {
                    $entrance.removeData('name');
                    return {'update': true, 'template': 0, 'name': ''};
                }
                return {'update': false};
            }
        }).then((json) => {
            if (json.update === true) {
                http.u('auth.updateEntrance', {'data': {template: json.template, name: json.name}}, (res) => {
                    $entrance.html(res.data.template);
                });
            }
            updateFavoriteLabel(json.signed);
            if (json.signed) {
                addViewedHistory();
            }
        });
    }

    function updateFavoriteLabel(signed) {
        let $wrap = $('.favorite-action');
        if ($wrap.length > 0) {
            if (!signed) {
                $wrap.html($('#add-template').html());
                return;
            }
            http.u("favorite", {data: {slug: $('#slug').val()}}).then((json) => {
                if (json.code == OK) {
                    $wrap.html($('#added-template').html()).initTooltip();
                } else {
                    $wrap.html($('#add-template').html());
                }
            });
        }
    }

    function addViewedHistory() {
        let $slug = $('#slug');
        if ($slug.length === 0) {
            return;
        }
        let slug = $slug.val();
        http.u('history.add', {data: {slug: slug}});
    }

    var clipboard = new ClipboardJS('.btn-copy');
    clipboard.on('success', function (e) {
        if (e.text === "") {
            return;
        }
        let text = e.trigger.innerHTML;
        e.trigger.innerHTML = '已复制';
        setTimeout(function () {
            e.trigger.innerHTML = text;
        }, 3000);
    });
    $(document).on('click', '.btn-copy', function (e) {
        e.preventDefault();
    });
    $(document).on('click', '.btn-clear-content', function (e) {
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
    $(document).on('touchend click', 'a[data-pron]', function (e) {
        e.preventDefault();
        if (typeof (url) === 'undefined') {
            return;
        }
        let source = url + $(this).data('pron');
        media.audio.play(source);
    });
    $(document).on('click', '.captcha-refresh', function (e) {
        e.preventDefault();
        util.captcha.refresh();
    });
    $(document).on("click", "[data-dropdown]", function (e) {
        e.preventDefault();
        e.stopPropagation();
        let $this = $(this);
        $('.dropdown-panel').not(function () {
            return $(this).parent().find('[data-dropdown]').is($this);
        }).slideUp(100, function () {
            $(this).find('[role="menu"]').attr({'aria-expanded': false, 'aria-hidden': true});
        });
        let $dropdownPanel = $this.next($this.data('dropdown'));
        if ($dropdownPanel.length === 0) {
            $dropdownPanel = $($this.data('dropdown'));
        }
        if ($dropdownPanel.length === 0) {
            return;
        }
        $dropdownPanel.slideDown(200, function () {
            $(this).find('[role="menu"]').attr({'aria-expanded': true, 'aria-hidden': false})
        });
    });
    $(document).on("click", "body", function (e) {
        $('.dropdown-panel').slideUp(100, function () {
            let $this = $(this);
            if ($this.hasClass('created')) {
                $this.remove();
            } else {
                $this.find('[role="menu"]').attr({'aria-expanded': false, 'aria-hidden': true});
            }
        });
    });
    $(document).on('click', '.dropdown-panel', function (e) {
        if ($(this).data('no-hidden') === 1) {
            e.stopPropagation();
        }
    });
    $(document).on("click", "[data-toggle=collapse]", function (e) {
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
    $(document).on("keydown", "[contenteditable]", function (e) {
        var $this = $(this);
        var maxlength = $this.attr('maxlength');
        if (maxlength !== undefined) {
            maxlength = parseInt(maxlength);
            if ($this.text().length === maxlength && e.keyCode != 8) {
                e.preventDefault();
            }
        }
    });
    $(document).on('click', '.link-add-to-favorite', function (e) {
        let $this = $(this);
        doast.clear();
        http.u('favorite.add', {
            data: {slug: $('#slug').val()}, beforeSend: () => {
                $this.addClass('hidden');
                $this.parent().append($('#adding-template').html());
            }
        }).then((json) => {
            $this.parent().find('.loading-text').remove();
            if (json.code == UNAUTHORIZED) {
                $this.removeClass('hidden');
                doast.info("加入收藏前，请先登录！");
                return;
            }
            if (json.code == OK) {
                $this.parent().html($('#added-template').html()).initTooltip();
                doast.success(json.message);
            } else {
                $this.removeClass('hidden');
                doast.error(json.message);
            }
        });
    });
    $(document).on('click', '.js-download', function (e) {
        e.preventDefault();
        var $this = $(this);
        var type = $this.data('type');
        var name = $this.data('name');
        var filename = $this.data('filename');
        var options = {type: type, params: {name: name, filename: filename}};
        util.download.file(options);
    });
    $(document).on('click', '.js-print', function (e) {
        e.preventDefault();
        var $this = $(this);
        var printable = $this.data('printable') ? $this.data('printable') : '.printable';
        var options = {
            noPrintSelector: '[data-no-print]',
            append: '<div class="print-date">打印时间：' + new Date().toLocaleString() + '</div>'
        };
        $(printable).print(options);
    });
    $(document).on('click', '.js-save-as-image', function (e) {
        e.preventDefault();
        let $this = $(this);
        let filenameHandler = function (filename) {
            let timestamp = (new Date()).getTime();
            filename = filename.replace(/(.*?)(\{timestamp\})(.*?)/g, "$1" + timestamp + "$3");
            return filename;
        }
        let save = function () {
            let text = $this.html();
            $this.html('正在生成图片...');
            let scale = $this.data('scale') ? $this.data('scale') : 2;
            scale = parseInt(scale);
            scale = Math.min(scale, 2);
            scale = Math.max(scale, 1);
            let $imageContainer = $this.data('screenshot') ? $($this.data('screenshot')) : $('.screenshotable');
            let width = $imageContainer.outerWidth(), height = $imageContainer.outerHeight();
            let canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            let context = canvas.getContext("2d");
            context.scale(scale, scale);
            let rect = $imageContainer.get(0).getBoundingClientRect();
            context.translate(-rect.left, -rect.top);
            let offset = $imageContainer.offset();
            let ext = $this.data('ext') ?? 'png';
            let bgColor = ext === 'png' ? 'transparent' : '#ffffff';
            html2canvas($imageContainer.get(0), {
                canvas: canvas,
                scale: scale,
                background: bgColor,
                x: offset.left,
                y: offset.top,
                useCORS: true
            }).then(function (canvas) {
                let filename = $this.data('filename') ?? '下载';
                filename = filenameHandler(filename);
                util.download.image(canvas, {filename: filename, ext: ext});
                $this.html(text);
            });
        }
        let beforeSave = $this.data('beforeSave');
        if (beforeSave && window.clickHandler[beforeSave] && typeof window.clickHandler[beforeSave] === 'function') {
            window.clickHandler[beforeSave]($this, function () {
                save();
            });
        } else {
            save();
        }
    });
    $(document).on("click", '.btn-share-to-wechat', function (e) {
        e.preventDefault();
        if (this.modal) {
            this.modal.open();
            return;
        }
        var options = {
            footer: true, closeMethods: ['escape'], cssClass: ['modal-wechat-qrcode'], beforeOpen: function () {
                var $pageQRcodeContainer = $('#page-qrcode-container');
                if ($pageQRcodeContainer.data('exists') == 1) {
                    return;
                }
                var wechatUrl = $('#page-canonical-url').val() + '?ref=qrcode&source=wechat';
                var _options = {text: wechatUrl, width: 240, height: 240, border: 10};
                var icon = $('#image-url').length > 0 ? $('#image-url').val() : null;
                if (icon) {
                    $.extend(_options, {iconSrc: icon, iconRadius: 8, iconBorderWidth: 6, iconBorderColor: '#fff'});
                }
                new QRCode($pageQRcodeContainer[0], _options);
                $pageQRcodeContainer.data('exists', 1);
            }, onOpen: function () {
                $('.tingle-modal-box').attr('role', 'dialog');
            }, footerButtons: [{
                label: '关闭', cssClass: 'btn btn-primary btn-lg', callback: function () {
                    this.close();
                }
            }]
        };
        var content = $('#share-to-wechat-template').html();
        this.modal = (new modal(content, options)).open();
    });
});
$.fn.destroyPlugin = function () {
    window.loaded = null;
    window.resize = null;
    window.onresize = null;
    if ($.fn.datepicker) {
        $('.datepicker').datepicker('destroy');
    }
    if ($.fn.spectrum) {
        $('.color-picker').spectrum("destroy");
    }
    if ($.fn.rangeslider) {
    }
    if (typeof doast !== 'undefined') {
        doast.clear();
    }
    if (window.unloaded && typeof window.unloaded === 'function') {
        window.unloaded();
    }
}
$.fn.initPlugin = function () {
    if (styles !== undefined) {
        styles = styles.map(function (style) {
            return STATIC_URL + style;
        });
        $('.async-page-style').remove();
        (function (styles) {
            if (typeof styles === 'string') {
                loader.style(styles);
            } else {
                for (let i in styles) {
                    loader.style(styles[i]);
                }
            }
        })(styles);
    }
    if (typeof scripts !== undefined && scripts.length > 0) {
        scripts = scripts.map(function (script) {
            return STATIC_URL + script;
        });
        (function (scripts) {
            loader.scripts(scripts, function () {
                $(this).executePlugin();
            });
        })(scripts);
    } else {
        $(this).executePlugin();
    }
}
$.fn.executePlugin = function () {
    $(this).imageLazyload().initArticleHeader().initTooltip().initSticky().initUploader().initRangeSlider().initDatePicker().initDoubleRainbowPicker().initColorPickers().initSelect2().initCodeMirror().codeHighlight().searchResultHighlight().initEventHandler();
    if (window.loaded && typeof window.loaded === 'function') {
        window.loaded();
    }
    if (window.resize && typeof window.resize === 'function') {
        window.onresize = function () {
            window.resize();
        }
    }
}
$.fn.imageLazyload = function () {
    const loadImage = image => {
        let src = image.getAttribute('data-src');
        let srcset = src.replace(/(\.[0-9a-z]+)$/i, '@2x$1');
        src = STATIC_URL + src;
        srcset = STATIC_URL + srcset;
        util.image.fetch(src).then(() => {
            image.src = src;
        }).then(() => {
            util.image.fetch(srcset).then(() => {
                image.setAttribute('srcset', srcset + ' 2x');
            });
        });
    };
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
    let images = document.querySelectorAll('[data-src]');
    if ('IntersectionObserver' in window) {
        images.forEach(lazyload);
    } else {
        images.forEach(image => {
            loadImage(image);
        });
    }
    return this;
};
$.fn.initEventHandler = function () {
    $(document).off("click", "[data-click-handler], [data-click-emitter]").on("click", "[data-click-handler], [data-click-emitter]", function (e) {
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
    $(document).on("change", '[data-change-handler]', function (e) {
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
    $(document).on("keyup", "[data-keyup-trigger]", function (e) {
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
$.fn.initSticky = function () {
    if ($.fn.stick_in_parent && $('.sticker').length > 0) {
        var $this, offsetTop = 16;
        $('.sticker').each(function () {
            $this = $(this);
            if ($this.data('offset-top') !== undefined) {
                offsetTop = $this.data('offset-top');
            }
            $this.stick_in_parent({offset_top: offsetTop}).on("sticky_kit:stick", function (e) {
            }).on("sticky_kit:unstick", function (e) {
            });
        });
    }
    return this;
};
$.fn.initUploader = function () {
    if ($.fn.dmUploader && $('.imageupload').length > 0) {
        $('.imageupload').each(function () {
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
$.fn.initRangeSlider = function () {
    $range = $('input[type="range"]');
    if ($range.length === 0) {
        return this;
    }
    $('.rangeslider').remove();
    if ($.fn.rangeslider) {
        $range.rangeslider('destroy').each(function () {
            var $this = $(this);
            var key = $this.data('key') ? $this.data('key') : 'default';
            var $target = $this.data('target') ? $($this.data('target')) : null;
            var options = {
                polyfill: false,
                rangeClass: 'rangeslider',
                disabledClass: 'rangeslider-disabled',
                horizontalClass: 'rangeslider-horizontal',
                verticalClass: 'rangeslider-vertical',
                fillClass: 'rangeslider-fill',
                handleClass: 'rangeslider-handle',
                onInit: function () {
                    if ($target !== null) {
                        $target.html($this.val());
                    }
                },
                onSlide: function (position, value) {
                    if ($target !== null) {
                        $target.html(value);
                    }
                },
                onSlideEnd: function (position, value) {
                    $this.attr('aria-valuenow', value);
                }
            };
            if (typeof (_rangeSliderOptions) === 'object' && _rangeSliderOptions[key] !== undefined) {
                $.extend(options, _rangeSliderOptions[key]);
            }
            $this.rangeslider(options);
        });
    }
    return this;
};
$.fn.initDatePicker = function () {
    if ($.fn.datepicker && $('.datepicker').length > 0) {
        let options = {language: 'zh-CN', autoHide: true, format: 'yyyy-mm-dd'};
        $('.datepicker').each(function () {
            $(this).datepicker(options);
        });
    }
    return this;
};
$.fn.initDoubleRainbowPicker = function () {
    if (typeof (DoubleRainbow) === 'function' && $('.double-rainbow-picker').length > 0) {
        $('.double-rainbow-picker').each(function () {
            new DoubleRainbow(this).init();
        });
    }
    return this;
};
$.fn.initColorPicker = function () {
    let $this = $(this);
    let key = $this.data('key') ? $this.data('key') : 'default';
    let palette = [["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(153, 153, 153)", "rgb(183, 183, 183)", "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(239, 239, 239)", "rgb(243, 243, 243)", "rgb(255, 255, 255)"], ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)", "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)", "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)", "rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)", "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)", "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]];
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
    if (typeof (_colorPickerOptions) === 'object' && _colorPickerOptions[key] !== undefined) {
        if (key !== 'default') {
            if (_colorPickerOptions['default'] !== undefined) {
                _colorPickerOptions[key] = $.extend({}, _colorPickerOptions['default'], _colorPickerOptions[key]);
            }
        }
        $.extend(options, _colorPickerOptions[key]);
    }
    $this.spectrum(options);
};
$.fn.initColorPickers = function () {
    $('.sp-replacer').remove();
    $('.sp-container').remove();
    if ($.fn.spectrum && $('.color-picker').length > 0) {
        $('.color-picker').each(function () {
            if (!$(this).hasClass('hidden')) {
                $(this).initColorPicker();
            }
        });
    }
    return this;
};
$.fn.initSelect2 = function () {
    if ($.fn.select2 && $('.select2').length > 0) {
        $('.select2').each(function () {
            let $this = $(this);
            var key = $this.data('key') ? $this.data('key') : 'default';
            var options = {minimumInputLength: 0};
            if (typeof (_select2Options) === 'object' && _select2Options[key] !== undefined) {
                $.extend(options, _select2Options[key]);
            }
            $this.select2(options);
        });
    }
    return this;
};
$.fn.initCodeMirror = function () {
    if (typeof (CodeMirror) !== "undefined") {
        $('.CodeMirror').remove();
        $('.codemirror-control').each(function () {
            var $this = $(this);
            var bindto = $this.data('bindto');
            var copyBindto = $this.data('copyBindto');
            copyBindto = copyBindto === undefined ? '.btn-copy-code' : copyBindto;
            var clearBindto = $this.data('clearBindto');
            clearBindto = clearBindto === undefined ? '.btn-clear-code' : clearBindto;
            var config = {
                theme: "default",
                lineNumbers: true,
                cursorHeight: .85,
                matchBrackets: true,
                autoCloseBrackets: true,
                indentUnit: 4,
                htmlMode: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "customergutter"]
            };
            if ($this.data('mode')) {
                $.extend(config, {mode: $this.data('mode')});
            }
            if ($this.data('line-numbers') != null) {
                $.extend(config, {lineNumbers: $this.data('line-numbers') == '0' ? false : true});
            }
            if ($this.data('gutters') == '0') {
                $.extend(config, {gutters: []});
            }
            if ($this.data('disable-enter-key')) {
                $.extend(config, {
                    extraKeys: {
                        'Enter': function () {
                            return false;
                        }
                    }
                });
            }
            if ($this.data('line-wrapping')) {
                $.extend(config, {lineWrapping: true});
            }
            if ($this.is('[readonly]')) {
                $.extend(config, {readOnly: 'nocursor'});
            }
            var myeditor = CodeMirror.fromTextArea(this, config);
            $this.data('cm-editor', myeditor);
            var changeHandler = $this.data('change-handler');
            myeditor.on('change', function (cm, change) {
                var value = cm.getValue();
                $(copyBindto).prop('disabled', value === '');
                if (changeHandler !== undefined) {
                    $this.val(value).trigger('change');
                }
            });
            if (bindto && $(bindto).length > 0) {
                $(bindto).data('cm-editor', myeditor);
            }
            $(document).off('click', clearBindto).on('click', clearBindto, function () {
                myeditor.setValue("");
                myeditor.clearHistory();
            });
            if (typeof (ClipboardJS) !== 'undefined') {
                new ClipboardJS(copyBindto, {
                    text: function (trigger) {
                        return myeditor.getValue();
                    }
                }).on('success', function (e) {
                    if (e.text === "") {
                        return;
                    }
                    myeditor.execCommand('selectAll');
                    let text = e.trigger.innerHTML;
                    e.trigger.innerHTML = '已复制';
                    setTimeout(function () {
                        e.trigger.innerHTML = text;
                    }, 3000);
                });
            }
        });
    }
    return this;
};
$.fn.initTooltip = function () {
    if (typeof (Tooltip) !== 'undefined' && $('[data-toggle="tooltip"]').length > 0) {
        $('[data-toggle="tooltip"]').each(function () {
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
$.fn.initArticleHeader = function () {
    if ($('.headable').length > 0) {
        var slugs = [];
        $('.headable').find('h1,h2,h3,h4').each(function (index) {
            var $this = $(this);
            var idText = $this.attr('id');
            if (!idText) {
                idText = util.string.slugify($this.text());
                if (idText === '') {
                    idText = 'heading-' + (index + 1);
                }
                if ($.inArray(idText, slugs) !== -1) {
                    idText = idText + '-' + (index + 1);
                }
                slugs.push(idText);
                $this.attr({id: idText});
            }
            $this.prepend('<a href="#' + idText + '" class="anchor"><span></span></a>');
        });
    }
    return this;
};
$.fn.codeHighlight = function () {
    Prism.highlightAll();
    return this;
};
$.fn.searchResultHighlight = function () {
    if ($.fn.highlight) {
        let query = $('.query-text').val();
        $('.highlightable').highlight(query);
    }
    return this;
};
$.fn.extend({
    /**
    生成 angular material 风格的按钮
    https://material.angularjs.org/latest/demo/button
    @param options {Object}
        - text 按钮内容文字。不提供时，按钮内容为一个.icon元素，需在样式表内自行设置背景url
        - tooltipContent 浮动提示条的内容文字。不提供时，不显示浮动提示条
        - tooltipPosition 浮动提示条的位置。不提供时默认为'top'
        - clickCallback 点击动作的回调，在mouseup时触发
    */
    initButton(options) {
        this.each(function() {
            let $button = $(this).data('animating', false)

            /*
            拼接按钮内容HTML
            - 如有有效的text属性则按钮内容为字符
            - 否则内容为一个icon，在样式表内自行定义。这时给按钮元素添加_round类
            */
            let textContent = options.text || null
            let buttonContentHTML = ''
            if (typeof textContent === 'string' && /\S/.test(textContent)) {
                buttonContentHTML = `<span class="content">${textContent}</span>`
            } else {
                buttonContentHTML = `<span class="icon-wrap"><i class="icon"></i></span>`
                $button.addClass('_round')
            }

            /*
            将浮动提示条相关数据写入data
            */
            let tooltipHTML = ''
            let tooltipContent = options.tooltipContent
            if (typeof tooltipContent === 'string') {
                $button.data({
                    tooltipContent,
                    tooltipPosition: options.tooltipPosition || 'top'
                })
                $button.addClass('show-tooltip')
            }

            let clickCallback = typeof options.clickCallback === 'function' ? options.clickCallback : function() {}

            let buttonHTML = `
                ${buttonContentHTML}
                <div class="ripple-container"><span class="ripple"></span></div>`

            $button.html(buttonHTML)

            $button
                .on('animationstart', function(e) {
                    let $this = $(this)
                    let $animatingTarget = $(e.target)
                    if ($animatingTarget.hasClass('ripple')) {
                        $this.data('animating', true)
                    }
                })
                .on('mousedown', function(evt) {
                    let $this = $(this)
                    if ($this.data('animating') === false) {
                        let $ripple = $this.find('.ripple')
                        let _x = evt.offsetX
                        let _y = evt.offsetY
                        let _width = $this.innerWidth()
                        let _height = $this.innerHeight()
                        // 根据事件坐标和按钮水平中点的距离，获取波纹的直径
                        let offsetToHorizontalCenter = _width / 2 - _x
                        let offsetToVerticalCenter = _height / 2 - _y
                        let sideLength = _width + (offsetToHorizontalCenter) * 2 + (_width / 10)
                        $ripple.css({
                            width: sideLength,
                            height: sideLength,
                            left: (_width - sideLength) / 2 - offsetToHorizontalCenter,
                            top: (_height - sideLength) / 2 - offsetToVerticalCenter,
                        })
                        $this.addClass('mousedown')
                    }

                })
                .on('mouseup', function(e) {
                    let $this = $(this)
                    if ($this.data('animating') === true) {
                        $this.removeClass('mousedown').addClass('mouseup')
                        clickCallback()
                    }
                })
                .on('animationend', function(e) {
                    let $this = $(this)
                    let $animatingTarget = $(e.target)
                    if ($animatingTarget.hasClass('ripple-container')) {
                        $this.removeClass('mouseup')
                        $this.data('animating', false)
                    }
                })
                .on('mouseenter', function(evt) {
                    let $this = $(this)
                    if ($this.hasClass('show-tooltip')) {
                        let $tooltip = $(`<p id="jm-tooltip" class="to-show-at-${$this.data('tooltipPosition')}">
                                    ${$this.data('tooltipContent')}
                                </p>`)
                        $('body').append($tooltip)
                        setTooltipPosition($tooltip, $this, $this.data('tooltipPosition'))
                        $tooltip.addClass('show')
                    }
                })
                .on('mouseleave', function(evt) {
                    let $this = $(this)
                    if ($this.data('animating') === true) {
                        $this.removeClass('mousedown').addClass('mouseup')
                    }
                    if ($this.hasClass('show-tooltip')) {
                        $('#jm-tooltip').removeClass('show').remove()
                    }
                })

            // 以目标按钮元素为参照，确定提示条元素的位置
            function setTooltipPosition($tooltip, $button, direction) {
                let buttonPageLeft = $button.offset().left - document.documentElement.scrollLeft
                let buttonPageTop = $button.offset().top - document.documentElement.scrollTop
                let buttonWidth = $button.outerWidth()
                let buttonHeight = $button.outerHeight()
                let tooltipWidth = $tooltip.outerWidth()
                let tooltipHeight = $tooltip.outerHeight()
                let offsetLeft,
                    offsetTop
                switch (direction) {
                    case 'top':
                        offsetLeft = (buttonWidth - tooltipWidth) / 2
                        offsetTop = -(tooltipHeight + 10)
                        break;
                    case 'left':
                        offsetLeft = -(tooltipWidth + 10)
                        offsetTop = (buttonHeight - tooltipHeight) / 2
                        break;
                    case 'bottom':
                        offsetLeft = (buttonWidth - tooltipWidth) / 2
                        offsetTop = buttonHeight + 10
                        break;
                    case 'right':
                        offsetLeft = buttonWidth + 10
                        offsetTop = (buttonHeight - tooltipHeight) / 2
                        break;
                }
                $tooltip.css({
                    left: buttonPageLeft + offsetLeft,
                    top: buttonPageTop + offsetTop,
                })
            }

        })
    }
})
function triggerChartsResize(){
    try {
        if (window.onresize){
            window.onresize();
        }
    } catch (e){
        //just swallow it
    }
    $(window).trigger('resize');
}

$(function(){
    //settings
    var $settings = $("#settings"),
        $sidebarSettings = $("#sidebar-settings"),
        settingsState = JSON.parse(localStorage.getItem("settings-state")) || {
            sidebar: 'left',
            sidebarState: 'auto',
            displaySidebar: true
        },
        $pageHeader = $(".page-header"),
        $body = $("body"),
        popoverReallyHide = function(){
            $settings.data('bs.popover').hoverState = 'out'; //yeah. cool BS3 fix. popover programmatic APi works only on HOVER
            $settings.popover('hide');
        },
        popoverClose = function(e){
            var $popover = $settings.siblings(".popover");
            if($popover.length && !$.contains($popover[0], e.target)){
                popoverReallyHide();
                $(document).off("click", popoverClose);
            }
        },
        sidebarSide = function(side){
            if (side == "right"){
                $body.addClass("sidebar-on-right")
            } else {
                $body.removeClass("sidebar-on-right")
            }
        },
        sidebarState = function(state, triggerResize){
            var $template = $('#sidebar-settings-template');
            triggerResize = triggerResize == undefined ? true : false;
            if (!$template[0]){
                return;
            }
            $sidebarSettings.html(_.template($template.html())({sidebarState: state}));
            if (state == "auto"){
                $(".sidebar, .side-nav, .wrap, .logo").removeClass("sidebar-icons");
            } else {
                $(".sidebar, .side-nav, .wrap, .logo").addClass("sidebar-icons");
            }
            if (triggerResize){
                triggerChartsResize();
            }

        },
        displaySidebar = function(display, triggerResize){
            triggerResize = triggerResize == undefined ? true : false;
            if (display == true){
                $body.removeClass("sidebar-hidden")
            } else {
                $body.addClass("sidebar-hidden")
            }
            if (triggerResize){
                triggerChartsResize();
            }
        };

    sidebarSide(settingsState.sidebar);
    sidebarState(settingsState.sidebarState, false);
    displaySidebar(settingsState.displaySidebar, false);

    if (!$settings[0]){
        return;
    }

    $settings.popover({
        template: '<div class="popover settings-popover">' +
            '<div class="arrow"></div>' +
            '<div class="popover-inner">' +
            '<div class="popover-content"></div>' +
            '</div>' +
            '</div>',
        html: true,
        animation: false,
        placement: 'bottom',
        content: function(){
            return _.template($('#settings-template').html())(settingsState);
        }
    }).click(function(e){
            //close all open dropdowns
            $('.page-header .dropdown.open .dropdown-toggle').dropdown('toggle');
            // need to remove popover on anywhere-click
            $(document).on("click", popoverClose);
            $(this).focus();
            return false;
        });

    $(".page-header .dropdown-toggle").click(function(){
        popoverReallyHide()
        $(document).off("click", popoverClose);
    });
    //sidevar left/right
    $pageHeader.on("click", ".popover #sidebar-toggle .btn", function(){
        var $this = $(this),
            side = $this.data("value");
        sidebarSide(side);
        settingsState.sidebar = side;
        localStorage.setItem("settings-state", JSON.stringify(settingsState));
    });

    //sidebar visibility
    $pageHeader.on("click", ".popover #display-sidebar-toggle .btn", function(){
        var $this = $(this),
            display = $this.data("value");
        displaySidebar(display);
        settingsState.displaySidebar = display;
        localStorage.setItem("settings-state", JSON.stringify(settingsState));
    });

    //sidebar state {active, icons}
    $sidebarSettings.on("click", ".btn", function(){
        var $this = $(this),
            state = $this.data("value");
        if (state == 'icons'){
            closeNavigation();
        }
        sidebarState(state);
        settingsState.sidebarState = state;
        localStorage.setItem("settings-state", JSON.stringify(settingsState));
    });

    //close navigation if sidebar in icons state
    if (($("#sidebar").is(".sidebar-icons") || $(window).width() < 1049) && $(window).width() > 767){
        closeNavigation();
    }

    //imitate buttons radio behavior
    $pageHeader.on("click", ".popover [data-toggle='buttons-radio'] .btn:not(.active)", function(){
        var $this = $(this),
            $buttons = $this.parent().find('.btn');
        $buttons.removeClass('active');
        setTimeout(function(){
            $this.addClass('active');
        }, 0)
    });
});

/**
 * A global object containing theme specific colors, screen variables & color functions.
 * @type Object
 */
window.LightBlue = {
    screens: {
        'xs-max': 767,
        'sm-min': 768,
        'sm-max': 991,
        'md-min': 992,
        'md-max': 1199,
        'lg-min': 1200
    },

    isScreen: function(size){
        var screenPx = window.innerWidth;
        return (screenPx >= this.screens[size + '-min'] || size == 'xs') && (screenPx <= this.screens[size + '-max'] || size == 'lg');
    },

    getScreenSize: function(){
        var screenPx = window.innerWidth;
        if (screenPx <= this.screens['xs-max']) return 'xs';
        if ((screenPx >= this.screens['sm-min']) && (screenPx <= this.screens['sm-max'])) return 'sm';
        if ((screenPx >= this.screens['md-min']) && (screenPx <= this.screens['md-max'])) return 'md';
        if (screenPx >= this.screens['lg-min']) return 'lg';
    },

    //credit http://stackoverflow.com/questions/1507931/generate-lighter-darker-color-in-css-using-javascript
    changeColor: function(color, ratio, darker) {
        var pad = function(num, totalChars) {
            var pad = '0';
            num = num + '';
            while (num.length < totalChars) {
                num = pad + num;
            }
            return num;
        };
        // Trim trailing/leading whitespace
        color = color.replace(/^\s*|\s*$/, '');

        // Expand three-digit hex
        color = color.replace(
            /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
            '#$1$1$2$2$3$3'
        );

        // Calculate ratio
        var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
        // Determine if input is RGB(A)
            rgb = color.match(new RegExp('^rgba?\\(\\s*' +
                '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                '\\s*,\\s*' +
                '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                '\\s*,\\s*' +
                '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
                '(?:\\s*,\\s*' +
                '(0|1|0?\\.\\d+))?' +
                '\\s*\\)$'
                , 'i')),
            alpha = !!rgb && rgb[4] != null ? rgb[4] : null,

        // Convert hex to decimal
            decimal = !!rgb? [rgb[1], rgb[2], rgb[3]] : color.replace(
                /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
                function() {
                    return parseInt(arguments[1], 16) + ',' +
                        parseInt(arguments[2], 16) + ',' +
                        parseInt(arguments[3], 16);
                }
            ).split(/,/),
            returnValue;

        // Return RGB(A)
        return !!rgb ?
        'rgb' + (alpha !== null ? 'a' : '') + '(' +
        Math[darker ? 'max' : 'min'](
            parseInt(decimal[0], 10) + difference, darker ? 0 : 255
        ) + ', ' +
        Math[darker ? 'max' : 'min'](
            parseInt(decimal[1], 10) + difference, darker ? 0 : 255
        ) + ', ' +
        Math[darker ? 'max' : 'min'](
            parseInt(decimal[2], 10) + difference, darker ? 0 : 255
        ) +
        (alpha !== null ? ', ' + alpha : '') +
        ')' :
            // Return hex
            [
                '#',
                pad(Math[darker ? 'max' : 'min'](
                    parseInt(decimal[0], 10) + difference, darker ? 0 : 255
                ).toString(16), 2),
                pad(Math[darker ? 'max' : 'min'](
                    parseInt(decimal[1], 10) + difference, darker ? 0 : 255
                ).toString(16), 2),
                pad(Math[darker ? 'max' : 'min'](
                    parseInt(decimal[2], 10) + difference, darker ? 0 : 255
                ).toString(16), 2)
            ].join('');
    },
    lighten: function(color, ratio) {
        return this.changeColor(color, ratio, false);
    },
    darken: function(color, ratio) {
        return this.changeColor(color, ratio, true);
    }
};
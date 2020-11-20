window.PJAX_ENABLED = false;
window.DEBUG        = true;

//colors
//same as in _variables.scss
//keep it synchronized
var $lime = "#8CBF26",
    $red = "#F45722",
    $redDark = "#d04f4f",
    $blue = "#2477FF",
    $green = "#2D8515",
    $orange = "#E49400",
    $pink = "#E671B8",
    $purple = "#A700AE",
    $brown = "#A05000",
    $teal = "#4179CF",
    $gray = "#666",
    $white = "#fff",
    $textColor = $gray;

//turn off charts is needed
var chartsOff = false;
if (chartsOff){
    nv.addGraph = function(){};
}

COLOR_VALUES = [$red, $orange, $green, $blue, $teal, $redDark];

window.colors = function(){
    if (!window.d3) return false;
    return d3.scale.ordinal().range(COLOR_VALUES);
}();

function keyColor(d, i) {
    if (!window.colors){
        window.colors = function(){
            return d3.scale.ordinal().range(COLOR_VALUES);
        }();
    }
    return window.colors(d.key)
}

function closeNavigation(){
    var $accordion = $('#side-nav').find('.panel-collapse.in');
    $accordion.collapse('hide');
    $accordion.siblings(".accordion-toggle").addClass("collapsed");
    resetContentMargin();
    var $sidebar = $('#sidebar');
    if ($(window).width() < 768 && $sidebar.is('.in')){
        $sidebar.collapse('hide');
    }
}

function resetContentMargin(){
    if ($(window).width() > 767){
        $(".content").css("margin-top", '');
    }
}

function initPjax(){
    var PjaxApp = function(){
        this.pjaxEnabled = window.PJAX_ENABLED;
        this.debug = window.DEBUG;
        this.$sidebar = $('#sidebar');
        this.$content = $('.content');
        this.$loaderWrap = $('.loader-wrap');
        this.pageLoadCallbacks = {};
        this.loading = false;

        this._resetResizeCallbacks();
        this._initOnResizeCallbacks();

        if (this.pjaxEnabled){

            //prevent pjaxing if already loading
            this.$sidebar.find('a:not(.accordion-toggle):not([data-no-pjax])').on('click', $.proxy(this._checkLoading, this));
            $(document).pjax('#sidebar a:not(.accordion-toggle):not([data-no-pjax])', '.content', {
                fragment: '.content',
                type: 'GET', //use POST to prevent caching when debugging,
                timeout: 10000
            });
            $(document).on('pjax:start', $.proxy(this._changeActiveNavigationItem, this));
            $(document).on('pjax:start', $.proxy(this._resetResizeCallbacks, this));
            $(document).on('pjax:send', $.proxy(this.showLoader, this));
            $(document).on('pjax:success', $.proxy(this._loadScripts, this));
            //custom event which fires when all scripts are actually loaded
            $(document).on('pjax-app:loaded', $.proxy(this._loadingFinished, this));
            $(document).on('pjax-app:loaded', $.proxy(this.hideLoader, this));
            $(document).on('pjax:end', $.proxy(this.pageLoaded, this));
            window.onerror = $.proxy(this._logErrors, this);
        }
    };

    PjaxApp.prototype._initOnResizeCallbacks = function(){
        var resizeTimeout,
            view = this;

        $(window).resize(function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function(){
                view._runPageCallbacks(view.resizeCallbacks);
            }, 100);
        });
    };

    PjaxApp.prototype._resetResizeCallbacks = function(){
        this.resizeCallbacks = {};
    };

    PjaxApp.prototype._changeActiveNavigationItem = function(event, xhr, options){
        this.$sidebar.find('li.active').removeClass('active');

        this.$sidebar.find('a[href*="' + this.extractPageName(options.url) + '"]').each(function(){
            if (this.href === options.url){
                $(this).closest('li').addClass('active')
                    .closest('.panel').addClass('active');
            }
        });
    };

    PjaxApp.prototype.showLoader = function(){
        var view = this;
        this.showLoaderTimeout = setTimeout(function(){
            view.$content.addClass('hiding');
            view.$loaderWrap.removeClass('hide');
            setTimeout(function(){
                view.$loaderWrap.removeClass('hiding');
            }, 0)
        }, 200);
    };

    PjaxApp.prototype.hideLoader = function(){
        clearTimeout(this.showLoaderTimeout);
        this.$loaderWrap.addClass('hiding');
        this.$content.removeClass('hiding');
        var view = this;
        this.$loaderWrap.one($.support.transition.end, function () {
            view.$loaderWrap.addClass('hide');
            view.$content.removeClass('hiding');
        }).emulateTransitionEnd(200)
    };

    /**
     * Specify a function to execute when window was resized.
     * Runs maximum once in 100 milliseconds.
     * @param fn A function to execute
     */
    PjaxApp.prototype.onResize = function(fn){
        this._addPageCallback(this.resizeCallbacks, fn);
    };

    /**
     * Specify a function to execute when page was reloaded with pjax.
     * @param fn A function to execute
     */
    PjaxApp.prototype.onPageLoad = function(fn){
        this._addPageCallback(this.pageLoadCallbacks, fn);
    };

    PjaxApp.prototype.pageLoaded = function(){
        this._runPageCallbacks(this.pageLoadCallbacks);
    };

    PjaxApp.prototype._addPageCallback = function(callbacks, fn){
        var pageName = this.extractPageName(location.href);
        if (!callbacks[pageName]){
            callbacks[pageName] = [];
        }
        callbacks[pageName].push(fn);
    };

    PjaxApp.prototype._runPageCallbacks = function(callbacks){
        var pageName = this.extractPageName(location.href);
        if (callbacks[pageName]){
            _(callbacks[pageName]).each(function(fn){
                fn();
            })
        }
    };

    PjaxApp.prototype._loadScripts = function(event, data, status, xhr, options){
        var $bodyContents = $($.parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0], document, true)),
            $scripts = $bodyContents.filter('script[src]').add($bodyContents.find('script[src]')),
            $templates = $bodyContents.filter('script[type="text/template"]').add($bodyContents.find('script[type="text/template"]')),
            $existingScripts = $('script[src]'),
            $existingTemplates = $('script[type="text/template"]');

        //append templates first as they are used by scripts
        $templates.each(function() {
            var id = this.id;
            var matchedTemplates = $existingTemplates.filter(function() {
                //noinspection JSPotentiallyInvalidUsageOfThis
                return this.id === id;
            });
            if (matchedTemplates.length) return;

            var script = document.createElement('script');
            script.id = $(this).attr('id');
            script.type = $(this).attr('type');
            script.innerHTML = this.innerHTML;
            document.body.appendChild(script);
        });



        //ensure synchronous loading
        var $previous = {
            load: function(fn){
                fn();
            }
        };

        $scripts.each(function() {
            var src = this.src;
            var matchedScripts = $existingScripts.filter(function() {
                //noinspection JSPotentiallyInvalidUsageOfThis
                return this.src === src;
            });
            if (matchedScripts.length) return;

            var script = document.createElement('script');
            script.src = $(this).attr('src');
            $previous.on('load', function(){
                document.body.appendChild(script);
            });

            $previous = $(script);
        });

        var view = this;
        $previous.on('load', function(){
            $(document).trigger('pjax-app:loaded');
            view.log('scripts loaded.');
        })
    };

    PjaxApp.prototype.extractPageName = function(url){
        //credit: http://stackoverflow.com/a/8497143/1298418
        var pageName = url.split('#')[0].substring(url.lastIndexOf("/") + 1).split('?')[0];
        return pageName === '' ? 'index.html' : pageName;
    };

    PjaxApp.prototype._checkLoading = function(e){
        var oldLoading = this.loading;
        this.loading = true;
        if (oldLoading){
            this.log('attempt to load page while already loading; preventing.');
            e.preventDefault();
        } else {
            this.log(e.currentTarget.href + ' loading started.');
        }
        //prevent default if already loading
        return !oldLoading;
    };

    PjaxApp.prototype._loadingFinished = function(){
        this.loading = false;
    };

    PjaxApp.prototype._logErrors = function(){
        var errors = JSON.parse(localStorage.getItem('lb-errors')) || {};
        errors[new Date().getTime()] = arguments;
        localStorage.setItem('lb-errors', JSON.stringify(errors));
    };

    PjaxApp.prototype.log = function(message){
        if (this.debug){
            console.log(message
                    + " - " + arguments.callee.caller.toString().slice(0, 30).split('\n')[0]
                    + " - " + this.extractPageName(location.href)
            );
        }
    };

    window.PjaxApp = new PjaxApp();
}


function initDemoFunctions(){
    $(document).one('pjax:end', function(){
//        alert('The page was loaded with pjax!');
    });
}

function initAppPlugins(){
    /* ========================================================================
     * Table head check all checkboxes
     * ========================================================================
     */
    !function($){
        $(document).on('click', 'table th [data-check-all]', function () {
            $(this).closest('table').find('input[type=checkbox]')
                .not(this).prop('checked', $(this).prop('checked'));
        });
    }(jQuery);

    /* ========================================================================
     * Animate Progress Bars
     * ========================================================================
     */
    !function($){

        $.fn.animateProgressBar = function () {
            return this.each(function () {
                var $bar = $(this).find('.progress-bar');
                setTimeout(function(){
                    $bar.css('width', $bar.data('width'));
                }, 0)
            })
        };

        $('.js-progress-animate').animateProgressBar();
    }(jQuery);
}

$(function(){

    var $sidebar = $('#sidebar');

    $sidebar.on("mouseleave",function(){
        if (($(this).is(".sidebar-icons") || $(window).width() < 1049) && $(window).width() > 767){
            setTimeout(function(){
                closeNavigation();
            }, 300); // some timeout for animation
        }
    });

    //need some class to present right after click
    $sidebar.on('show.bs.collapse', function(e){
        e.target == this && $sidebar.addClass('open');
    });

    $sidebar.on('hide.bs.collapse', function(e){
        if (e.target == this) {
            $sidebar.removeClass('open');
            $(".content").css("margin-top", '');
        }
    });

    $(window).resize(function(){
        //if ($(window).width() < 768){
            closeNavigation();
        //}
    });

    $(document).on('pjax-app:loaded', function(){
        if ($(window).width() < 768){
            closeNavigation();
        }
    })

    //class-switch for button-groups
    $(".btn-group > .btn[data-toggle-class]").click(function(){
        var $this = $(this),
            isRadio = $this.find('input').is('[type=radio]'),
            $parent = $this.parent();

        if (isRadio){
            $parent.children(".btn[data-toggle-class]").removeClass(function(){
                return $(this).data("toggle-class")
            }).addClass(function(){
                return $(this).data("toggle-passive-class")
            });
            $this.removeClass($(this).data("toggle-passive-class")).addClass($this.data("toggle-class"));
        } else {
            $this.toggleClass($(this).data("toggle-passive-class")).toggleClass($this.data("toggle-class"));
        }
    });


    $("#search-toggle").click(function(){
        //first hide menu if open

        if ($sidebar.data('bs.collapse')){
            $sidebar.collapse('hide');
        }

        var $notifications = $('.notifications'),
            notificationsPresent = !$notifications.is(':empty');

        $("#search-form").css('height', function(){
            var $this = $(this);
            if ($this.height() == 0){
                $this.css('height', 40);
                notificationsPresent && $notifications.css('top', 86);
            } else {
                $this.css('height', 0);
                notificationsPresent && $notifications.css('top', '');
            }
        });
    });


    //hide search field if open
    $sidebar.on('show.bs.collapse', function () {
        var $notifications = $('.notifications'),
            notificationsPresent = !$notifications.is(':empty');
        $("#search-form").css('height', 0);
        notificationsPresent && $notifications.css('top', '');
    });

    /*   Move content down when second-level menu opened */
    $("#side-nav").find("a.accordion-toggle").on('click',function(){
        if ($(window).width() < 768){
            var $this = $(this),
                $sideNav = $('#side-nav'),
                menuHeight = $sideNav.height() + parseInt($sideNav.css('margin-top')) + parseInt($sideNav.css('margin-bottom')),
                contentMargin = menuHeight + 20,
                $secondLevelMenu = $this.find("+ ul"),
                $subMenuChildren = $secondLevelMenu.find("> li"),
                subMenuHeight = $.map($subMenuChildren, function(child){ return $(child).height()})
                    .reduce(function(sum, el){ return sum + el}),
                $content = $(".content");
            if (!$secondLevelMenu.is(".in")){ //when open
                $content.css("margin-top", (contentMargin + subMenuHeight - $this.closest('ul').find('> .panel > .panel-collapse.open').height()) + 'px');
            } else { //when close
                $content.css("margin-top", contentMargin - subMenuHeight + 'px');
            }
        }
    });

    $sidebar.on('show.bs.collapse', function(e){
        if (e.target == this){
            if ($(window).width() < 768){
                var $sideNav = $('#side-nav'),
                    menuHeight = $sideNav.height() + parseInt($sideNav.css('margin-top')) + parseInt($sideNav.css('margin-bottom')),
                    contentMargin = menuHeight + 20;
                $(".content").css("margin-top", contentMargin + 'px');
            }
        }
    });

    //need some class to present right after click for submenu
    var $subMenus = $sidebar.find('.panel-collapse');
    $subMenus.on('show.bs.collapse', function(e){
        if (e.target == this){
            $(this).addClass('open');
        }
    });

    $subMenus.on('hide.bs.collapse', function(e){
        if (e.target == this){
            $(this).removeClass('open');
        }
    });

    initPjax();
    initDemoFunctions();
    initAppPlugins();

});


/**
 * Util functions
 */

function testData(stream_names, points_count) {
    var now = new Date().getTime(),
        day = 1000 * 60 * 60 * 24, //milliseconds
        days_ago_count = 60,
        days_ago = days_ago_count * day,
        days_ago_date = now - days_ago,
        points_count = points_count || 45, //less for better performance
        day_per_point = days_ago_count / points_count;
    return stream_layers(stream_names.length, points_count, .1).map(function(data, i) {
        return {
            key: stream_names[i],
            values: data.map(function(d,j){
                return {
                    x: days_ago_date + d.x * day * day_per_point,
                    y: Math.floor(d.y * 100) //just a coefficient
                }
            })
        };
    });
}


/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
    if (arguments.length < 3) o = 0;
    function bump(a) {
        var x = 1 / (.1 + Math.random()),
            y = 2 * Math.random() - .5,
            z = 10 / (.1 + Math.random());
        for (var i = 0; i < m; i++) {
            var w = (i / m - y) * z;
            a[i] += x * Math.exp(-w * w);
        }
    }
    return d3.range(n).map(function() {
        var a = [], i;
        for (i = 0; i < m; i++) a[i] = o + o * Math.random();
        for (i = 0; i < 5; i++) bump(a);
        return a.map(stream_index);
    });
}

function stream_index(d, i) {
    return {x: i, y: Math.max(0, d)};
}


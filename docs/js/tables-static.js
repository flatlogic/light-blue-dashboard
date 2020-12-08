$(function(){

    function pageLoad(){
        $('.widget').widgster();
        $('.sparkline').each(function(){
            $(this).sparkline('html', $(this).data());
        });
        $('.js-progress-animate').animateProgressBar();
    }

    pageLoad();

    PjaxApp.onPageLoad(pageLoad);

});
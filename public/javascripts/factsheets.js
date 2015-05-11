var bt = $('#sidebarcontent').position().top;

$(window).scroll(function() {
    var wst = $(window).scrollTop();

    (wst >= bt) ?
    $('#sidebarcontent').css({position: 'fixed', top: 15+'px' }) :  
    $('#sidebarcontent').css({position: 'absolute', top: bt+'px' })
});

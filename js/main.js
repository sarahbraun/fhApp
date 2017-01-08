function menuLeftShow() {
    $('#navigation').toggleClass('open');
    $('.navbar').toggleClass('menu-left-open');
}
$('#show-navigation').on('click touchend', function(e) {
    e.preventDefault();
    menuLeftShow();
});
$('#hide-navigation').on('click touchend', function(e) {
    e.preventDefault();
    menuLeftShow();
});
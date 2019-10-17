document.getElementById("searchBar").addEventListener("focus", function(){addClass('mainContainer','input-active')});
document.getElementById("searchBar").addEventListener("blur", function(){removeClass('mainContainer','input-active')});
document.getElementById("searchBar").addEventListener("keydown", function(){handleQuery(event,this.value)});
$('#customAnimationsBtn').click(function(e){
    toggleAnimations();
});
$('#closebutton').click(function(e){
    e.preventDefault();
    closeNav();
});
$('#sidenavhomea').click(function(e){
    e.preventDefault();
    openNav();
});
init();
$( "#leftsidemenu" ).mousemove(function( event ) {
    if(event.pageX<100){
        openNav()
    }
});
setTimeout(function() {
    $("#customMatrix").on('DOMSubtreeModified', "#colorPicker", function() {
        updateMatrixColor($('#colorPicker').html());
    });
}, 1000);
$('#ip').click(function(){
    toggleShowIP()
});

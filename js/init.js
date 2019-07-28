document.getElementById("searchBar").addEventListener("focus", function(){addClass('mainContainer','input-active')});
document.getElementById("searchBar").addEventListener("blur", function(){removeClass('mainContainer','input-active')});
document.getElementById("searchBar").addEventListener("keydown", function(){handleQuery(event,this.value)});
$('#customAnimationsBtn').click(function(e){
    //e.preventDefault();
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
$('#leftsidemenu').mouseover(function(){
    openNav()
});
init();
SetCookie("matrix-color", "#0C85D3", 31536000000);
setTimeout(function() {
    $("#customMatrix").on('DOMSubtreeModified', "#colorPicker", function() {
        updateMatrixColor($('#colorPicker').html());
    });
}, 3000);
//window.location.reload();
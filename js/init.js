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
const observerCallback = (mutationsList, observer) => {
    // Loop through all mutations that occurred
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            updateMatrixColor(colorPicker.innerHTML);
        }
    }
};
setTimeout(function() {
    const colorPicker = document.querySelector('#colorPicker');
    
    const observer = new MutationObserver(observerCallback);
    const config = { childList: true, subtree: true };
    observer.observe(colorPicker, config);
}, 1000);
$('#ip').click(function(){
    toggleShowIP()
});
$(document).ready(function(){
    $("#footer").html($("#footer").html().replace('{year}', new Date().getFullYear()));
    ATCOMP.init();
});

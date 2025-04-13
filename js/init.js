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
let last_time = 0;
const observerCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type !== 'attributes' && mutation.attributeName !== 'data-current-color') return;
        let now = new Date().getTime();
        if (now - last_time > 100) {
            last_time = now;
            updateMatrixColor(mutation.target.dataset['currentColor']);
        }
    }
};
const colorPicker = document.querySelector('#colorPicker');
const observer = new MutationObserver(observerCallback);
const config = { attributes: true };
observer.observe(colorPicker, config);
$('#ip').click(function(){
    toggleShowIP()
});
$(document).ready(function(){
    $("#footer").html($("#footer").html().replace('{year}', new Date().getFullYear()));
});

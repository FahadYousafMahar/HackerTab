function randomInt(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
document.getElementById("canvasContainer").appendChild(canvas);

var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

function clearCanvas(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
}

clearCanvas();

var t = 0; //counter variable
var colors = ['#4f91f9', '#a7f94f', '#f94f4f', '#f9f74f', '#8930ff', '#fc4edf', '#ff9c51']; //color array for random color setting
var nodeSize = 3.5; //node size (radius)
var speed = 1; //base speed (added to each node random speed)
var nodeAmount = 300; //node amount, the more the slower
var nodes = []; //node array
var lineWidth = 1; //node connection line width in pixels
var nodePositionArray = []; //node position array for drawing the lines
var drawLineThreshold = 130; //the threshold for drawing the lines, the more the slower

//generate x random of nodes with random position and push them to the array
for(var i = 0; i < nodeAmount; i++){
	var node = new Node(randomInt(0, width), randomInt(0, height), i);
	nodes.push(node);
}

//circle function (draws circle given x, y and radius)
function circle(x,y,radius){
	ctx.beginPath();
	ctx.arc(x,y,radius,0,2*Math.PI);
	ctx.closePath();
}

//line function (draws line given a set of two points(as x1,y1,x2,y2))
function line(x1,y1,x2,y2){
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

//calculate the distance between two points
function distance(x1,x2,y1,y2){
	var xDist = x2-x1;
	var yDist = y2-y1;
	return Math.sqrt(xDist * xDist + yDist * yDist);
}

//range a numbers given a value and two ranges
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//check if n is even
function isEven(n) {
  return n == parseFloat(n)? !(n%2) : void 0;
}

//convert from hex to rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//set them nodes up! (for initializing the nodePositionArray)
for(var i = 0; i < nodes.length; i++){
	nodes[i].move();
	nodes[i].draw();
}

//loop function
function loop(){
	//reset canvas
	clearCanvas();

	//draw the lines
	drawLines();
	
	//move each node and draw it
	for(var i = 0; i < nodes.length; i++){
		nodes[i].move();
		nodes[i].draw();
	}
	
	//repeat loop
	requestAnimationFrame(loop);

	//increase counter
	t++;
}

//run the loop
loop();

//node constructor function
function Node(x, y, id){
	this.x = x;
	this.y = y;
	this.id = id;

	//if the node id is even, start moving them in the opposite direction
	if(isEven(id)){
		this.speedX = randomInt(1, 100)/100 + speed;
		this.speedY = randomInt(1, 100)/100 + speed;
	}else{
		this.speedX = randomInt(1, 100)/100 - speed;
		this.speedY = randomInt(1, 100)/100 - speed;
	}

	this.size = nodeSize;

	//set random color from array
	this.color = colors[Math.floor(Math.random() * colors.length)];

	this.move = function(){
		this.y += this.speedY;		
		this.x += this.speedX;

		//make them bounce
		if(this.y < 1 || this.y > height-nodeSize*2){
			this.speedY = -this.speedY;
		}
		if(this.x < 1 || this.x > width-nodeSize*2){
			this.speedX = -this.speedX;
		}

		//push the position and color to the array for drawing the lines
		nodePositionArray[this.id] = [this.x, this.y, this.color];
	};

	//draw the nodes
	this.draw = function(){
		ctx.fillStyle = this.color;
		circle(this.x, this.y, nodeSize);
		ctx.fill();
	};
}

function drawLines(){
	for(var i = 0; i < nodePositionArray.length - 1; i++){

		//get the origin point
		var x1 = nodePositionArray[i][0];
		var y1 = nodePositionArray[i][1];

		//this sub-loop is made to avoid drawing the nodes twice, which leads to consume more cpu and spoils the opacity effect
		for(var j = 0; j < nodePositionArray.length - (i+1); j++){

			//get the destination point
			var x2 = nodePositionArray[j+i+1][0];
			var y2 = nodePositionArray[j+i+1][1];

			//calculate distance between the origin and target points
			var dist = distance(x1,x2,y1,y2);

			//if distance is greater than the threshold, draw the lines
			if(dist<drawLineThreshold){
				var finalOpacity = map_range(dist, 0, drawLineThreshold, 1, 0);
				var rgbValues = hexToRgb(nodePositionArray[i][2]);
				var color = 'rgba('+rgbValues.r+','+rgbValues.g+','+rgbValues.b+','+finalOpacity+')';

				ctx.strokeStyle = color;
				line(x1,y1,x2,y2);
			}
		}
	}
}

//resize event listener
window.addEventListener('resize', function(){
	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;

	clearCanvas();

	//reset the nodes
	nodes = [];

	//generate nodes again
	for(var i = 0; i < nodeAmount; i++){
		var node = new Node(randomInt(0, width), randomInt(0, height), i);
		nodes.push(node);
	}

	//set them up
	for(var i = 0; i < nodes.length; i++){
		nodes[i].move();
		nodes[i].draw();
	}
});
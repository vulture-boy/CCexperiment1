function setup(){
    var canv = createCanvas(windowWidth,windowHeight);
    canv.position(0,0);
	
	volHistory = []; // Stores volume values 
	backstep = 2; // Time backstep to draw circles (offset)
	circles = 10; // Circles to draw
	brighter = 12; // Brightness difference between circles
	multiplierA = windowWidth * 3; // Width multiplier for amplitude
	multiplierB = windowHeight * 3; // Height multiplier for amplitude
	
	redInit = random(110);
	blueInit = random(110);
	greenInit = random(110);
	
    calibrateWindow();
    mic = new p5.AudioIn();
    mic.start();
}

function calibrateWindow() {
    shapePositionX = windowWidth/2;
    shapePositionY = windowHeight/2;
    shapeWidth = windowWidth/5;
}

function windowResized() {
	resizeCanvas(windowWidth,windowHeight);
	calibrateWindow();
}

function draw(){
	
	background(redInit+10,blueInit+10,greenInit+10);
	var vol = mic.getLevel();
    console.log(vol);
    volHistory.push(vol);
	
	// Circles 
	for (i=0;i<(circles);i++) {
		if (volHistory.length > backstep * i ) {
			push();
				beginShape();
				translate(0,0); // Confirm position
				noStroke();
				//fill(random(100)+i*brighter,random(100)+i*brighter,random(100)+i*brighter);  // Trippy edition
				fill(redInit +i*brighter,blueInit +i*brighter,greenInit +i*brighter, 180);
				var backValue = volHistory.length -backstep * i -1; // Where to source amp data from
				ellipse(shapePositionX,shapePositionY,volHistory[backValue] * multiplierA, volHistory[backValue] * multiplierB);
				endShape();
			pop();

		}
	}
	
	// Lines
	noFill();
	push();
		beginShape();
		var currentY = map(vol, 0, 1, height, 0);
		translate(0, height / 2 - currentY);
		stroke(255-redInit,255-blueInit,255-greenInit);
		strokeWeight(2);
		for (var i = 0; i < volHistory.length; i++) {
			var y = map(volHistory[i], 0, 1, height, 0);
			
			vertex(i, y);
			line(i,y,i,windowHeight);
		}
		endShape();
	pop();
	if (volHistory.length > width) {
		volHistory.splice(0, 1);
	}
}
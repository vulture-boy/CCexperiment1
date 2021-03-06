/* OctoSwish Plus - A graphical audio sampler
See README for details
*/

function preload() { // Preload graphical assets
	img_board_on = loadImage('images/boardIn.png');
	img_board_off = loadImage('images/boardOut.png');
	img_board_press = loadImage('images/boardPress.png');
	img_board_on_act = loadImage('images/boardInA.png');
	img_board_off_act = loadImage('images/boardOutA.png');
	img_board_press_act = loadImage('images/boardPressA.png');
	img_board_on_mod = loadImage('images/boardInM.png');
	img_board_off_mod = loadImage('images/boardOutM.png');
	img_board_press_mod = loadImage('images/boardPressM.png');
	img_board_on_twk = loadImage('images/boardInT.png');
	img_board_off_twk = loadImage('images/boardOutT.png');
	img_board_press_twk = loadImage('images/boardPressT.png');
	
	img_cursor = loadImage('images/cursor.png');
	img_tog_1 = loadImage('images/toggleA.png');
	img_tog_2 = loadImage('images/toggleB.png');
	img_mic_on = loadImage('images/micOn.png');
	img_mic_off = loadImage('images/micOff.png');
	img_mic_press = loadImage('images/micPress.png');
	img_play_board_on = loadImage('images/playOn.png');
	img_play_board_off = loadImage('images/playOff.png');
	img_play_board_press = loadImage('images/playPress.png');
	img_play_sample_on = loadImage('images/playSOn.png');
	img_play_sample_off = loadImage('images/playSOff.png');
	img_play_sample_press = loadImage('images/playSPress.png');
	img_logo = loadImage('images/logo.png');
}

function setup() { // Initialization of Canvas Properties

	////// Canvas //////

	// Setup the Canvas based on the window dimensions
	var canv = createCanvas(windowWidth, windowHeight);
	canv.position(0,0);
	fr = 30; // Frames per second 
	frameRate(fr); 
	getAudioContext().resume(); // Overrides sound setting
	
	// Indicates display mode
	dispMode = 0; // 0 - Board || 1 - Graphics
	modeSwitchDelay = 0; // Counter to prevent mode switching issues
	modeSwitchStart = 1.5 * fr; // Counter Value to activate mSD
	
	// Used when determining drawing perspective
	nativeX = 1920; // Mockup proportions
	nativeY = 1080;
	
	////// AUDIOVISUAL //////
	
	volHistory = []; // Stores volume values 
	backstep = 2; // Time backstep to draw circles (offset)
	circles = 10; // Circles to draw
	brighter = 12; // Brightness difference between circles
	multiplierA = windowWidth * 3; // Width multiplier for amplitude
	multiplierB = windowHeight * 3; // Height multiplier for amplitude
	
	redInit = random(110); // Initialize Unique Colours for each instance
	blueInit = random(110);
	greenInit = random(110);
	
    calibrateWindow();
	
	
	////// Sound //////
	
	// Initialize mic device 
	mic = new p5.AudioIn();
	mic.start(); // prompts user to enable browser mic
	// Setup sound recorder
	rec = new p5.SoundRecorder();
	rec.setInput(mic);
	// Destination for recorded material
	recSound = new p5.SoundFile();
	
	// Recording Time
	recStored = 0; // Flag to catch if a recording has been completed
	recTime = 0; // Counter for recording time
	recTimeMax = 5 * fr; // Recording Time Limit (10 * fr = 10s)
	
	////// Button Objects //////
	regButtons = [];
	
	// Mic Button
	micX = 54;
	micY = 50;
	micButton = new Button(micX,micY);
	micButton.myImage = img_mic_off;
	micButton.mode = 0;
	regButtons.push(micButton);
	
	// Play Buttons
	playSX = 442;
	playSY = 80;
	playX = playSX;
	playY = 260;
	playSButton = new Button(playSX,playSY); // Play Sample
	playSButton.myImage = img_play_sample_off;
	playSButton.mode = 1;
	regButtons.push(playSButton);
	playButton = new Button(playX,playY); // Play Board
	playButton.myImage = img_play_board_off;
	playButton.mode = 2;
	regButtons.push(playButton);
	
	// Sample Board Buttons
	sampleButtons = []; // INDEPENDENT of regular buttons
	sampleX = 54; // Top Left of Sample Board
	sampleY = 468;
	sampleOffsetX = img_board_on.width + 40; // Spacing between buttons
	sampleOffsetY = img_board_on.height + 40;
	sampleCols = 8; // No. columns of buttons
	sampleNum = 4 * sampleCols; // No. of sample buttons
	for (var i=0; i<sampleNum; i++) {
		var xPos = (i % sampleCols);
		var yPos = (i - xPos) / sampleCols;
		var aButton = new Button(sampleX + xPos * sampleOffsetX,sampleY + yPos * sampleOffsetY);
		aButton.myImage = img_board_off;
		aButton.mode = 3;
		sampleButtons.push(aButton);
	}
	
	// Toggle Button
	togX = 1340;
	togY = 230;
	togButton = new Button(togX,togY);
	togButton.mode = 4;
	regButtons.push(togButton);
	
	// Logo (dummy button)
	logoX = 1920/3;
	logoY = 86;
	logoButton = new Button(logoX,logoY);
	logoButton.myImage = img_logo;
	logoButton.mode = 5;
	regButtons.push(logoButton);
	
	cursor = -1; // Cursor position (for timeline playback)
	cursorSpeed = 0.125 * fr; // Frames until next beat
	cursorCounter = cursorSpeed; // Countdown to next cursor position
	toggleMode = 0; // 0 = Board Select | 1 = Mod Select
	modTarget = 0; // Button targeted for modification
	
	masterVol = 1;
	masterRate = 1;
	
	// Selector & Slider
	modeButton = createButton('Audio-Visual');
	modeButton.mousePressed(modeChange);
	
	selector = createSelect();
	selector.option('Volume');
	selector.option('Pitch');
		rateRange = 4;
	selector.option('Playback');
		cursorRange = 0.5 * fr;
	//selector.option('Dry-Wet');
	//selector.option('Reverb');
	selector.changed(selectorEvent);
	
	slider = createSlider(0,100,0,1);
	slider.changed(sliderEvent);
	selectorEvent(); // Prepare slider init value based on selector
	
	selectorUpdate(); // Update positions of selector / slider
	
	
}

function modeChange() { // Toggles between audiovisual mode and soundboard mode
	if (dispMode == 0) {
		dispMode = 1;
		selector.hide();
		slider.hide();
		modeButton.hide();
		modeSwitchDelay = modeSwitchStart;
	} else if (dispMode == 1 && modeSwitchDelay <= 0) {
		dispMode = 0;
		selector.show();
		slider.show();
		modeButton.show();
	}
}

function selectorUpdate() {
	selWidth = nf(windowWidth/6) + 'px';
	slideWidth = nf(windowWidth/3) + 'px';
	selHeight = nf(windowHeight/12) + 'px';
	selX = windowWidth / 3;
	butX = selX + windowWidth/6 + 4;
	selY = windowHeight/5;
	slideY = windowHeight/3.5;
	selector.style('width', selWidth);
	selector.style('height', selHeight);
	selector.style('border-radius', '2vw');
	selector.style('fontSize', '4vh');
	slider.style('width', slideWidth);
	slider.style('height', selHeight);
	slider.style('border', '5vw');
	slider.style('border-radius', '5vw');
	modeButton.style('width', selWidth);
	modeButton.style('height', selHeight);
	modeButton.style('border-radius', '2vw');
	modeButton.style('fontSize', '3vh');
	selector.position(selX,selY);
	slider.position(selX,slideY);
	modeButton.position(butX,selY);
}

function sliderEvent() { // Triggered on slider manipulation
	var value = (slider.value() / 100);
	var item = selector.value();
	// Initialize tweak if applicable
	print(modTarget);
	if (toggleMode == 1 && sampleButtons[modTarget].tweak == 0) {
		sampleButtons[modTarget].tweak = 1;
	}
	switch (item) {
		case 'Volume':
			if (toggleMode == 0) {
				masterVol = value;
				masterVolume(masterVol);
			} else if (toggleMode == 1) {
				sampleButtons[modTarget].volume = value;
			}
		break;
		case 'Pitch':
			if (toggleMode == 0) {
				masterRate = value * rateRange;
				recSound.rate(masterRate);
			} else if (toggleMode == 1) {
				sampleButtons[modTarget].pitch = value * rateRange;
			}
		break;
		case 'Playback':
			if (toggleMode == 0) {
				cursorSpeed = value * fr;
			} else if (toggleMode == 1) {
				sampleButtons[modTarget].playback = value * fr;
			}
		break;
	}
}

function selectorEvent() { // Triggered on selector manipulation
	var item = selector.value();
	slider.step = 1;
	switch (item) { // Set to current value (or tweaked value)
		case 'Volume':
			if (toggleMode == 1 && sampleButtons[modTarget].tweak == 1 && sampleButtons[modTarget].volume != -1) {
				slider.value(sampleButtons[modTarget].volume * 100);
			} else {
				slider.value(masterVolume() * 100);
			}
		break;
		case 'Pitch':
			if (toggleMode == 1 && sampleButtons[modTarget].tweak == 1 && sampleButtons[modTarget].pitch != -1) {
				slider.value(sampleButtons[modTarget].pitch * 100 / rateRange);
			} else {
				slider.value(recSound.rate() * 100 / rateRange); 
			}
		break;
		case 'Playback':
			if (toggleMode == 1 && sampleButtons[modTarget].tweak == 1 && sampleButtons[modTarget].playback != -1) {
				slider.value(sampleButtons[modTarget].playback * 100 / fr);
			} else {
				slider.value(cursorSpeed * 100 / fr);
			}
			slider.step = 12.5;
		break;
	}
}

function modifySelect(newValue) { // Changes selected modification
	sampleButtons[modTarget].modify = 0;
	modTarget = newValue;
	sampleButtons[modTarget].modify = 1;
}

function Button(xOrigin,yOrigin) { // Standard Button Object
	this.x = xOrigin; // Top Left of Button
	this.y = yOrigin;
	this.buttonState = 0;
	this.buttonPressed = 0;
	this.myImage = img_board_off;
	this.mode = 0; // Type of Button
	this.active = 0; // Whether the button is active (board)
	this.tweak = 0; // Whether the button has been tweaked 
	this.modify = 0; // Whether the button has been selected for modification
	this.volume = -1; 
	this.pitch = -1;
	this.playback = -1;
	
	// Updates button image
	this.update = function() {
		switch (this.mode) {
			case 0: // Mic
				if (this.buttonPressed == 0) {
					if (this.buttonState == 0) {
						this.myImage = img_mic_off;
					} else if (this.buttonState == 1) {
						this.myImage = img_mic_on;
					}
				} else {
					this.myImage = img_mic_press;
				}
			break;
			
			case 1: // Sample Playback
				if (this.buttonPressed == 0) {
					if (this.buttonState == 0) { // Off State
						this.myImage = img_play_sample_off;
					} else if (this.buttonState == 1) { // On State
						this.myImage = img_play_sample_on;
					}
				} else {
					this.myImage = img_play_sample_press;
				}
			break;
			
			case 2: // Board Playback 
				if (this.buttonPressed == 0) {
					if (this.buttonState == 0) { // Off State
						this.myImage = img_play_board_off;
					} else if (this.buttonState == 1) { // On State
						this.myImage = img_play_board_on;
					}
				} else {
					this.myImage = img_play_board_press;
				}
			break;
			
			case 3: // Board Button
				if (this.buttonPressed == 0) { // Button not pressed?
				
					if (this.buttonState == 0) { // Off State
						if (this.active) {this.myImage = img_board_off_act;} // Check active state
						else if (this.modify) {this.myImage = img_board_off_mod;}
						else if (this.tweak) {this.myImage = img_board_off_twk;}
						else {this.myImage = img_board_off;}
						
					} else if (this.buttonState == 1) { // On State
						if (this.active) {this.myImage = img_board_on_act;} // Check active state
						else if (this.modify) {this.myImage = img_board_on_mod;}
						else if (this.tweak) {this.myImage = img_board_on_twk;}
						else {this.myImage = img_board_on;}
					}
				} else { // Button Pressed
					if (this.active) {this.myImage = img_board_press_act;} // Check active state
					else if (this.modify) {this.myImage = img_board_press_mod;}
					else if (this.tweak) {this.myImage = img_board_press_twk;}
					else {this.myImage = img_board_press;}
				}
			break;
			
			case 4: // Toggle Switch
				if (this.buttonState == 0) {
					this.myImage = img_tog_1; // Board Selector
				} else {
					this.myImage = img_tog_2; // Modifier Selector
				}
			break;
			
			case 5: // Logo (RESERVED)
			break;
			
			default:
			break;
		}
	}
	
	this.clicked = function() {
		buttonPressed = 1;
	}
	
	// Displays button
	this.display = function() {
		this.update();
		var xPos = (this.x / nativeX) * windowWidth;
		var yPos = (this.y / nativeY) * windowHeight;
		var xScale = (windowWidth / nativeX) * this.myImage.width;
		var yScale = (windowHeight / nativeY) * this.myImage.height;
		image(this.myImage,xPos,yPos,xScale,yScale);
	}
}

function draw() { // Occurs each frame
	
	//////+ GRAPHICS +//////
	{
		// Sample Board Mode
		if (modeSwitchDelay >=0) { // Delay before allowing mode change from audiovisual
			modeSwitchDelay--;
		}
		if (dispMode == 0) {
			background(250);
			// Display Buttons
			for (var i=0; i<regButtons.length;i++) {
				regButtons[i].display();
			}
			for (var i=0; i<sampleNum; i++) {
				sampleButtons[i].display();
			}
		
		// Audiovisual Mode (Amreen)
		} else {
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
	}
	//////+ BUTTONS +////// 
	{		
		////// Recording Button //////
		{
			// Ignore button if press occurs during invalid time
			if (micButton.buttonPressed && (playSButton.buttonState != 0 || playButton.buttonState !=0)) {
				micButton.buttonPressed = 0;
			}
			// Enable Recording
			if (micButton.buttonState === 0 && mic.enabled && micButton.buttonPressed) {
				// Recording
				rec.record(recSound);
				micButton.buttonState++; // standby for stop
				micButton.buttonPressed = 0; // Clear press
				recStored =1;
				
			// Recording State
			} else if (micButton.buttonState === 1) {
				recTime++
				
				// Stop recording? (button pressed or time up)
				if (micButton.buttonPressed || recTime >= recTimeMax) {
					rec.stop();
					micButton.buttonState = 0; // Return to standby
					micButton.buttonPressed = 0; // Clear press
					recTime = 0; // Clear recording time counter
				}
			}
		}
		////// "Play Sample" Button //////
		{
			// Ignore button if press occurs during invalid time
			if (playSButton.buttonPressed && (playButton.buttonState != 0 || micButton.buttonState != 0 || !recStored)) {
				playSButton.buttonPressed = 0;
			}
			// Start Playback of Sample 
			if (playSButton.buttonState === 0 && playSButton.buttonPressed) {
				// Play 
				
				if (toggleMode == 1) { // Play board value
					playBoard(modTarget);
				} else if (toggleMode == 0) {
					recSound.play();
				}
			
				playSButton.buttonState = 1;
				playSButton.buttonPressed = 0;
				
			// Stop Playback of Sample / Reset playSButton.buttonState when sound is finished playing
			} else if (playSButton.buttonState === 1 && !recSound.isPlaying()) {
				recSound.stop();
				playSButton.buttonState = 0;
				playSButton.buttonPressed = 0;
			}
		}
		////// "Play Board" Button //////
		{
			// Ignore button if press occurs during invalid time
			if (playButton.buttonPressed && (playSButton.buttonState != 0 || micButton.buttonState != 0 || !recStored)) {
				playButton.buttonPressed = 0;
			}
			// Start Playback on Board
			if (playButton.buttonState === 0 && playButton.buttonPressed) {
				// Activate playback cursor
				cursorCounter = cursorSpeed;
				cursor = 0;
				sampleButtons[cursor].active = 1;
				playButton.buttonState = 1;
				playButton.buttonPressed = 0;
				
			// Stop Playback of Sample / Reset playSButton.buttonState when sound is finished playing
			} else if (playButton.buttonState === 1 && playButton.buttonPressed) {
				sampleButtons[cursor].active = 0;
				cursor = -1;
				playButton.buttonState = 0;
				playButton.buttonPressed = 0;
			}
		}
		////// Toggle Button //////
		{
			// Flip
			if (togButton.buttonPressed) {
				if (togButton.buttonState == 0) {
					togButton.buttonState = 1;
					// Activate modification targeting
					toggleMode = 1;
					sampleButtons[modTarget].modify = 1;
					selectorEvent();
				} else {
					togButton.buttonState = 0;
					// Clear modification targeting
					toggleMode = 0;
					sampleButtons[modTarget].modify = 0;
					selectorEvent();
				}
				togButton.buttonPressed = 0;
			}
		}
		////// Sample Board Buttons //////
		{
		for (var i=0;i<sampleNum;i++) {
			if (sampleButtons[i].buttonPressed) {
				if (sampleButtons[i].buttonState == 0) {sampleButtons[i].buttonState = 1;}
				else {sampleButtons[i].buttonState = 0;}
				sampleButtons[i].buttonPressed = 0;
			}
		}
		}
	}
	
	//////+ FUNCTION +//////
	{
		// Sample Board Cursor Counter
		if (cursor >= 0) {
			cursorCounter -= 1;
			
			if (cursorCounter <=0) { // Counter has expired
				sampleButtons[cursor].active = 0;
				cursor ++;
				if (cursor >= sampleNum) { // Loop cursor position
					cursor = 0;
				}
				sampleButtons[cursor].active = 1; // New Active button
				
				print("Cursor: " + nf(cursor));
				print("Cursor: " + nf(sampleButtons[cursor].pitch));
				// Play Sound 
				if (sampleButtons[cursor].buttonState == 1) {
					playBoard(cursor);
				}
				
				if (sampleButtons[cursor].playback != -1) { // Check for playback tweak
					cursorCounter = sampleButtons[cursor].playback; // Custom playback speed
				} else {
					cursorCounter = cursorSpeed;
				}
			}
			
		}
		
	}
}

function playBoard(button) { // Plays the sound associated with this board button

	if (sampleButtons[button].volume != -1) { // Apply Custom Values
		masterVolume(sampleButtons[button].volume);
	}
	if (sampleButtons[button].pitch != -1) {
		recSound.rate(sampleButtons[button].pitch);
	}
	
	recSound.play();
	
	masterVolume(masterVol);
	recSound.rate(masterRate);
}

function touchStarted() { // Triggered when mouse button is pressed / touch
	
	// Std Buttons
	for (var i=0;i<regButtons.length;i++) {
		var xPos =(regButtons[i].x / nativeX) * windowWidth;
		var yPos =(regButtons[i].y / nativeY) * windowHeight;
		var xScale = (windowWidth / nativeX) * regButtons[i].myImage.width;
		var yScale = (windowHeight / nativeY) * regButtons[i].myImage.height;
		var xCheck = (xPos < mouseX) && ((xPos + xScale) > mouseX);
		var yCheck = (yPos < mouseY) && ((yPos + yScale) > mouseY);
		if (xCheck && yCheck) {
			regButtons[i].buttonPressed = 1;
		}
	}
	
	// Sample Board Buttons
	for (var i=0;i<sampleNum;i++) {
		var xPos = (sampleButtons[i].x / nativeX) * windowWidth;
		var yPos = (sampleButtons[i].y / nativeY) * windowHeight;
		var xScale = (windowWidth / nativeX) * sampleButtons[i].myImage.width;
		var yScale = (windowHeight / nativeY) * sampleButtons[i].myImage.height;
		var xCheck = (xPos < mouseX) && ((xPos + xScale) > mouseX);
		var yCheck = (yPos < mouseY) && ((yPos + yScale) > mouseY);
		if (xCheck && yCheck) {
			if (toggleMode == 0) { // Board Mode
				sampleButtons[i].buttonPressed = 1;
			} else if (toggleMode == 1) { // Modifier Mode
				modifySelect(i);
				selectorEvent();
				print(i);
			}
		}
	}
	
	//return false;
}

function mousePressed() {
	// Enable Full Screen automatically
	var fs = fullscreen();
	if (!fs) {fullscreen(1);}
	
	if (dispMode == 1) {
		if (modeSwitchDelay <= 0) {
			modeChange();
		}
	}
}

function windowResized() { // Triggered when window is resized
	resizeCanvas(windowWidth,windowHeight);
	calibrateWindow();
	selectorUpdate();
}

function calibrateWindow() { // Calibrates visualizer
    shapePositionX = windowWidth/2;
    shapePositionY = windowHeight/2;
    shapeWidth = windowWidth/5;
}
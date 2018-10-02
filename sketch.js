/* OctoSwish Plus - A graphical audio sampler
See README for details
*/

function preload() { // Preload graphical assets
	img_board_on = loadImage('images/boardIn.png');
	img_board_off = loadImage('images/boardOut.png');
	img_board_press = loadImage('images/boardOut.png');
	img_board_on_act = loadImage('images/boardInA.png');
	img_board_off_act = loadImage('images/boardOutA.png');
	img_board_press_act = loadImage('images/boardOutA.png');
	img_cursor = loadImage('images/cursor.png');
	img_mic_on = loadImage('images/micOn.png');
	img_mic_off = loadImage('images/micOff.png');
	img_mic_press = loadImage('images/micPress.png');
	img_play_board_on = loadImage('images/playOn.png');
	img_play_board_off = loadImage('images/playOff.png');
	img_play_board_press = loadImage('images/playPress.png');
	img_play_sample_on = loadImage('images/playSOn.png');
	img_play_sample_off = loadImage('images/playSOff.png');
	img_play_sample_press = loadImage('images/playSPress.png');
	
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
	displayMode = 0; // 0 - Board || 1 - Graphics
	
	// Used when determining drawing perspective
	nativeX = 1920; // Mockup proportions
	nativeY = 1080;
	
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
	
	////// Initialize Button objects //////
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
	playSY = 70;
	playX = playSX;
	playY = 232;
	playSButton = new Button(playSX,playSY); // Play Sample
	playSButton.myImage = img_play_sample_off;
	playSButton.mode = 1;
	regButtons.push(playSButton);
	playButton = new Button(playX,playY); // Play Board
	playButton.myImage = img_play_board_off;
	playButton.mode = 2;
	regButtons.push(playButton);
	
	// Sample Board Buttons
	sampleButtons = [];
	sampleX = 54; // Top Left of Sample Board
	sampleY = 460;
	sampleOffsetX = img_board_on.width + 40; // Spacing between buttons
	sampleOffsetY = img_board_on.height + 40;
	sampleCols = 8; // No. columns of buttons
	sampleNum = 4 * sampleCols; // No. of sample buttons
	for (var i=0; i<sampleNum; i++) {
		var xPos = (i % sampleCols);
		var yPos = (i - xPos) / sampleCols;
		print(yPos);
		var aButton = new Button(sampleX + xPos * sampleOffsetX,sampleY + yPos * sampleOffsetY);
		aButton.myImage = img_board_off;
		aButton.mode = 3;
		sampleButtons.push(aButton);
	}
	
	cursor = -1; // Cursor position (for timeline playback)
	cursorSpeed = 0.125 * fr; // Frames until next beat
	cursorCounter = cursorSpeed; // Countdown to next cursor position
	
	// Selector
	selWidth = '180px';
	selector = createSelect();
	selector.position(10,10);
	selector.option('Volume');
	selector.option('Dry-Wet');
	selector.option('Reverb');
	selector.changed(selectorEvent);
	selector.style('width', selWidth);
	
	// Slider
		// STUB: proportionals
	slider = createSlider(0,100,0,1);
	slider.position(10,40);
	slider.style('width', selWidth);
	slider.changed(sliderEvent);
	selectorEvent(); // Prepare slider init value based on selector
	
}

function numToTime(num) { // Converts an int to a time string
	
	// STUB: Incomplete
	timeReadout = nf(num);
	if (timeReadout.length == 1) {
		timeReadout = "0" + timeReadout;
	}
	return timeReadout;
}

function sliderEvent() { // Triggered on slider manipulation
	var value = (slider.value() / 100);
	var item = selector.value();
	switch (item) {
		case 'Volume':
			masterVolume(value);
		break;
		case 'Dry-Wet':
			recSound.drywet(value);
		break;
		case 'Reverb':
		break;
		
	}
}

function selectorEvent() { // Triggered on selector manipulation
	var item = selector.value();
	switch (item) { // Set to current value
		case 'Volume':
			slider.value(masterVolume() * 100);
		break;
		case 'Dry-Wet':
			slider.value(recSound.drywet() * 100);
		break;
		case 'Reverb':
		break;
		
	}
	// STUB: Modify slider values / target
}

function Button(xOrigin,yOrigin) { // Standard Button Object
	this.x = xOrigin; // Top Left of Button
	this.y = yOrigin;
	this.buttonState = 0;
	this.buttonPressed = 0;
	this.myImage = img_board_off;
	this.mode = 0; // Type of Button
	this.active = 0; // Whether the button is active (board)
	
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
						else {this.myImage = img_board_off;}
						
					} else if (this.buttonState == 1) { // On State
						if (this.active) {this.myImage = img_board_on_act;} // Check active state
						else {this.myImage = img_board_on;}
					}
				} else { // Button Pressed
					if (this.active) {this.myImage = img_board_press_act;} // Check active state
					else {this.myImage = img_board_press;}
				}
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
		if (displayMode == 0) {
			background(25);
			// Display Buttons
			for (var i=0; i<regButtons.length;i++) {
				regButtons[i].display();
			}
			for (var i=0; i<sampleNum; i++) {
				sampleButtons[i].display();
			}
		
		// Audiovisual Mode
		} else {
			// STUB
		}
	}
	//////+ BUTTONS +////// 
	{	
		// STUB: need to display recording time
		// STUB: when implementing sequencer playback, need to be careful
			//	to avoid interference
	
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
				recSound.play();
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
		////// Sample Board Buttons //////
		
		for (var i=0;i<sampleNum;i++) {
			if (sampleButtons[i].buttonPressed) {
				if (sampleButtons[i].buttonState == 0) {sampleButtons[i].buttonState = 1;}
				else {sampleButtons[i].buttonState = 0;}
				sampleButtons[i].buttonPressed = 0;
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
				cursor++;
				cursorCounter = cursorSpeed;
				if (cursor >= sampleNum) { // Loop cursor position
					cursor = 0;
				}
				sampleButtons[cursor].active = 1;
				
				// Play Sound 
				if (sampleButtons[cursor].buttonState == 1) {
					recSound.play();
				}
			}
			
		}
		
	}
}

function touchStarted() { // Triggered when mouse button is pressed / touch
	
	// Mic Button
	// STUB: Probably should make the mic icon colour stay consistent
	for (var i=0;i<regButtons.length;i++) {
		var xScale = (windowWidth / nativeX) * regButtons[i].myImage.width;
		var yScale = (windowHeight / nativeY) * regButtons[i].myImage.height;
		var xCheck = (regButtons[i].x < mouseX) && (regButtons[i].x + xScale > mouseX);
		var yCheck = (regButtons[i].y < mouseY) && (regButtons[i].y + yScale > mouseY);
		if (xCheck && yCheck) {
			regButtons[i].buttonPressed = 1;
		}
	}
	
	// Sample Board Buttons
	for (var i=0;i<sampleNum;i++) {
		var xScale = (windowWidth / nativeX) * sampleButtons[i].myImage.width;
		var yScale = (windowHeight / nativeY) * sampleButtons[i].myImage.height;
		var xCheck = (sampleButtons[i].x < mouseX) && (sampleButtons[i].x + xScale > mouseX);
		var yCheck = (sampleButtons[i].y < mouseY) && (sampleButtons[i].y + yScale > mouseY);
		if (xCheck && yCheck) {
			sampleButtons[i].buttonPressed = 1;
		}
	}
	
	// Enable Full Screen automatically
	var fs = fullscreen();
	if (!fs) {fullscreen(1);}
	
	return false;
}

function windowResized() { // Triggered when window is resized
	resizeCanvas(windowWidth,windowHeight);
}
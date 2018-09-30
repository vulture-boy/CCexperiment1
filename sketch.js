function preload() {
	// Preload graphical assets
	img_board_on = loadImage('/images/button_gfx/board/board_in.png');
	img_board_off = loadImage('/images/button_gfx/board/board_out.png');
	img_board_on_act = loadImage('/images/button_gfx/board/board_inA.png');
	img_board_off_act = loadImage('/images/button_gfx/board/board_outA.png');
	img_mic_on = loadImage('/images/button_gfx/mic/mic_on.png');
	img_mic_off = loadImage('/images/button_gfx/mic/mic_off.png');
	img_mic_press = loadImage('/images/button_gfx/mic/mic_press.png');
	img_play_board_on = loadImage('/images/button_gfx/play/play_on.png');
	img_play_board_off = loadImage('/images/button_gfx/play/play_off.png');
	img_play_board_press = loadImage('/images/button_gfx/play/play_press.png');
	img_play_sample_on = loadImage('/images/button_gfx/play/playS_on.png');
	img_play_sample_off = loadImage('/images/button_gfx/play/playS_off.png');
	img_play_sample_press = loadImage('/images/button_gfx/play/playS_press.png');
	
}

function setup() {
	// Setup the Canvas based on the window dimensions
	var canv = createCanvas(windowWidth, windowHeight);
	canv.position(0,0);
	fr = 30; // Frames per second 
	frameRate(fr); 
	getAudioContext().resume(); // Overrides sound setting
	
	// Indicates display mode
	displayMode = 0; // 0 - Board || 1 - Graphics
	
	// Initialize mic device 
	mic = new p5.AudioIn();
	mic.start(); // prompts user to enable browser mic
	// Setup sound recorder
	rec = new p5.SoundRecorder();
	rec.setInput(mic);
	// Destination for recorded material
	recSound = new p5.SoundFile();
	// State Machine: status of recording / play button

	playState = 0;
	playPressed = 0; // Whether the play button was pushed
	recTime = 0; // Counter for recording time
	recTimeMax = 10 * fr; // Recording Time Limit (10 * fr = 10s)
	
	// Used when determining drawing perspective
	windowDims();
	
	// Button objects
	micX = 0.1;
	micY = 0.1;
	micSize = 0.1;
	micButton = new MicButton(0,0,0);
	micButton.x = micX * windowMax;
	micButton.y = micY * windowMin;
	micButton.proport = micSize * windowMax
	micButton.recImage = img_mic_off;
	
	// Play Buttons
	
	// Sample Board Buttons
	sampleButtons = [];
	// Create many buttons
	sampleX = 0.1; // Top Left of Sample Board
	sampleY = 0.4;
	sampleSize = 0.1; // Scaling Size
	sampleOffsetX = 0.1; // Spacing between buttons
	sampleOffsetY = 0.01;
	sampleNum = 8*4; // No. of sample buttons
	sampleCols = 8; // No. columns of buttons
	for (var i=0; i<sampleNum; i++) {
		var xPos = (i % sampleCols);
		var yPos = i - xPos;
		var aButton = new SampButton(0,0, xPos, yPos, sampleSize);
		sampleButtons.push(aButton);
	}
	
	// Setup relative button positions
	calibrateButtons()
	
}

// Button Object (for Sample Board)
function SampButton(xOrigin, yOrigin, xPos, yPos, proport) {
	this.xRel = xPos; // Relative position in Array
	this.yRel = yPos;
	this.x = xOrigin; // Position of this button
	this.y = yOrigin;
	this.proport = proport; // Scale Size
	this.sampImage = img_board_off;
	
	this.update = function() {
		
	}
	
	this.clicked = function() {
		
	}
	
	this.display = function() {
		this.update();
		image(this.sampImage,this.x,this.y,this.proport,this.proport);
	}
}

// Button Object (for Microphone)
function MicButton(xOrigin,yOrigin,proport) {
	this.x = xOrigin; // Top Left of Button
	this.y = yOrigin;
	this.proport = proport; // Scale Size
	this.buttonState = 0;
	this.buttonPressed = 0;
	this.recImage = img_mic_off;
	
	// Updates button image
	this.update = function() {
		if (this.buttonPressed == 0) {
			if (this.buttonState == 0) {
				this.recImage = img_mic_off;
			} else if (this.buttonState == 1) {
				this.recImage = img_mic_on;
			}
		} else {
			this.recImage = img_mic_press;
		}
	}
	
	this.clicked = function() {
		buttonPressed = 1;
	}
	
	// Displays button
	this.display = function() {
		this.update();
		image(this.recImage,this.x,this.y,this.proport,this.proport);
	}
	
}

function draw() {
	
	//////+ GRAPHICS +//////
		// STUB: Probably will need to make modes high-level brackets.
	
	// Sample Board Mode
	if (displayMode == 0) {
		background(25);
		// Display Buttons
		micButton.display();
		for (var i=0; i<sampleNum; i++) {
			sampleButtons[i].display();
		}
	
	// Audiovisual Mode
	} else {
		
	}
	
	//////+ BUTTONS +//////
		// STUB: need to display recording time
		// STUB: needs visible buttons to trigger Pressed flags
		// STUB: when implementing sequencer playback, need to be careful
			//	to avoid interference
		// STUB: Graphical Representations.
	
	////// Recording Button //////
	
	// Enable Recording
	if (micButton.buttonState === 0 && mic.enabled && micButton.buttonPressed) {
		// Recording
		rec.record(recSound);
		micButton.buttonState++; // standby for stop
		micButton.buttonPressed = 0; // Clear press
		
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
	
	////// "Play Sample" Button //////
	
	// Start Playback of Sample
	if (playState === 0 && micButton.buttonState === 0 && playPressed) {
		// Stop the sound first if playing
		if (recSound.isPlaying()) {recSound.stop();}
		// Play 
		recSound.play();
		playState++;
		playPressed = 0;
	// Stop Playback of Sample
	} else if (playState === 1 && playPressed) {
		if (recSound.isPlaying()) {recSound.stop();}
		playState = 0;
		playPressed = 0;
	}
	// Reset playState when sound is finished playing
	if (recSound.isPlaying() == false && playState === 1) {
		playState = 0;
	}
	
	// Sliders
		// Volume
		// Delay
		// Filter
		// Reverb
		// EQ?
		// Fade? 
		// Graphical Representation
		// BPM
		// Associated manipulation of sound (non-destructive)
		
	// Sample Matrix
		// Play Matrix Button
		// Array of sequence buttons
		// Array for representation
		// Counter to move through playing items in array
		// BPM to Counter Value conversion (& display)
		// 
		
	// GUI 
		// Mockup of layout (photoshop/illustrator/etc)
		// Graphical Overhaul & Elements
		// Adaptive positions / sizing
		
	// Sound Visualization (FEATURE)
	// Tilting Control (FEATURE)
		
}

function windowResized() {
	resizeCanvas(windowWidth,windowHeight);
	windowDims();
	calibrateButtons();
}

function windowDims() {
	windowMax = max(windowWidth,windowHeight);
	windowMin = min(windowWidth,windowHeight);
	windowOrient = (windowWidth > windowHeight);
}

// Refreshes Button Size & Position
function calibrateButtons() {
	// Mic Button
	micButton.x = micX * windowMax;
	micButton.y = micY * windowMin;
	micButton.proport = micSize * windowMax;
	
	// Sampler Buttons
	for (var i=0; i<sampleNum; i++) {
		sampleButtons[i].x = sampleX * windowMax + sampleButtons[i].xRel * sampleOffsetX * windowMax;
		sampleButtons[i].y = sampleY * windowMin + sampleButtons[i].yRel * sampleOffsetY * windowMin;
		sampleButtons[i].proport = sampleSize * windowMax
	}
}


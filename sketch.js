function preload() {
	// Preload graphical assets
	img_board_on = loadImage('images/buttons/board/board_in.png');
	img_board_off = loadImage('images/buttons/board/board_out.png');
	img_board_on_act = loadImage('images/buttons/board/board_inA.png');
	img_board_off_act = loadImage('images/buttons/board/board_outA.png');
	img_mic_on = loadImage('images/buttons/mic/mic_on.png');
	img_mic_off = loadImage('images/buttons/mic/mic_off.png');
	img_mic_press = loadImage('images/buttons/mic/mic_press.png');
	img_play_board_on = loadImage('images/buttons/play/play_on.png');
	img_play_board_off = loadImage('images/buttons/play/play_off.png');
	img_play_board_press = loadImage('images/buttons/play/play_press.png');
	img_play_sample_on = loadImage('images/buttons/play/playS_on.png');
	img_play_sample_off = loadImage('images/buttons/play/playS_off.png');
	img_play_sample_press = loadImage('images/buttons/play/playS_press.png');
	
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
}

// Button Object (for Microphone)
function MicButton(xOrigin,yOrigin,proport) {
	this.x = xOrigin;
	this.y = yOrigin;
	this.proport = proport;
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
	print(micButton.proport);
}

function windowDims() {
	windowMax = max(windowWidth,windowHeight);
	windowMin = min(windowWidth,windowHeight);
	windowOrient = (windowWidth > windowHeight);
}

// Refreshes Button Size & Position
function calibrateButtons() {
	micButton.x = micX * windowMax;
	micButton.y = micY * windowMin;
	micButton.proport = micSize * windowMax;
}


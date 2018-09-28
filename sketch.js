function setup() {
	// Setup the Canvas based on the window dimensions
	createCanvas(windowWidth, windowHeight);
	fr = 30; // Frames per second 
	frameRate(fr); 
	getAudioContext().resume(); // Overrides sound setting
	
	// Initialize mic device 
	mic = new p5.AudioIn();
	mic.start(); // prompts user to enable browser mic
	// Setup sound recorder
	rec = new p5.SoundRecorder();
	rec.setInput(mic);
	// Destination for recorded material
	recSound = new p5.SoundFile();
	// State Machine: status of recording / play button
	recState = 0; 
	recPressed = 0; // Whether the rec button was pushed
	playState = 0;
	playPressed = 0; // Whether the play button was pushed
	recTime = 0; // Counter for recording time
	recTimeMax = 10 * fr; // Recording Time Limit (10 * fr = 10s)
}

function draw() {
	
	//////+ BUTTONS +//////
		// STUB: need to display recording time
		// STUB: needs visible buttons to trigger Pressed flags
		// STUB: when implementing sequencer playback, need to be careful
			//	to avoid interference
		// STUB: Graphical Representations.
	
	////// Recording Button //////
	
	// Enable Recording
	if (recState === 0 && mic.enabled && recPressed) {
		// Recording
		rec.record(recSound);
		recState++; // standby for stop
		recPressed = 0; // Clear press
		
	// Recording State
	} else if (recState === 1) {
		recTime++
		
		// Stop recording? (button pressed or time up)
		if (recPressed || recTime >= recTimeMax) {
			rec.stop();
			recState = 0; // Return to standby
			recPressed = 0; // Clear press
			recTime = 0; // Clear recording time counter
		}
	}
	
	////// "Play Sample" Button //////
	
	// Start Playback of Sample
	if (playState === 0 && recState === 0 && playPressed) {
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
		
	// GUI (last job)
		// Mockup of layout (photoshop/illustrator/etc)
		// Graphical Overhaul & Elements
		// Adaptive positions / sizing
		
}

function windowResized() {
	canvasWidth = windowWidth;
	canvasHeight = windowHeight;
}
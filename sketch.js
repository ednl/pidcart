// Physical parameters
const Mc = 5;        // cart mass [kg]
const Mp = 1;        // pendulum mass [kg]
const L  = 1;        // pendulum length [m]
const G  = 9.81;     // gravitational constant [m/s^2]

// Simulation variables (initial state)
let cartx = 0;       // cart position [m]
let cartv = 0;       // cart velocity [m/s]
let theta = 10 * Math.PI / 180;  // pendulum angle (0 = up) [rad]
let omega = 0;       // pendulum angular velocity [rad/s]

// Simulation parameters
const DT = 0.001;    // time per integration step [s]
const FR = 25;       // animation framerate [Hz]
const LOOP = Math.max(1, Math.round(1 / (FR * DT)));  // number of integration steps per frame

// Controller parameters
const SP =   0;      // theta set point (0 = pendulum up)
let   Kp = 200;
let   Ki =  10 * DT;
let   Kd =   5 / DT;

// Visualisation parameters
const DIMX  = 1200;  // canvas width
const DIMY  =  600;  // canvas height
const SCALE =  200;  // pixels per metre
const CARTW =   60;  // cart width in pixels
const CARTH =   20;  // cart height in pixels
const PENDR =   10;  // pendulum radius in pixels

// Visualisation variables
let minx = cartx;
let maxx = cartx;

// Convenience / derivative values
const HALFX = DIMX * 0.5;
const HALFY = DIMY * 0.5;
const WHEELB = (CARTW - CARTH) * 0.5;
const WHEELR = CARTH * 0.5;
const C1 = Mp / (Mp + Mc);
const C2 = C1 * G;
const C3 = C1 / Mp;
const C4 = G / L;
const C5 = C3 / L;
const LP = L * SCALE;

// Controller variables
let U = 0;           // external control force on cart in î direction
let err_cur = 0;     // error = set point - process value = negative deviation from target
let err_prv = 0;     // previous error
let err_sum = 0;     // cumulative error
let err_dif = 0;     // change in error
let isDown = false;  // is the pendulum in the bootom half?

// Interface variables
let slideTheta, slideProp, slideInt, slideDif;

function showVal() {
	document.getElementById("valTheta").innerHTML = round(theta * 18000 / PI) / 100 + '&deg;';
	document.getElementById("valProp").innerHTML = round(slideProp.value() * 100) / 100;
	document.getElementById("valInt").innerHTML = round(slideInt.value() * 100) / 100;
	document.getElementById("valDif").innerHTML = round(slideDif.value() * 100) / 100;
}

function reset() {
	cartv = 0;
	cartx = 0;
	omega = 0;
	theta = HALF_PI - (slideTheta.value() * PI / 180);
	Kp = slideProp.value();
	Ki = slideInt.value() * DT;
	Kd = slideDif.value() / DT;
	minx = 0;
	maxx = 0;
	err_prv = 0;
	err_sum = 0;
	isDown = false;
	showVal();
}

function setup() {
	frameRate(FR);
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	rectMode(CENTER);
	ellipseMode(RADIUS);

	slideTheta = createSlider(0, 180, (HALF_PI - theta) * 180 / PI, 1);
	slideProp = createSlider(0, 2000, Kp, 2);
	slideInt = createSlider(0, 1000, Ki / DT, 1);
	slideDif = createSlider(0, 1000, Kd * DT, 1);

	slideTheta.parent('cntTheta');
	slideProp.parent('cntProp');
	slideInt.parent('cntInt');
	slideDif.parent('cntDif');

	slideTheta.style('width', '1001px');
	slideProp.style('width', '1001px');
	slideInt.style('width', '1001px');
	slideDif.style('width', '1001px');

	slideTheta.changed(reset);
	slideProp.changed(reset);
	slideInt.changed(reset);
	slideDif.changed(reset);

	showVal();
}

function draw() {
	let cost, sint;
	for (let dummy = 0; dummy < LOOP; ++dummy) {
		// Controller on theta
		err_cur = SP - theta;
		if (Math.abs(err_cur) < HALF_PI) {
			if (isDown) {
				isDown = false;
				err_sum = 0;
				err_prv = 0;
			}
			err_sum += err_cur;
			err_dif = err_cur - err_prv;
			err_prv = err_cur;  // save for next loop
			U = Kp * err_cur + Ki * err_sum + Kd * err_dif;
			// if ((theta < 0 && omega < 0 && cartx < 0) || (theta > 0 && omega > 0 && cartx > 0)) {
			// 	U -= 0.01 * cartx;
			// }
		} else {
			isDown = true;
			U = 0;  // TODO
		}

		// Determine accelerations
		cost = cos(theta);
		sint = sin(theta);
		const det = 1 - C1 * cost * cost;
		const W2 = C1 * omega * omega * sint;
		const carta = (C2 * sint * cost - L * W2 + C3 * U) / det;
		const penda = (C4 * sint - W2 * cost + C5 * U * cost) / det;

		// Euler integration
		cartv += carta * DT;
		cartx += cartv * DT;
		omega += penda * DT;
		theta += omega * DT;

		// Range check
		if (cartx < minx) {
			minx = cartx;
		}
		if (cartx > maxx) {
			maxx = cartx;
		}
		if (theta > PI) {
			theta -= TWO_PI;
		}
		if (theta <= -PI) {
			theta += TWO_PI;
		}
	}

	// Define grid
	translate(HALFX, HALFY);    // origin at the centre
	scale(1, -1);               // positive y goes up, keep pixel scaling
	background(0);              // clear screen
	line(-HALFX, 0, HALFX, 0);  // ground
	line(0, 0, 0, -PENDR);      // origin marker
	line(minx * SCALE - CARTW * 0.5, WHEELR, minx * SCALE - CARTW * 0.5, WHEELR + CARTH); // range marker
	line(maxx * SCALE + CARTW * 0.5, WHEELR, maxx * SCALE + CARTW * 0.5, WHEELR + CARTH); // range marker

	// Draw cart and pendulum from cart position
	push();
	translate(cartx * SCALE, CARTH);  // also compensate for cart height
	rect(0, 0, CARTW, CARTH);
	arc(-WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	arc( WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	const px = -sint * LP;  // cos(a+pi/2) = -sin(a)
	const py =  cost * LP;  // sin(a+pi/2) =  cos(a)
	line(0, 0, px, py);
	circle(px, py, PENDR);
	pop();
}

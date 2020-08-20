// Physical parameters
let   Mc  = 2;        // cart mass [kg]
let   Mp  = 1;        // pendulum mass [kg]
let   L   = 1;        // pendulum length [m]
const G   = 9.81;     // gravitational constant [m/s^2]
const CRR = 0.001;    // coefficient of rolling resistance
const CD  = 1;        // aerodynamic drag coefficient

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
let CARTH = Math.pow(Mc / 1000, 1 / 3) * SCALE;  // cart height in pixels
let CARTW = CARTH * 3;  // cart width in pixels
let PENDR = Math.pow(Mp / 1000, 1 / 3) * SCALE;  // pendulum radius in pixels

// Visualisation variables
let minth = theta * 180 / Math.PI;
let maxth = minth;
let minx = cartx;
let maxx = minx;
let minU = 0;
let maxU = 0;

// Convenience / derivative values
const HALFX = DIMX * 0.5;
const HALFY = DIMY * 0.5;
let   WHEELB = (CARTW - CARTH) * 0.5;
let   WHEELR = CARTH * 0.5;
let   C1 = Mp / (Mp + Mc);
let   C2 = C1 * G;
let   C3 = C1 / Mp;
let   C4 = C3 / L;
let   C5 = G / L;
let   LP = L * SCALE;

// Controller variables
let U = 0;           // external control force on cart in î direction
let err_cur = 0;     // error = set point - process value = negative deviation from target
let err_prv = 0;     // previous error
let err_sum = 0;     // cumulative error
let err_dif = 0;     // change in error
let isDown = false;  // is the pendulum in the bootom half?

// Interface variables
let slideTheta, slideProp, slideInt, slideDif, slideLen, slideMc, slideMp;

function showVal() {
	document.getElementById("minth").innerHTML = minth;
	document.getElementById("maxth").innerHTML = maxth;
	document.getElementById("minx").innerHTML = minx;
	document.getElementById("maxx").innerHTML = maxx;
	document.getElementById("minU").innerHTML = minU;
	document.getElementById("maxU").innerHTML = maxU;
	document.getElementById("valTheta").innerHTML = round(theta * 18000 / PI) / 100;
	document.getElementById("valProp").innerHTML = round(slideProp.value() * 100) / 100;
	document.getElementById("valInt").innerHTML = round(slideInt.value() * 100) / 100;
	document.getElementById("valDif").innerHTML = round(slideDif.value() * 100) / 100;
	document.getElementById("valLen").innerHTML = round(slideLen.value() * 100) / 100;
	document.getElementById("valMc").innerHTML = round(slideMc.value() * 100) / 100;
	document.getElementById("valMp").innerHTML = round(slideMp.value() * 100) / 100;
}

function reset() {
	theta = HALF_PI - (slideTheta.value() * PI / 180);
	Kp = slideProp.value();
	Ki = slideInt.value() * DT;
	Kd = slideDif.value() / DT;
	L = slideLen.value() / 100;
	Mc = slideMc.value();
	Mp = slideMp.value();

	CARTH = Math.pow(Mc / 1000, 1 / 3) * SCALE;  // cart height in pixels
	CARTW = CARTH * 3;  // cart width in pixels
	PENDR = Math.pow(Mp / 1000, 1 / 3) * SCALE;  // pendulum radius in pixels
	WHEELB = (CARTW - CARTH) * 0.5;
	WHEELR = CARTH * 0.5;
	C1 = Mp / (Mp + Mc);
	C2 = C1 * G;
	C3 = C1 / Mp;
	C4 = C3 / L;
	C5 = G / L;
	LP = L * SCALE;

	cartv = 0;
	cartx = 0;
	omega = 0;
	minth = round(theta * 180 / PI);
	maxth = minth;
	minx = round(cartx * 100);
	maxx = minx;
	minU = 0;
	maxU = 0;
	err_prv = 0;
	err_sum = 0;
	isDown = false;
	showVal();
}

function btnZeroPID() {
	slideProp.value(0);
	slideInt.value(0);
	slideDif.value(0);
	reset();
}

function btnResetAll() {
	slideTheta.value(90 - 10);
	slideProp.value(200);
	slideInt.value(10);
	slideDif.value(5);
	slideLen.value(100);
	slideMc.value(2);
	slideMp.value(1);
	reset();
}

function setup() {
	const cnv = createCanvas(DIMX, DIMY);
	cnv.parent('sketch');
	strokeWeight(2);
	stroke(255);
	noFill();
	rectMode(CENTER);
	ellipseMode(RADIUS);
	frameRate(FR);

	slideTheta = createSlider(0, 180, (HALF_PI - theta) * 180 / PI, 1);
	slideProp = createSlider(0, 2000, Kp, 2);
	slideInt = createSlider(0, 1000, Ki / DT, 1);
	slideDif = createSlider(0, 1000, Kd * DT, 1);
	slideLen = createSlider(1, 200, L * 100, 1);
	slideMc = createSlider(0.01, 10, Mc, 0.01);
	slideMp = createSlider(0.01, 10, Mp, 0.01);

	slideTheta.parent('cntTheta');
	slideProp.parent('cntProp');
	slideInt.parent('cntInt');
	slideDif.parent('cntDif');
	slideLen.parent('cntLen');
	slideMc.parent('cntMc');
	slideMp.parent('cntMp');

	slideTheta.style('width', '1001px');
	slideProp.style('width', '1001px');
	slideInt.style('width', '1001px');
	slideDif.style('width', '1001px');
	slideLen.style('width', '1001px');
	slideMc.style('width', '1001px');
	slideMp.style('width', '1001px');

	slideTheta.changed(reset);
	slideProp.changed(reset);
	slideInt.changed(reset);
	slideDif.changed(reset);
	slideLen.changed(reset);
	slideMc.changed(reset);
	slideMp.changed(reset);

	showVal();

	const btn1 = createButton('Zero PID');
	btn1.mousePressed(btnZeroPID);

	const btn2 = createButton('Reset All');
	btn2.mousePressed(btnResetAll);
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
			// if (Math.abs(U) < 0.001) {
			// 	U = 0;
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
		const penda = (C5 * sint - W2 * cost + C4 * U * cost) / det;

		// Euler integration
		cartv += carta * DT;
		cartx += cartv * DT;
		omega += penda * DT;
		theta += omega * DT;

		// Range check
		if (theta > PI) {
			theta -= TWO_PI;
		}
		if (theta <= -PI) {
			theta += TWO_PI;
		}

		// Range display
		const curth = round(theta * 180 / PI);
		const curx = round(cartx * 100);
		const curU = round(U);
		document.getElementById("curth").innerHTML = curth;
		document.getElementById("curx").innerHTML = curx;
		document.getElementById("curU").innerHTML = curU;
		if (curth < minth) {
			minth = curth;
			document.getElementById("minth").innerHTML = curth;
		}
		if (curth > maxth) {
			maxth = curth;
			document.getElementById("maxth").innerHTML = curth;
		}
		if (curx < minx) {
			minx = curx;
			document.getElementById("minx").innerHTML = curx;
		}
		if (curx > maxx) {
			maxx = curx;
			document.getElementById("maxx").innerHTML = curx;
		}
		if (curU < minU) {
			minU = U;
			document.getElementById("minU").innerHTML = curU;
		}
		if (curU > maxU) {
			maxU = U;
			document.getElementById("maxU").innerHTML = curU;
		}
	}

	// Define grid
	translate(HALFX, HALFY);    // origin at the centre
	scale(1, -1);               // positive y goes up, keep pixel scaling
	background(0);              // clear screen
	line(-HALFX, 0, HALFX, 0);  // ground (y = 0)
	stroke(255, 255, 255, 102);
	line(0, -HALFY, 0, HALFY);  // line x = 0
	const pminx = minx * 0.01 * SCALE - CARTW * 0.5;
	const pmaxx = maxx * 0.01 * SCALE + CARTW * 0.5;
	stroke(255, 255, 51);
	line(pminx, 0, pminx, WHEELR + CARTH); // range marker
	line(pmaxx, 0, pmaxx, WHEELR + CARTH); // range marker
	stroke(255);

	// Draw cart and pendulum from cart position
	push();
	translate(cartx * SCALE, CARTH);  // also compensate for cart height
	fill(102, 153, 255, 153);
	rect(0, 0, CARTW, CARTH);
	fill(102, 153, 255, 153);
	arc(-WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	arc( WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	const px = -sint * LP;  // cos(a+pi/2) = -sin(a)
	const py =  cost * LP;  // sin(a+pi/2) =  cos(a)
	fill(255, 102, 153, 153);
	circle(px, py, PENDR);
	line(0, 0, px, py);
	pop();
}

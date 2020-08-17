// Physical parameters
const L  = 2.5;     // pendulum length in m
const pm = 1;     // pendulum mass in kg
const cm = 2;    // cart mass in kg

// Simulation parameters
const DT = 0.01;  // timestep per update in s
const G  = 9.81;  // gravitational constant in m/s^2

// Visualisation parameters
const DIMX  = 800;  // canvas width
const DIMY  = 600;  // canvas height
const SCALE = 100;  // pixels per metre
const CARTW =  60;  // cart width in pixels
const CARTH =  20;  // cart Height in pixels
const PENDR =  10;  // pendulum radius in pixels

// Simulation variables
let cartx = 0;  // cart position
let cartv = 0;  // cart velocity
let theta = 0.1;  // pendulum angle (0 = straight up, anti-clockwise = positive)
let omega = 0;  // pendulum angular velocity

// Convenience / derivative values
const WHEELB = (CARTW - CARTH) * 0.5;
const WHEELR = CARTH * 0.5;
const A = pm / (pm + cm);
const B = A * G;
const C = A * L;
const D = A / pm;
const E = G / L;
const F = D / L;

function setup() {
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	rectMode(CENTER);
	ellipseMode(RADIUS);
}

function draw() {
	// Define grid
	translate(DIMX * 0.5, DIMY * 0.5);  // origin at the centre
	scale(1, -1);   // positive y goes up, keep pixel scaling
	background(0);  // black background
	
	// Draw cart
	push();
	translate(cartx * SCALE, 0);
	rect(0, 0, CARTW, CARTH);
	arc(-WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	arc( WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	pop();

	// Draw pendulum
	const px = cos(theta + PI * 0.5) * L * SCALE;
	const py = sin(theta + PI * 0.5) * L * SCALE;
	line(cartx * SCALE, 0, px, py);
	circle(px, py, PENDR);

	const cost = cos(theta);
	const sint = sin(theta);
	const U = 0;
	const det = 1 - A * cost * cost;
	const W2 = A * omega * omega * sint;
	const carta = (B * sint * cost - L * W2 + D * U) / det;
	const penda = (E * sint - W2 * cost + F * U * cost) / det;

	cartv += carta * DT;
	cartx += cartv * DT;
	omega += penda * DT;
	theta += omega * DT;
}

// Physical parameters
const Mc = 5;        // cart mass [kg]
const Mp = 1;        // pendulum mass [kg]
const L  = 1;        // pendulum length [m]
const G  = 9.81;     // gravitational constant [m/s^2]

// Simulation parameters
const DT = 0.01;     // timestep per frame [s]

// Visualisation parameters
const DIMX  = 1200;  // canvas width
const DIMY  =  600;  // canvas height
const SCALE =  200;  // pixels per metre
const CARTW =   60;  // cart width in pixels
const CARTH =   20;  // cart height in pixels
const PENDR =   10;  // pendulum radius in pixels

// Simulation variables
let cartx = 0;       // cart position [m]
let cartv = 0;       // cart velocity [m/s]
let theta = 0.1;     // pendulum angle (0 = up) [rad]
let omega = 0;       // pendulum angular velocity [rad/s]

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

function setup() {
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	rectMode(CENTER);
	ellipseMode(RADIUS);
}

function draw() {
	// Determine accelerations
	const U = -theta * 100;  // external control force on cart in î direction
	const cost = cos(theta);
	const sint = sin(theta);
	const det = 1 - C1 * cost * cost;
	const W2 = C1 * omega * omega * sint;
	const carta = (C2 * sint * cost - L * W2 + C3 * U) / det;
	const penda = (C4 * sint - W2 * cost + C5 * U * cost) / det;

	// Define grid
	translate(HALFX, HALFY);              // origin at the centre
	scale(1, -1);                         // positive y goes up, keep pixel scaling
	background(0);                        // clear screen
	line(-HALFX, -CARTH, HALFX, -CARTH);  // ground
	line(0, -CARTH, 0, -CARTH - PENDR);   // origin marker

	// Draw cart and pendulum from cart position
	push();
	translate(cartx * SCALE, 0);
	rect(0, 0, CARTW, CARTH);
	arc(-WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	arc( WHEELB, -WHEELR, WHEELR, WHEELR, PI, 0);
	const px = -sint * LP;  // cos(a+pi/2) = -sin(a)
	const py =  cost * LP;  // sin(a+pi/2) =  cos(a)
	line(0, 0, px, py);
	circle(px, py, PENDR);
	pop();

	// Euler integration
	cartv += carta * DT;
	cartx += cartv * DT;
	omega += penda * DT;
	theta += omega * DT;
}

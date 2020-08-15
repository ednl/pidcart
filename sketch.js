const DIMX = 800;
const DIMY = 600;

const G     =   9.81;      // gravitational constant in m/s^2
const DT    =   0.01;      // timestep per update in s
const SCALE = 100;         // pixels per metre
const EPS   =   0.000001;  // truncation threshold (epsilon)

const BOUNDX = DIMX * 0.5 / SCALE;  // max |x| in m
const BOUNDY = DIMY * 0.5 / SCALE;  // max |y| in m

let cart, pend;

function setup() {
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	angleMode(DEGREES);
	rectMode(CENTER);
	ellipseMode(RADIUS);

	cart = new Cart(0, 0, 0, 0, 10, 0.2);
	pend = new Pendulum(0, 1, 0, 0, 1, 2);

	// Set independent forces
	cart.setforce();
	pend.setforce();

	// Force from pend on cart = component in direction of cart of independent force on pend
	const F = p5.Vector.mult(pend.pos, pend.force.dot(pend.pos));
	if (cart.pos.x <= 0 && F.y < 0) {
		//F.y = 0;
	}
	cart.addforce(F);
	pend.addforce(p5.Vector.mult(pend.pos, cart.force.dot(pend.pos)));
}

function draw() {
	// Define grid
	translate(DIMX * 0.5, DIMY * 0.5);  // origin at the centre
	scale(1, -1);   // positive y goes up, keep pixel scaling

	// Draw scene
	background(0);  // black background
	cart.show();
	pend.show();

	// Set independent forces
	// (gravity + optional external force)
	// cart.setforce();
	// pend.setforce();

	// Add reaction forces
	// pend.pos is normalised vector from cart to pend
	// so for force pulling on pend: use -pend.pos, but -1*-1=1
	// cart.addforce(p5.Vector.mult(pend.pos, pend.force.dot(pend.pos)));
	// pend.addforce(p5.Vector.mult(pend.pos, cart.force.dot(pend.pos)));

	// Update positions
	// cart.update();
	// pend.update();
}

const DIMX = 800;
const DIMY = 600;
const EPS = 0.000001;

const GRAV = 9.81;
const TSTEP = 0.1;

let cart, pend;

function setup() {
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	angleMode(DEGREES);
	rectMode(CENTER);
	ellipseMode(RADIUS);

	const cartsize = DIMX / 40;
	const pendsize = DIMY / 3;

	cart = new Cart(DIMX / 4, 0, 0, 0, 10, cartsize);
	pend = new Pendulum(0, 1, 0, 0, 1, pendsize);

	cart.update(1000, 5000);
	pend.update();
}

function draw() {
	translate(0, DIMY * 0.5);
	scale(1, -1);
	background(0);

	cart.show();
	pend.show();

	cart.update();
	pend.update();
}

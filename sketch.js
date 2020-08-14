const DIMX = 800;
const DIMY = 600;
const HALFX = DIMX * 0.5;
const HALFY = DIMY * 0.5;
const CGRAV = 9.81;   // default gravity constant
const CFRIC = 0.005;  // default friction coefficient
const CDRAG = 0.01;   // default drag coefficient
const DT = 0.1;
const EPS = 0.000001;

let cart, pend, ball, ground;

class Newtonian {
	constructor(x0, y0, vx0, vy0, size, mass, grav, fric, drag) {
		this.pos = createVector(x0, y0);
		this.vel = createVector(vx0, vy0);
		this.acc = createVector(0, 0);
		this.size = size ? Math.abs(size) : 1;
		this.mass = mass ? Math.abs(mass) : 1;
		this.grav = grav ? -Math.abs(grav) : 0;    // C_grav = -g
		this.fric = fric ? fric * this.grav : 0;   // C_fric = -Crr * g
		this.drag = drag ? -drag / this.mass : 0;  // C_drag = -0.5 . rho . C_D . A / m
	}

	update(Fx, Fy) {
		const ax = arguments.length >= 1 && Fx ? Fx / this.mass : 0;  // ax = Fx / m
		const ay = arguments.length >= 2 && Fy ? Fy / this.mass : 0;  // ay = Fy / m

		// F_grav = m . g             in negative y direction
		//        = m . g . [0, -1]
		//        = [0, -m . g]
		// a_grav = F_grav / m
		//        = [0, C_grav]       where C_grav = -g
		this.acc = createVector(ax, ay + this.grav);

		const vm = this.vel.mag();
		if (vm) {
			// F_fric = Crr * ||N||                  in opposite direction of v, where N = normal force
			// cos(a) = Fg . -N / ||Fg|| / ||N||     where a = angle between Fg and -N
			//        = Crr . m . g . cos(a)         in opposite direction of v
			if (this.fric) {
				const factor = this.fric * this.vel.x / (vm * vm);
				this.acc.add(p5.Vector.mult(this.vel, factor));
			}

			// F_drag = 0.5 . rho . C_D . A . v^2                  in opposite direction of v
			//        = 0.5 . rho . C_D . A . v^2 . (-v / ||v||)
			//        = -0.5 . rho . C_D . A . ||v|| . v
			// a_drag = F_drag / m
			//        = C_drag . ||v|| . v                         where C_drag = -0.5 . rho . C_D . A / m
			if (this.drag) {
				this.acc.add(p5.Vector.mult(this.vel, this.drag * vm));
			}
		}

		this.limitAcc();
		this.vel.add(p5.Vector.mult(this.acc, DT));
		this.limitVel();
		this.pos.add(p5.Vector.mult(this.vel, DT));
		this.limitPos();
		return this;
	}

	limitAcc() {
		const dt2 = DT * DT;
		if (this.acc.x && Math.abs(this.acc.x * dt2) < EPS) {
			this.acc.x = 0;
		}
		if (this.acc.y && Math.abs(this.acc.y * dt2) < EPS) {
			this.acc.y = 0;
		}
	}

	limitVel() {
		if (this.vel.x && Math.abs(this.vel.x * DT) < EPS) {
			this.vel.x = 0;
		}
		if (this.vel.y && Math.abs(this.vel.y * DT) < EPS) {
			this.vel.y = 0;
		}
	}

	limitPos() {
		return;
	}

	show() {
		circle(this.pos.x, this.pos.y, this.size);
	}
}

class Cart extends Newtonian {
	show() {
		const w = this.size * 3;
		const h = this.size;

		const dx = (w - h) * 0.50;
		const y = -h * 0.5;
		const r = h * 0.5;

		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rect(0, 0, w, h);
		if (this.vel.x >= 0) {
			arc(-dx, y, r, r, 180, 0);
			arc(dx, y, r, r, 180, 0);
		} else {
			arc(-dx, -y, r, r, 0, 180);
			arc(dx, -y, r, r, 0, 180);
		}
		pop();
	}

	limitAcc() {
		super.limitAcc();
		if (this.pos.y <= 0 && this.acc.y < 0) {
			this.acc.y = 0;
		}
		if ((this.pos.x <= -HALFX && this.acc.x < 0) || (this.pos.x >= HALFX && this.acc.x > 0)) {
			this.acc.x = 0;
		}
	}

	limitVel() {
		super.limitVel();
		if (this.pos.y <= 0 && this.vel.y < 0) {
			this.vel.y = 0;
		}
		if ((this.pos.x <= -HALFX && this.vel.x < 0) || (this.pos.x >= HALFX && this.vel.x > 0)) {
			this.vel.x = 0;
		}
	}

	limitPos() {
		if (this.pos.y < 0) {
			this.pos.y = 0;
		}
		if (this.pos.x < -HALFX) {
			this.pos.x = -HALFX;
		}
		if (this.pos.x > HALFX) {
			this.pos.x = HALFX;
		}
	}
}

class Pend extends Newtonian {
	constructor() {
		super(arguments);
		this.angle = this.pos.heading()
		this.pos.normalize();
	}

	limitAcc() {
		const dir = this.pos.x >= 0 ? 1 : -1;
		const tang = createVector(this.pos.y * dir, -this.pos.x * dir);
		const proj = p5.Vector.dot(this.acc, tang);
		this.acc = p5.Vector.mult(tang, proj);
	}

	limitPos() {
		this.pos.normalize();
	}

	show() {
		const x = cart.pos.x + this.pos.x * this.size;
		const y = cart.pos.y + this.pos.y * this.size;
		line(cart.pos.x, cart.pos.y, x, y);
		circle(x, y, 10);
	}
}

function setup() {
	createCanvas(DIMX, DIMY);
	strokeWeight(1);
	stroke(255);
	noFill();
	angleMode(DEGREES);
	rectMode(CENTER);
	ellipseMode(RADIUS);

	const cartsize = DIMX / 40;
	ground = -cartsize;

	cart = new Cart(0, 0, 0, 0, cartsize, 10, CGRAV, 0, 0);
	pend = new Pend(1, 0, 0, 0, 200, 1, CGRAV, 0, 0);
	ball = new Newtonian(200, 200, 0, 0, 10, 1, CGRAV, 0, 0);
}

function draw() {
	translate(HALFX, HALFY);  // origin in the middle
	scale(1, -1);             // make y-axis and sin() go the right way
	background(0);
	line(-HALFX, ground, HALFX, ground);
	line(0, -HALFY, 0, HALFY);

	cart.show();
	pend.show();
	ball.show();

	cart.update();
	pend.update();
	ball.update();
}

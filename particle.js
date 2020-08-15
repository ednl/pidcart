class Particle {
	constructor(x0, y0, vx0, vy0, mass, size) {
		// Properties from parameters
		this.pos = createVector(x0, y0);
		this.vel = createVector(vx0, vy0);
		this.mass = mass ? mass : 1;
		this.size = size ? size : 1;
		// Calculated properties
		this.acc = createVector(0, 0);
		this.force = createVector(0, 0);
		this.grav = -G * this.mass;
	}

	setforce(...Fxy) {
		// Optional external force
		this.force.x = Fxy.length ? Fxy.shift() : 0;
		this.force.y = Fxy.length ? Fxy.shift() : 0;
		// Gravity
		this.force.y += this.grav;
		this.limitForce();
	}

	addforce(Fvec) {
		this.force.add(Fvec);
		this.limitForce();
	}

	update() {
		this.acc = p5.Vector.div(this.force, this.mass);
		this.limitAcc();

		this.vel.add(p5.Vector.mult(this.acc, DT));
		this.limitVel();

		this.pos.add(p5.Vector.mult(this.vel, DT));
		this.limitPos();
	}

	show() {
		// Assume the cow is a sphere
		circle(this.pos.x * SCALE, this.pos.y * SCALE, this.size);
	}

	limitForce() {
		return;
	}

	limitAcc() {
		return;
	}

	limitVel() {
		return;
	}

	limitPos() {
		return;
	}
}

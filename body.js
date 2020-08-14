class Body {
	constructor(x0, y0, vx0, vy0, mass, size) {
		this.pos = createVector(x0, y0);
		this.vel = createVector(vx0, vy0);
		this.acc = createVector(0, 0);
		this.mass = mass ? Math.abs(mass) : 1;
		this.size = size ? Math.abs(size) : 1;
	}

	update(Fx, Fy) {
		const ax = Fx ? Fx / this.mass : 0;
		const ay = Fy ? Fy / this.mass : 0;

		this.acc = createVector(ax, ay - GRAV);
		this.limitAcc();

		this.vel.add(p5.Vector.mult(this.acc, TSTEP));
		this.limitVel();

		this.pos.add(p5.Vector.mult(this.vel, TSTEP));
		this.limitPos();
	}

	limitAcc() {
		// TODO: maybe truncate to zero when < EPS
		if (this.pos.y <= 0 && this.acc.y < 0) {
			this.acc.y = 0;
		}
	}

	limitVel() {
		// TODO: maybe truncate to zero when < EPS
		if (this.pos.y <= 0 && this.vel.y < 0) {
			this.vel.y = 0;
		}
	}

	limitPos() {
		if (this.pos.y < 0) {
			this.pos.y = 0;
		}
	}

	show() {
		circle(this.pos.x, this.pos.y, this.size);
	}
}

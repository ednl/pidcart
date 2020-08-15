class Pendulum extends Particle {
	constructor(x0, y0, vx0, vy0, mass, size) {
		super(x0, y0, vx0, vy0, mass, size);
		// this.pos.normalize();
		// this.angle = this.pos.heading();
		// this.omega = 0;
		// this.degperm = 360 / (2 * Math.PI * this.size);
	}

	limitForce() {
		// Normal force from ground cancels vertical component of force in direction of cart
		if (cart.pos.y <= 0) {
			//
			this.force.y = 0;
		}
	}

	// update() {
	// 	const a = -GRAV * cos(this.angle) + cart.acc.mag() * sin(this.angle + cart.acc.heading());
	// 	this.omega += a * TSTEP * this.degperm;
	// 	const da = this.omega * TSTEP;
	// 	this.pos.rotate(da);
	// 	this.angle += da;
	// }

	show() {
		const px = (cart.pos.x + this.pos.x * this.size) * SCALE;
		const py = (cart.pos.y + this.pos.y * this.size) * SCALE;
		line(cart.pos.x * SCALE, cart.pos.y * SCALE, px, py);
		circle(px, py, 10);
	}
}

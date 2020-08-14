class Pendulum extends Body {
	constructor(x0, y0, vx0, vy0, mass, size) {
		super(x0, y0, vx0, vy0, mass, size);
		this.pos.normalize();
		this.angle = this.pos.heading();
		this.omega = 0;
		this.degperm = 360 / (2 * Math.PI * this.size);
	}

	update() {
		const a = -GRAV * cos(this.angle) + cart.acc.mag() * sin(this.angle + cart.acc.heading());
		this.omega += a * TSTEP * this.degperm;
		const da = this.omega * TSTEP;
		this.pos.rotate(da);
		this.angle += da;
	}

	show() {
		const x = cart.pos.x + this.pos.x * this.size;
		const y = cart.pos.y + this.pos.y * this.size;
		line(cart.pos.x, cart.pos.y, x, y);
		circle(x, y, 10);
	}
}

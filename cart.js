class Cart extends Particle {
	constructor(x0, y0, vx0, vy0, mass, size) {
		super(x0, y0, vx0, vy0, mass, size);
		this.width  = 3 * this.size * SCALE;
		this.height = this.size * SCALE;
		// Width & height already scaled to pixels
		// so dimensions below are also in pixels
		this.wheelx = (this.width - this.height) * 0.5;
		this.wheely = this.height * 0.5;
	}

	limitForce() {
		// Normal force from ground cancels vertical force
		if (this.pos.y <= 0 && this.force.y < 0) {
			this.force.y = 0;
		}
	}

	limitVel() {
		// Bounce off ground
		if (this.pos.y <= 0 && this.vel.y < 0) {
			this.vel.y *= -1;
		}
		// Bounce off walls
		// if ((this.pos.x <= -BOUNDX && this.vel.x < 0) || (this.pos.x >= BOUNDX && this.vel.x > 0)) {
		// 	this.vel.x *= -1;
		// }
	}

	limitPos() {
		// Can't be below ground
		if (this.pos.y < 0) {
			this.pos.y = 0;
		}
	}

	show() {
		push();
		translate(this.pos.x * SCALE, this.pos.y * SCALE);
		rotate(this.vel.heading());
		rect(0, 0, this.width, this.height);
		if (this.vel.x >= 0) {
			arc(-this.wheelx, -this.wheely, this.wheely, this.wheely, 180, 0);
			arc( this.wheelx, -this.wheely, this.wheely, this.wheely, 180, 0);
		} else {
			arc(-this.wheelx,  this.wheely, this.wheely, this.wheely, 0, 180);
			arc( this.wheelx,  this.wheely, this.wheely, this.wheely, 0, 180);
		}
		pop();
	}
}

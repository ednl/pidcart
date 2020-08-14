class Cart extends Body {
	constructor(x0, y0, vx0, vy0, mass, size) {
		super(x0, y0, vx0, vy0, mass, size);
		this.width  = this.size * 3;
		this.height = this.size;
		this.wheelx = (this.width - this.height) * 0.5;
		this.wheely = this.height * 0.5;
	}

	show() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rect(0, 0, this.width, this.height);
		if (this.vel.x >= 0) {
			arc(-this.wheelx, -this.wheely, this.wheely, this.wheely, 180, 0);
			arc( this.wheelx, -this.wheely, this.wheely, this.wheely, 180, 0);
			// line(-3 * this.width, -this.height, 3 * this.width, -this.height);
		} else {
			arc(-this.wheelx,  this.wheely, this.wheely, this.wheely, 0, 180);
			arc( this.wheelx,  this.wheely, this.wheely, this.wheely, 0, 180);
			// line(-3 * this.width, this.height, 3 * this.width, this.height);
		}
		pop();
	}

	limitAcc() {
		super.limitAcc();
		if ((this.pos.x <= 0 && this.acc.x < 0) || (this.pos.x >= DIMX - 1 && this.acc.x > 0)) {
			this.acc.x = 0;
		}
	}

	limitVel() {
		super.limitVel();
		if ((this.pos.x <= 0 && this.vel.x < 0) || (this.pos.x >= DIMX - 1 && this.vel.x > 0)) {
			this.vel.x = 0;
		}
	}

	limitPos() {
		super.limitPos();
		if (this.pos.x < 0) {
			this.pos.x = 0;
		}
		if (this.pos.x > DIMX - 1) {
			this.pos.x = DIMX - 1;
		}
	}
}

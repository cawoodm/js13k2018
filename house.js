function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.state = 0;
    this.waittime = -1;
    this.satisfaction = -1;
    return this;
};
House.prototype.update = function(dt) {
    if (g.ticker.ticks % 60 == 0) {
        // Approx every second
        if (this.state==1) this.waittime+=0.5;
        if (this.state==2) this.waittime++;
        
        if (this.waittime>=0) {
            if (this.waittime/this.patience<0.5) this.satisfaction=2;
            else if (this.waittime < this.patience) this.satisfaction=1;
            else if (this.waittime/this.patience>3 && this.state==1) {
                // Lost customer
                this.state = 3;
                this.satisfaction = 0;
                this.flashing = false
                ArrayRemove(g.manager.prospects, this);
                g.sound.play("lost")
            }
            else this.satisfaction = 0;
        }
    }
};
House.colors=['', 'white', 'blue', 'orange'];
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        if (this.state==1) {
            g.sprites.cloud.renderer(ctx, this.x, this.y)
            g.sprites.pizza.renderer(ctx, this.x+6, this.y+4)
        } else if (this.state==2) {
            g.sprites.cloud.renderer(ctx, this.x, this.y)
            g.sprites.pizza.renderer(ctx, this.x+6, this.y+4)
            arc(ctx, this.x+13, this.y+11, 5, this.waittime/this.patience, '#4B1716')
        }
    }
    if (this.state==3) {
        ctx.strokeStyle = House.colors[this.state]
        ctx.lineWidth='2';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
    if (this.satisfaction>=0) {
        g.sprites.sat[this.satisfaction].renderer(ctx, this.x+16, this.y+16)
    }
};
House.prototype.readyToOrder = function() {
    this.patience = Math.round(this.distanceFrom(g.pizzeria))*5;
    this.state=1; // Waiting to order
    this.waittime = 0;
    this.flashing = true
    return this
};
House.prototype.placeOrder = function() {
    this.state=2; // Waiting for order
    this.flashing = true
    this.waittime = 0;
    g.sound.play("order")
    return this
};
House.prototype.deliverOrder = function() {
    this.state=0;
    this.waittime = -1;
    this.flashing=false;
}
House.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};
function arc(ctx, x, y, r, per, col) {
    ctx.beginPath();
    ctx.fillStyle=col
    ctx.moveTo(x,y);
    ctx.arc(x, y, r, -Math.PI/2, per*2*Math.PI-Math.PI/2);
    ctx.closePath();
    ctx.fill();
}
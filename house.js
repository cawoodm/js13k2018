function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.state = 0;
    this.readySprite = new Sprite({sprite: "spritemap", w: 32, h: 32, offX: 32*4, offY: 32*1});
    this.orderedSprite = new Sprite({sprite: "spritemap", w: 32, h: 32, offX: 32*5, offY: 32*1});
    return this;
};
House.prototype.update = function(dt) {
    if (g.ticker.ticks % 60 == 0) {
        // Approx every second
        if (this.state==2) {
            this.waittime++;
        }
    }
};
House.colors=['', 'white', 'blue', 'red'];
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        if (this.state==1) {
            this.readySprite.renderer(ctx, this.x, this.y)
        } else if (this.state==2) {
            this.orderedSprite.renderer(ctx, this.x, this.y)
            arc(ctx, this.x+12, this.y+11, 5, this.waittime/this.patience, '#4B1716')
        } else {
            ctx.strokeStyle = House.colors[this.state]
            ctx.lineWidth='2';
            ctx.strokeRect(this.x, this.y, this.w, this.h)
        }
    }
};
House.prototype.readyToOrder = function() {
    this.state=1; // Waiting to order
    this.flashing = true
    return this
};
House.prototype.placeOrder = function() {
    this.patience = Math.round(this.distanceFrom(g.pizzeria))*20;
    this.state=2; // Waiting for order
    this.flashing = true
    this.waittime = 0;
    g.sound.play("order")
    return this
};
House.prototype.deliverOrder = function() {
    this.state=0;
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
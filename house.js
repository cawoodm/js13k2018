function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.blockSize;
    this.h = options.h || g.ui.blockSize;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.flashColor = '';
    this.ordered = 0;
    return this;
};
House.prototype.update = function(dt) {
    //if (this.ordered) tween to impatience(red)
};
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        ctx.strokeStyle='#fff';
        if (this.ordered>0) ctx.strokeStyle='#00f';
        ctx.lineWidth='3';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
};
House.prototype.readyToOrder = function() {
    this.flashColor='white'
    this.flashing = true
    this.ordered = 0;
    return this
};
House.prototype.placeOrder = function() {
    this.flashColor='blue'
    this.flashing = true
    this.ordered = g.ticker.ticks;
    return this
};
House.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.blockSize 
};
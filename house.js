function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.blockSize;
    this.h = options.h || g.ui.blockSize;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    return this;
}
//House.prototype.update = function(dt) {}
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        ctx.strokeStyle='#fff';
        ctx.lineWidth='3';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
}
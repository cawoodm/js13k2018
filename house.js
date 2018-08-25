function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.blockSize;
    this.h = options.h || g.ui.blockSize;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.flash = false;
    return this;
}
House.prototype.update = function(dt) {
    if (this.flashing && g.ticker.ticks-this.lastFlash>30) {
        this.flash = !this.flash;
        this.lastFlash = g.ticker.ticks;
    }
}
House.prototype.renderer = function(ctx) {
    if (this.flash) {
        ctx.strokeStyle='#fff';
        ctx.lineWidth='3';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
}
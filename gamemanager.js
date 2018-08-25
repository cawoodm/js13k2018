function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.lastFlash = 0;
    return this;
}
GameManager.prototype.update = function(dt) {
    if (g.ticker.ticks-this.lastFlash>30) {
        this.flash = !this.flash;
        this.lastFlash = g.ticker.ticks;
    }
}
GameManager.prototype.renderer = function(ctx) {
    //ctx.fillText(Math.round(g.ticker.actualFPS), 30, 30)
}
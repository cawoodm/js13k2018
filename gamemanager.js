function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.lastFlash = 0;
    this.level = 1;
    this.houses = g.scene.get("house")
    shuffleArray(this.houses)
    this.prospects = []
    return this;
}
GameManager.prototype.update = function(dt) {
    if (g.ticker.ticks % 30 == 0) {
        if (this.prospects.length < 2* this.level) this.findProspect();
        this.flash = !this.flash;
    }
    //if (g.ticker.ticks-this.lastFlash>30) {
//        this.lastFlash = g.ticker.ticks;
  //  }
}
GameManager.prototype.renderer = function(ctx) {
    //ctx.fillText(Math.round(g.ticker.actualFPS), 30, 30)
}
GameManager.prototype.findProspect = function() {
    for (i=0; i<this.houses.length; i++) {
        let h = this.houses[i];
        if (this.prospects.includes(h)) continue;
        // Is this house within 10 x level blocks of the pizzeria?
        if (Math.sqrt(Math.pow(g.pizzeria.x-h.x,2)+Math.pow(g.pizzeria.y-h.y,2))/g.ui.blockSize < this.level*10) {
            h.flashing = true;
            return this.prospects.push(h)
        }
    }
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
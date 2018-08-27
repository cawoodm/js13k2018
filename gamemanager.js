function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.level = 1;
    this.houses = g.scene.get("house")
    shuffleArray(this.houses)
    this.prospects = []
    return this;
}
GameManager.prototype.update = function(dt) {
    if (g.ticker.ticks % 30 == 0) {
        if (this.prospects.length < 2* this.level) this.getNewHungryHouse();
        this.flash = !this.flash;
    }
}
GameManager.prototype.renderer = function(ctx) {
    ctx.fillStyle = 'white'
    ctx.fillText(Math.round(g.ticker.actualFPS/10)+"0", 10, 10)
}
GameManager.prototype.vanStops = function() {
    this.prospects.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            h.placeOrder();
        }
    });
    if (Math.round(g.player.distanceFrom(g.pizzeria)) <= 1) {
        dp("home")
    }
}
GameManager.prototype.getNewHungryHouse = function() {
    for (i=0; i<this.houses.length; i++) {
        let h = this.houses[i];
        if (this.prospects.includes(h)) continue;
        // Is this house within 5 x level blocks of the pizzeria?
        if (h.distanceFrom(g.pizzeria) < this.level*5) {
            return this.prospects.push(h.readyToOrder())
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

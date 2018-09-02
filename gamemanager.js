function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.level = 1;
    this.houses = g.scene.get("house")
    this.prospects = []
    this.orders = []
    this.lost = []
    this.deliveries=0;
    this.money=0;
    g.sprites = {
        cloud: new Sprite({w: 32, h: 32, offX: 32*4, offY: 32*1}),
        pizza: new Sprite({w: 14, h: 14, offX: 32*5, offY: 32*1}),
        minipizza: new Sprite({w: 14, h: 14, offX: 32*5, offY: 32*1, scale: 0.5}),
        sat: [
            new Sprite({w: 32, h: 32, offX: 32*5, offY: 32*2}),
            new Sprite({w: 32, h: 32, offX: 32*6, offY: 32*2}),
            new Sprite({w: 32, h: 32, offX: 32*4, offY: 32*2})
        ]
    };
    return this;
}
GameManager.prototype.update = function(dt) {
    // Every 1/2 second
    if (g.ticker.ticks % 30 == 0) this.flash = !this.flash;
    // Every 5s
    if (this.prospects.length+this.orders.length==0 || g.ticker.ticks % (60*5) == 0) {
        if (this.prospects.length  < 4*this.level) this.getNewHungryHouse();
    }
    this.level=Math.floor(this.deliveries/6)+1;
}
GameManager.prototype.vanStops = function() {
    this.prospects.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            if (h.state==1) {
                // Take order
                h.placeOrder();
                this.orders.push(h)
                ArrayRemove(this.prospects, h)
            } 
        }
    });
    g.player.carrying.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            // Deliver order
            h.deliverOrder();
            this.money+=20;
            this.deliveries++;
            g.sound.play("delivery")
            ArrayRemove(this.orders, h)
            ArrayRemove(g.player.carrying, h)
        }
    });
}
GameManager.prototype.atPizzeria = function() {
    // Transfer all orders into carrying pizzas
    if (g.ticker.ticks%60==0 && this.orders.length>0) {
        let o = this.orders[0];
        g.player.carrying.push(o)
        ArrayRemove(this.orders, o)
        //this.orders.forEach((o)=>{if(!g.player.carrying.includes(o)) g.player.carrying.push(o)});
    }
    if (g.ticker.ticks%10==0)
        if (this.money>0 && g.player.fuel<100) {
            this.money--;
            g.player.fuel++;
        }
}
GameManager.prototype.getNewHungryHouse = function() {
    let possibles=[];
    for (i=0; i<this.houses.length; i++) {
        let h = this.houses[i];
        if (!h.state==0) continue;
        if (h.satisfaction==0) continue;
        // Is this house within 5 x level blocks of the pizzeria?
        if (h.distanceFrom(g.pizzeria) < this.level*6) {possibles.push(h)}
    }
    if (possibles.length==0) return;
    let h = rnda(possibles)
    g.sound.play("prospect")
    return this.prospects.push(h.readyToOrder())
}
GameManager.prototype.renderer = function(ctx) {
    ctx.fillStyle = 'white'
    ctx.fillText("prospects=" + this.prospects.length+", orders=" + this.orders.length+", money=" + this.money+", level=" + this.level, 10, 10)
}
function ArrayShuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function ArrayRemove(arr, item) {
    for(let i=0; i<arr.length; i++) if (arr[i]===item) return arr.splice(i,1);
}
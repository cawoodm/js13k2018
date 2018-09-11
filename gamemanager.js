function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.level = 1;
    this.houses = g.scene.get("house")
    this.prospects = []
    this.orders = []
    this.carrying=[];
    this.lost = []
    this.customers = []
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
    if (g.state!="play") return;
    // Every 1/2 second
    if (g.ticker.ticks % 30 == 0) this.flash = !this.flash;
    // Every 5s
    if (this.prospects.length+this.orders.length==0 || g.ticker.ticks % (60*5) == 0) {
        if (this.prospects.length  < 4*this.level) this.getNewHungryHouse();
    }
    if (g.player.fuel<=0) return g.GameOver("You ran out of fuel!");
    if (this.lost.length>5 && this.lost.length>this.customers.length) return g.GameOver("Too many unhappy customers!");
    this.level=Math.floor(this.deliveries/6)+1;
}
GameManager.prototype.vanStops = function() {
    this.prospects.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            if (h.state==1) {
                // Take order
                h.placeOrder();
                g.manager.orders.push(h)
                ArrayRemove(g.manager.prospects, h)
            } 
        }
    });
    g.manager.carrying.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            // Deliver order
            h.deliverOrder();
            if(!this.customers.includes(h)) this.customers.push(h)
            this.money+=20;
            this.deliveries++;
            g.sound.play("delivery")
            ArrayRemove(this.orders, h)
            ArrayRemove(g.manager.carrying, h)
        }
    });
}
GameManager.prototype.atPizzeria = function() {
    // Transfer all orders into carrying pizzas
    if (g.ticker.ticks%60==0 && this.orders.length>0) {
        let o = this.orders[0];
        g.manager.carrying.push(o)
        ArrayRemove(this.orders, o)
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
GameManager.prototype.loseCustomer = function(h) {
    if (h.state==1) ArrayRemove(this.prospects, h);
    else if (h.state==2) {ArrayRemove(this.orders, h);ArrayRemove(this.carrying, h);}
    ArrayRemove(this.customers, h);
    this.lost.push(h)
    h.satisfaction = 0;
    h.waittime = 0;
    h.flashing = false
    h.state = 3;
    g.sound.play("lost")
}
//GameManager.prototype.renderer = function(ctx) {}
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
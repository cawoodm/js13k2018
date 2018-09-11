function Player(options) {
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.pizzas = [];
    this.sprite = new Sprite({w: this.w, h: this.h, offX: 32*4, offY: 96, scale: 1});
    this.collider=0;
    this.tag='player';
    this.acc={x:0, y:0};
    this.speed={x:0, y:0};
    this.velocity = options.velocity || 5;
    this.frame=0;
    this.fuel=100;
    g.collider.check(this, ["house", "block"], (e1, e2)=>{g.player.stop()}) 
    return this;
}
Player.prototype.update = function(delta) {
    if (g.state!="play") return;
    if (Math.round(this.distanceFrom(g.pizzeria)) == 0) g.manager.atPizzeria();
    if (this.nextMove) this.move(this.nextMove);
    this.speed.x += this.acc.x * delta;
    this.speed.y += this.acc.y * delta;
    this.x += this.speed.x;// * delta;
    this.y += this.speed.y;//    * delta;
    if (this.speed.x!=0 || this.speed.y!=0) this.fuel-=0.03;
    if (this.speed.x>0) this.frame=0;
    else if (this.speed.x<0) this.frame=1;
    else if (this.speed.y<0) this.frame=2;
    else if (this.speed.y>0) this.frame=3;
}
Player.prototype.renderer = function(ctx) {
    this.sprite.x=this.x;
    this.sprite.y=this.y;
    this.sprite.offX=g.ui.bz*4+this.frame*(g.ui.bz);
    this.sprite.renderer(ctx);
    g.manager.carrying.forEach((p,i)=>{
        let o = {x: 14, y: 7, xi:-3, yi:0};
        if (this.frame==1) o = {x: 10, y:-2, xi:3, yi:0}
        else if (this.frame==2) o = {x: 19, y:7, xi:0, yi:3}
        else if (this.frame==3) o = {x: 6, y:7, xi:0, yi:-3}
        g.sprites.minipizza.renderer(ctx, this.x+o.x+i*o.xi, this.y+o.y+i*o.yi, 0.5)
    });
}
Player.prototype.move = function(dir) {
    this.nextMove = null;
    if (dir.x*this.velocity==this.speed.x && dir.y*this.velocity==this.speed.y) return this.stop();
    let oldSpeed = {x: this.speed.x, y: this.speed.y};
    let ghost = {tag: "ghost", x: this.x, y: this.y, w: this.w, h: this.h, speed: {x: dir.x*this.velocity, y: dir.y*this.velocity}}
    let wouldCollide = Collider.collide(ghost, ["house", "block"], 0);
    let isColliding = Collider.collide(this, ["house", "block"], 1);
    let stationary = this.speed.x+this.speed.y==0;
    // Move up/down only if on X-grid (left/right)
    let onGrid = (dir.y!==0 && this.x % g.ui.bz == 0)||(dir.x!==0 && this.y % g.ui.bz == 0);
    //dp( this.x % g.ui.bz == 0)
    //dp(isColliding, wouldCollide, stationary, onGrid, this.x, this.x);
    if (isColliding && wouldCollide) {
        // Do nothing
    } else if (stationary && !wouldCollide) {
        // Move now
        this.speed = ghost.speed;
    } else if (wouldCollide || !onGrid) {
        // If we can't move now, move later
        this.nextMove=dir;
    } else {
        // Move now
        this.speed = ghost.speed;
    }
}
Player.prototype.stop = function() {
    this.speed={x: 0, y:0};
}
Player.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};
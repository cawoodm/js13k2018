function Player(options) {
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.w = options.w || g.ui.blockSize;
	this.h = options.h || g.ui.blockSize;
    this.sprite = new Sprite({sprite: "spritemap", w: this.w, h: this.h, offX: 32*4, offY: 96, scale: 1});
    this.collider=2;
    this.tag='player';
    this.acc={x:0, y:0};
    this.speed={x:0, y:0};
    this.velocity = options.velocity || 5;
    this.frame=0;
    this.bulletSpeed=15;
    return this;
}
Player.prototype.update = function(delta) {
    if (g.state!="play") return;
    if (this.nextMove) this.move(this.nextMove);
    this.speed.x += this.acc.x * delta;
    this.speed.y += this.acc.y * delta;
    this.x += this.speed.x;// * delta;
    this.y += this.speed.y;//    * delta;
    if (this.speed.x>0) this.frame=0;
    else if (this.speed.x<0) this.frame=1;
    else if (this.speed.y<0) this.frame=2;
    else if (this.speed.y>0) this.frame=3;
}
Player.prototype.renderer = function(ctx) {
    // Drop shadow
    ctx.beginPath();
    ctx.fillStyle="rgba(100,100,100,0.5)"
    ctx.ellipse(this.x+g.ui.blockSize/2, this.y+g.ui.blockSize, g.ui.blockSize/2.5, g.ui.blockSize/5, 0, 0, 2 * Math.PI);
    ctx.fill();
    this.sprite.x=this.x;
    this.sprite.y=this.y;
    this.sprite.offX=g.ui.blockSize*4+this.frame*(g.ui.blockSize);
    this.sprite.renderer(ctx);
}
Player.prototype.move = function(dir) {
    this.nextMove = null;
    if (dir.x*this.velocity==this.speed.x && dir.y*this.velocity==this.speed.y) return this.stop();
    let oldSpeed = {x: this.speed.x, y: this.speed.y};
    let ghost = {x: this.x, y: this.y, speed: {x: dir.x*this.velocity, y: dir.y*this.velocity}}
    let wouldCollide = Collider.collide(ghost, "wall", 2);
    let isColliding = Collider.collide(this, "wall", 1);
    let stationary = this.speed.x+this.speed.y==0;
    // Move up/down only if on X-grid (left/right)
    let onGrid = (dir.y!==0 && this.x % g.ui.blockSize == 0)||(dir.x!==0 && this.y % g.ui.blockSize == 0);
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
Player.prototype.shoot = function() {
    let off = {x: Math.sign(this.speed.x), y: Math.sign(this.speed.y)}
    if (off.x==0 && off.y==0) off.x=1; // No bullet if we're not moving
    g.scene.add(new Bullet({x: g.player.x+off.x*g.ui.blockSize/3, y: g.player.y+off.y*g.ui.blockSize/3, speed: off, velocity: this.bulletSpeed}));
}
Player.prototype.stop = function() {
    this.speed={x: 0, y:0};
}
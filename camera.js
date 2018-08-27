Camera = function(options) {
    this.x=options.x||0;
    this.y=options.y||0;
    this.w=options.w||500;
    this.h=options.h||500;
    this.tag = options.tag||"camera";
    this.box={x:0, y:0, w: options.box||300, h: options.box||300}
}
Camera.prototype.update = function() {
    // Let box follow player if player reaches box's bounds
    if (g.player.x<this.box.x) this.box.x = g.player.x;
    if (g.player.x+g.player.w>this.box.x+this.box.w) this.box.x = g.player.x+g.player.w-this.box.w;
    if (g.player.y<this.box.y) this.box.y = g.player.y;
    if (g.player.y+g.player.h>(this.box.y+this.box.h)) this.box.y = g.player.y+g.player.h-this.box.h;
    
    // Keep camera centered on the box around the player
    let boxCenter = {x: this.box.x+this.box.w/2, y: this.box.y+this.box.h/2}
    let camCenter = {x: this.x+this.w/2, y: this.y+this.h/2}
    if (boxCenter.x!=camCenter.x || boxCenter.y!=camCenter.y) {
        this.x += boxCenter.x-camCenter.x;
        this.y += boxCenter.y-camCenter.y;
    }
}
// canSee: Can the camera "see" this object?
Camera.prototype.canSee = function(obj) {
    // If we are a static (UI) element or without size then always show
    if (obj.static || typeof obj.w === "undefined" || typeof obj.h === "undefined") return true;
    let x1 = this.x;
	let X1 = this.x + this.w;
	let y1 = this.y;
	let Y1 = this.y + this.h;
	let x2 = obj.x;
	let X2 = obj.x + obj.w;
	let y2 = obj.y;
    let Y2 = obj.y + obj.h;
    let xOverlap = btw(x2, x1, X1) || btw(X2, x1, X1) || btw(x1, x2, X2) || btw(X1, x2, X2);
    let yOverlap = btw(y2, y1, Y1) || btw(Y2, y1, Y1) || btw(y1, y2, Y2) || btw(Y1, y2, Y2);
    return xOverlap && yOverlap;
}
Camera.prototype.renderer = function(ctx) {
    if (!Camera.debug) return;
    g.ctx.strokeStyle='#00F'
    g.ctx.strokeRect(this.box.x, this.box.y, this.box.w, this.box.h)
    g.ctx.fillStyle='#F00'
    g.ctx.fillRect(this.x+this.w/2-2, this.y+this.h/2-5, 4, 10)
    g.ctx.fillStyle='#00F'
    g.ctx.strokeRect(this.box.x+this.box.w/2-5, this.box.y+this.box.h/2-5, 10, 10)
}

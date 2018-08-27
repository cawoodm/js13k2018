function Collider(options) {
    options = options || {};
    this.checks = options.checks || [];
};
Collider.prototype.update = function(delta) {
    if (g.state!="play") return;
    for (let i=0; i<this.checks.length; i++) {
        let coll = Collider.collides(this.checks[i].tag1, this.checks[i].tag2)
        if (coll.length>0) this.checks[i].callback(coll[0], coll[1]);
    }
}
Collider.prototype.renderer = function(delta) {
    if (!Collider.debug) return;
    this.update(1);
}
Collider.prototype.check = function(tag1, tag2, callback) {
    this.checks.push({tag1: tag1, tag2: tag2, callback: callback});
}   
Collider.collide = function(tag1, tag2, tol) {return Collider.collides(tag1, tag2, tol).length>0;}
Collider.collides = function(tag1, tag2, tol) {
	let e1s = typeof tag1 == "string"?g.scene.get(tag1):[tag1];
    let e2s = g.scene.get(tag2);
	for (let i=0; i<e1s.length; i++)
		for (let j=0; j<e2s.length; j++) 
			if (e1s[i] != e2s[j])
			    if (Collider.collision(e1s[i], e2s[j], tol))
				    return [e1s[i], e2s[j]]
	return [];
};
Collider.collision = function(e1, e2, tol) {
    let d1 = {x: e1.speed?e1.speed.x:0, y: e1.speed?e1.speed.y:0};
    let t1 = tol || e1.collider || 0;
    let t2 = tol || e2.collider || 0;
	let x1 = e1.x + d1.x + t1;
	let X1 = e1.x + d1.x + e1.w-1 - t1;
	let y1 = e1.y + d1.y + t1;
	let Y1 = e1.y + d1.y + e1.h-1 - t1;
	let x2 = e2.x + t2;
	let X2 = e2.x + e2.w-1 - t2;
	let y2 = e2.y + t2;
    let Y2 = e2.y + e2.h-1 - t2;
	let xOverlap = btw(x2, x1, X1) || btw(X2, x1, X1) || btw(x1, x2, X2) || btw(X1, x2, X2);
    let yOverlap = btw(y2, y1, Y1) || btw(Y2, y1, Y1) || btw(y1, y2, Y2) || btw(Y1, y2, Y2);
    let collision = xOverlap && yOverlap;
    if (Collider.debug && e1.tag==Collider.debug[0] && e2.tag==Collider.debug[1]) {
        if (collision) g.ctx.lineWidth=5; else g.ctx.lineWidth=1;
        if(e1.tag==Collider.debug[0]) {g.ctx.strokeStyle="#0FF";g.ctx.strokeRect(x1, y1, X1-x1, Y1-y1)}
        if(e2.tag==Collider.debug[1]) {g.ctx.strokeStyle="#F00";g.ctx.strokeRect(x2, y2, X2-x2, Y2-y2)}
    }
	return collision;
};
//Collider.debug=["player", "block"];

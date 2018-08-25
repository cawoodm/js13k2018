function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    g.ctx.fillStyle='rgba(0,0,0,0.8)'
    g.ctx.fillRect(g.camera.x+2,g.camera.y+2,40,100)
    let pix = g.scene.get(["player", "house"]).forEach((e)=> {
        let x = e.x/g.ui.blockSize;
        let y = e.y/g.ui.blockSize;
        let sz = 1;
        if (e.tag=="player") g.ctx.fillStyle='red'
        else if (e.flashing && g.manager.flash) {g.ctx.fillStyle='white';sz=2}
        else g.ctx.fillStyle='rgba(100,100,100,0.75)'
        g.ctx.fillRect(g.camera.x+x,g.camera.y+y, sz, sz)
    });
}

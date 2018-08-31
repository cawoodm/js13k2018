function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    ctx.translate(-g.ui.hudWidth/g.ui.scale.x, 100)
    ctx.fillStyle='rgba(0,0,0,0.8)'
    ctx.fillRect(g.camera.x+2,g.camera.y+2,40,100)
    g.scene.get(["player", "pizzeria", "house"]).forEach((e)=> {
        let x = e.x/g.ui.bz;
        let y = e.y/g.ui.bz;
        let sz = 1;
        if (e.tag=="player") {
            ctx.fillStyle='red';sz=g.manager.flash?3:1;
        }
        else if (e.tag=="pizzeria") {
            ctx.fillStyle='magenta';sz=g.manager.flash?3:1;
        }
        else if (e.flashing && g.manager.flash) {ctx.fillStyle=House.colors[e.state];sz=2}
        else ctx.fillStyle='rgba(100,100,100,0.75)'
        ctx.fillRect(g.camera.x+x-sz/2,g.camera.y+y-sz/2, sz, sz)
    });
};
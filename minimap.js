function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    ctx.translate(g.camera.x, g.camera.y)
    // ctx.fillStyle='blue';ctx.fillRect(1,1,1, 1)
    ctx.translate(-g.ui.hudWidth, 0)
    ctx.fillStyle='silver';ctx.fillRect(0,0,g.ui.hudWidth,g.ui.height)
    ctx.fillStyle='blue';ctx.fillRect(1,1,g.player.fuel*(g.ui.hudWidth-2)/100, 12)
    ctx.fillStyle='white';ctx.fillText("Fuel",2,11)
    ctx.translate(0, 100)
    ctx.fillStyle='rgba(0,0,0,0.8)'
    ctx.translate(4, 2)
    ctx.fillRect(0,0,40,100)
    g.scene.get(["player", "pizzeria", "house"]).forEach((e)=> {
        let x = e.x/g.ui.bz;
        let y = e.y/g.ui.bz;
        let sz = 1;
        if (e.tag=="player") {ctx.fillStyle='red';sz=g.manager.flash?3:1;}
        else if (e.tag=="pizzeria") {
            ctx.fillStyle='magenta';sz=g.manager.flash?3:1;
        }
        else if (e.flashing && g.manager.flash) {ctx.fillStyle=House.colors[e.state];sz=2}
        else if (e.state) {ctx.fillStyle=House.colors[e.state];sz=1}
        else ctx.fillStyle='rgba(100,100,100,0.75)'
        ctx.fillRect(x-sz/2,y-sz/2, sz, sz)
    });
};
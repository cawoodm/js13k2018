function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    if (false) {
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(g.camera.x,g.camera.y,g.ui.canvas.width,g.ui.canvas.height)
    // Drop shadow
    ctx.beginPath();
    ctx.fillStyle="rgba(100,100,0,1)"
    let offX = 0, offY = 0;
    switch (g.player.frame) {
        case 0: offX = g.ui.blockSize; offY=g.ui.blockSize*0.75; break;
        case 1: offX = -g.ui.blockSize*0.25; offY=g.ui.blockSize*0.25; break;
        case 2: offY = -g.ui.blockSize; break;
        case 3: offY = g.ui.blockSize;  break;
    }
    ctx.ellipse(g.player.x+offX, g.player.y+offY, g.ui.blockSize/2.5, g.ui.blockSize/5, 0, 0, 2 * Math.PI);
    ctx.fill();
    }

    ctx.translate(-g.ui.hudWidth/g.ui.scale.x, 100)
    ctx.fillStyle='rgba(0,0,0,0.8)'
    ctx.fillRect(g.camera.x+2,g.camera.y+2,40,100)
    g.scene.get(["player", "pizzeria", "house"]).forEach((e)=> {
        let x = e.x/g.ui.blockSize;
        let y = e.y/g.ui.blockSize;
        let sz = 1;
        if (e.tag=="player") {
            ctx.fillStyle='red';sz=g.manager.flash?2:1;
        }
        else if (e.tag=="pizzeria") {
            ctx.fillStyle='magenta';sz=g.manager.flash?2:1;
        }
        else if (e.flashing && g.manager.flash) {ctx.fillStyle='white';sz=2}
        else ctx.fillStyle='rgba(100,100,100,0.75)'
        ctx.fillRect(g.camera.x+x-sz/2,g.camera.y+y-sz/2, sz, sz)
    });
}

function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    ctx.translate(g.camera.x, g.camera.y)
    
    g.rect(0,0,g.ui.width, 20, 'rgba(100,100,100,0.75)')
    ctx.font = '8pt Consolas'
    ctx.fillStyle='white';
    ctx.fillText("$" + g.manager.money, g.ui.width-100, 13)

    ctx.fillText(g.manager.prospects.length + " waiting...", 10, 13)
    ctx.fillText(g.manager.orders.length + " orders", 110, 13)

    ctx.translate(-g.ui.hudWidth, 0)
    g.rect(0,0,g.ui.hudWidth,g.ui.height,'gray')
    g.rect(1,1,g.player.fuel*(g.ui.hudWidth-2)/100, 12, 'blue')
    ctx.font = '8pt Consolas'
    ctx.fillStyle='white';ctx.fillText("Fuel " + Math.round(g.player.fuel),2,11)

    ctx.translate(0, 10)
    for (let i=0; i<g.manager.customers.length; i++) {
        let c = g.manager.customers[i];
        if (!c.mX) c.mX = rnd(0, g.ui.hudWidth-g.ui.bz);
        if (!c.mY) c.mY = rnd(0, g.ui.height-110-g.ui.bz);
        g.sprites.sat[c.satisfaction].renderer(ctx, 1+c.mX, 1+c.mY)
    }
    for (let i=0; i<g.manager.lost.length; i++) {
        let c = g.manager.lost[i];
        if (!c.mX) c.mX = rnd(0, g.ui.hudWidth-g.ui.bz);
        if (!c.mY) c.mY = rnd(0, g.ui.height-110-g.ui.bz);
        g.sprites.sat[c.satisfaction].renderer(ctx, 1+c.mX, 1+c.mY)
    }

    ctx.translate(0, 200)
    ctx.translate(4, 2)
    g.rect(0,0,40,100,'rgba(0,0,0,0.8)')
    g.scene.get(["player", "pizzeria", "house"]).forEach((e)=> {
        let x = e.x/g.ui.bz;
        let y = e.y/g.ui.bz;
        let sz = 1;
        if (e.tag=="player") {ctx.fillStyle='yellow';sz=g.manager.flash?3:1;}
        else if (e.tag=="pizzeria") {
            ctx.fillStyle='magenta';sz=g.manager.flash?3:1;
        }
        else if (e.flashing && g.manager.flash) {ctx.fillStyle=House.colors[e.state];sz=2}
        else if (e.state) {ctx.fillStyle=House.colors[e.state];sz=1}
        else ctx.fillStyle='rgba(100,100,100,0.75)'
        if (e.satisfaction==0) {ctx.fillStyle='red';sz=2}
        else if (e.satisfaction==1) ctx.fillStyle='orange';
        else if (e.satisfaction==2 && e.customer) {ctx.fillStyle='green';sz=3;}
        ctx.fillRect(x-sz/2,y-sz/2, sz, sz)
    });
};
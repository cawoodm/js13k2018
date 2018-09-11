function GameTitle() {
    this.texts = [
        "The Internet DIED!",
        "Everyone is OFFLINE!!",
        "But they need their PIZZA!!!",
        "As the only PSYCHIC in town...",
        "...only YOU can save them!",
        "1) Travel to the needy",
        "2) <SPACEBAR> takes the order",
        "3) Return to the pizzeria",
        "4) <SPACEBAR> to deliver pizza",
        "Keep the hungry happy",
        "Try not to lose customers",
        "GOOD LUCK!",
        ""
    ];
    this.frame=0;
    this.lasttick=g.ticker.ticks;
}
GameTitle.prototype.renderer = function(ctx) {
    ctx.fillStyle='#333';
    g.rect(0, 0, g.ui.width, g.ui.height)
    ctx.fillStyle='#EEE';
    ctx.font='20pt Consolas';
    ctx.fillText("OFFLINE PIZZA", 20, 40)
    if (g.ticker.ticks - this.lasttick > 90) this.nextFrame();
    if (this.frame==this.texts.length) return g.restart(false);
    ctx.font='12pt Consolas';
    let off = 0;
    for (let i=0; i<this.frame; i++)
        ctx.fillText(this.texts[i], 20, 80+20*i);
};
GameTitle.prototype.nextFrame = function() {
    this.frame++;
    this.lasttick=g.ticker.ticks;
};

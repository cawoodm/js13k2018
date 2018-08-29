g.sound = {
    prospect: [11,11],
    order: [11,6,5],
    delivery: [11,6,5],
}
g.sound.play = function(snd, tempo, tone) {
    tempo = tempo/1000 || .09
    tone = tone | 660
    snd = g.sound[snd]||snd;
    with(new AudioContext)with(G=createGain())for(i in D=snd)with(createOscillator())if(D[i])
        connect(G),G.connect(destination),start(i*tempo),
        frequency.setValueAtTime(tone*1.06**(13-D[i]),i*tempo),
        gain.setValueAtTime(1,i*tempo),
        gain.setTargetAtTime(.0001,i*tempo+.08,.005),
        stop(i*tempo+.09)
}
//g.sound.play("order", 100+rnd(-10,10), 440+rnd(-100, 100))
//g.sound.play("delivery", 100+rnd(-10,10), 440+rnd(-100, 100))
//g.sound.play("order", 100, 440)
//g.sound.play("delivery", 100, 440)
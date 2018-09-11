g.sound = {
    prospect: [11,11,11,11,11],
    order: [4,6,5],
    delivery: [11,6,5],
    lost: [17,19,22],
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

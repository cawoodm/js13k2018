/*global g*/
g.init = function() {
	g.ui.blockSize=32
    g.ui.blocksInView=10

    // g.ui.canvas = document.getElementById("c");
    // g.ctx = g.ui.canvas.getContext("2d");

    // Separate canvas for background (drawn once)
    g.ui.canvas0 = document.createElement("canvas");
    g.ctx0 = g.ui.canvas0.getContext("2d");
    
	g.ui.scale = {x: 2, y: 2};
    g.ui.canvas.width=g.ui.blocksInView*g.ui.blockSize*g.ui.scale.x;
    g.ui.canvas.height=g.ui.blocksInView*g.ui.blockSize*g.ui.scale.y;

	g.ctx.scale(g.ui.scale.x, g.ui.scale.y);
	// We want pixelated scaling:
	g.ctx.imageSmoothingEnabled=false

	g.ImageLoader.add("tilemap", "./resources/tilemap.png");
	g.ImageLoader.add("spritemap", "./resources/spritemap.png");

	return ()=>{g.ready()}
}
g.ready = function() {
    g.restart(false)
};
g.restart = function(title) {
	// Cleanup
	g.Halt();
    g.scene = new g.Scene();
    g.loadMap();
    g.drawMap();
	g.level=0;
	if (title) {
        g.state="title";
		g.scene.add(new GameTitle());
	} else {
        // New Game
        g.camera = g.scene.add(new Camera({x: 24*g.ui.blockSize, w: g.ui.blocksInView*g.ui.blockSize, h: g.ui.blocksInView*g.ui.blockSize, box: 200}));
        g.collider = g.scene.add(new Collider);
		g.manager = g.scene.add(new GameManager());
        g.player = g.scene.add(new Player({x: 28*g.ui.blockSize, y: 37*g.ui.blockSize, velocity: 2}));
	    // Mobile version can't have music and sfx
	    //if (!navigator.userAgent.match(/iPhone|iPod|iPad/)) g.sounds.music.play();
        g.loadScene();
        g.state="play";
	}
	g.Start();
};
g.loadScene = function(level) {
    let mapWidth = g.map[0].length;
    let mapHeight = g.map.length;
	for (let y = 0; y < mapHeight; y++) for (let x = 0; x < mapWidth; x++) {switch(g.map[y][x]) {
		//case 3: g.scene.add(new House({x: x*g.ui.blockSize, y: y*g.ui.blockSize})); break;
		//case -1: g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize}); break;
		//case 15: g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize}); break;
		//case 16: g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize}); break;
	}}
	return true;
}
g.gameWon = function() {
	// g.state="message";
	// g.scene.remove(g.collider); //Stop collisions
	// g.scene.add(new GameWon());
	// g.sounds.music.pause();g.sounds.music.currentTime=0;
};
g.gameOver = function() {
	// g.state="message";
	// g.scene.remove(g.collider); //Stop collisions
	// g.scene.add(new GameOver());
	// g.sounds.music.pause();g.sounds.music.currentTime=0;
	// g.sounds.lose.play();
};
g.preGameRender = function(ctx) {
    // Draw background
    g.ctx.drawImage(g.ui.canvas0, g.camera.x, g.camera.y, 320, 320, 0, 0, 320, 320)
};
g.loadMap = function() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");;
    let img = g.ImageLoader.get["tilemap"];
    ctx.drawImage(img, 0, 0)
    let data = ctx.getImageData(0, 0, img.width, img.height).data;
    let palette = [];
    g.map = [];
    for (let y = 0; y < img.height; y++) {
        let row = []; row.length=img.width;
        for (let x = 0; x < img.width; x++) {
            let i = (y*img.width+x)*4;
            let col = [data[i], data[i+1], data[i+2], data[i+3]]
            // First row of image is the palette
            if (y==0 && x<img.width) palette.push(col)
            else {
                // Find the color
                for (let p=0; p<palette.length; p++)
                    if (col[0] === palette[p][0] && col[1] === palette[p][1] && col[2] === palette[p][2]) {
                        row[x]=p;
                        break;
                    }
            }
        }
        if (y>0) g.map.push(row)
    }
    //dp(JSON.stringify(g.map))
};
g.drawMap = function() {
    // Draw static map to hidden canvas0
    let spriteSize = g.ui.blockSize;
    let mapWidth = g.map[0].length;
    let mapHeight = g.map.length;
    g.ui.canvas0.width = mapWidth * spriteSize;
    g.ui.canvas0.height = mapHeight * spriteSize;
    let ctx = g.ctx0;

    ctx.fillStyle='#DDD';
    ctx.fillRect(0, 0, g.ui.canvas0.width, g.ui.canvas0.height);
    let spriteSheet = g.ImageLoader.get["spritemap"];
    
    // Land background is green
    for (let y = 0; y < mapHeight; y++)
        for (let x = 0; x < mapWidth; x++)
            if (g.map[y][x]>2) // If not landscape
                ctx.drawImage(spriteSheet, 2*spriteSize, 0, spriteSize, spriteSize, x*spriteSize, y*spriteSize, spriteSize, spriteSize);
    for (let y = 0; y < mapHeight; y++)
        for (let x = 0; x < mapWidth; x++) {
            ctx.globalAlpha=1;
            let y1 = 0;
            let y2 = 1;
            let y3 = 0;
            let rand = Math.random();
            // Sea, Sand and Grass alpha variations
            if (g.map[y][x]==0) ctx.globalAlpha=0.9 + rand*0.1;
            if (g.map[y][x]==1) ctx.globalAlpha=0.5 + rand*0.4;
            if (g.map[y][x]==2) ctx.globalAlpha=0.7 + rand*0.3;
            if (g.map[y][x]==0) { // Sea variations
                if (rand<0.25) y1 = 1;
            }
            if (g.map[y][x]==1) { // Sand variations
                if (rand<0.25) y1 = 1;
                //g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize});
            }
            if (g.map[y][x]==3) { // House variations
                if (rand<0.25) y1 = 1; // Red House
                else if (rand<0.50) y1 = 2; // Black house
                else if (rand<0.75) y1 = 3; // Green house
                else {
                    // Block 
                    g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize})
                    g.map[y][x]=-1 
                    continue; // No house
                }
                g.scene.add(new House({x: x*g.ui.blockSize, y: y*g.ui.blockSize}));
            }
            if (g.map[y][x]==2) { // Grass variations
                if (rand<0.5) y1 = 1;
                else if (rand<0.6) y1 = 2;
                else if (rand<0.7) y1 = 3;
            }
            if (g.map[y][x]==15 || g.map[y][x]==16) { // Building
                g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize});
                y2 = 2;
                y3 = 1;
            }
            if (g.map[y][x]==17) { // Block
                g.scene.add({tag: "block", x: x*g.ui.blockSize, y: y*g.ui.blockSize, w: g.ui.blockSize, h: g.ui.blockSize});
                continue;
            }
            ctx.drawImage(spriteSheet, g.map[y][x]*spriteSize, y1*spriteSize*y2, spriteSize, y2*spriteSize, x*spriteSize, y*spriteSize-y3*spriteSize, spriteSize, spriteSize*y2);
        }
}
g.ui.keys = {
	left: Keyboard(["KeyA", "ArrowLeft"]) // left arrow
	,right: Keyboard(["KeyD", "ArrowRight"]) // right arrow
	,up: Keyboard(["KeyW", "ArrowUp"])
	,down: Keyboard(["KeyS", "ArrowDown"])
	,fire: Keyboard("Space") // space
	,fireM: Keyboard("click") // Mouse click
	,debug: Keyboard("clickCtrl") // Mouse click
};
g.ui.keys.left.down = function() {
    if (g.state=="pause") return g.Pause();
    if (g.state!="play") return;
	g.player.move(Vector.left())
};
g.ui.keys.right.down = function() {
    if (g.state=="pause") return g.Pause();
	if (g.state!="play") return;
	g.player.move(Vector.right())
};
g.ui.keys.up.down = function() {
    if (g.state=="pause") return g.Pause();
    if (g.state!="play") return;
	g.player.move(Vector.up())
};
g.ui.keys.down.down = function() {
    if (g.state=="pause") return g.Pause();
    if (g.state!="play") return;
	g.player.move(Vector.down())
};
g.ui.keys.fire.press = function(e) {
	if (g.state=="message") return;
	if (g.state!="play") return g.restart();
	if (!e || !e.touches) g.player.shoot();
	return;
	x = e.touches[0].clientX / g.ui.scaleX;
	y = e.touches[0].clientY / g.ui.scaleY;
	if (y > g.ui.height/4 && y < g.ui.height*3/4) {
		if (x < g.ui.width/4) return g.ui.keys.left.down()
		else if (x > g.ui.width*3/4) return g.ui.keys.right.down()
	} else if (x > g.ui.width/4 && x < g.ui.width*3/4) {
		if (y < g.ui.height/4) return g.ui.keys.up.down()
		else if (y > g.ui.height*3/4) return g.ui.keys.down.down()
	}
}
g.ui.keys.fireM.press = g.ui.keys.fire.press;
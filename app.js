const g = {};

// Useful functions
const dp = console.log
const $ = document.querySelector.bind(document);
const rnd = function(min, max) {return Math.round(Math.random() * (max - min) + min)};
const rnda = function(arr) {return arr[rnd(0, arr.length-1)]};
const btw = (a, b, c)=>{return (a>=b) && (c>=a)}

// Measure screen
g.ui = {};
g.ui.win = {
    width: window.innerWidth||document.documentElement.clientWidth||document.body.offsetWidth
    ,height: window.innerHeight||document.documentElement.clientHeight||document.body.offsetHeight
};
document.body.style.padding=document.body.style.margin="0px";
document.body.style.width=window.innerWidth+'px'
document.body.style.height=window.innerHeight+'px'
g.ui.canvas = document.createElement("canvas");
document.body.appendChild(g.ui.canvas);
g.ctx = g.ui.canvas.getContext("2d");
//g.ctx.imageSmoothingEnabled=false;
// Canvas must exactly fit window or we have mobile swipe woes
g.ui.canvas.width=g.ui.win.width;
g.ui.canvas.height=g.ui.win.height;

// ImageLoader: Handles image loading
g.ImageLoader = {
    get: {},
    loaded: 0,
    imageCount: 0,
    onloadCallBack: null,
    checkLoaded: function() {
        this.loaded++;
        if (this.loaded == this.imageCount && typeof this.onloadCallBack == "function") this.onloadCallBack();
    },
    add: function(name, src) {
        let img = new Image();
        img.src = src;
        let that=this;
        img.onload = this.checkLoaded.bind(this);
        this.get[name]=img;
        this.imageCount++;
    },
    onload: function(fcn) {
        this.onloadCallBack=fcn;
        if (this.imageCount==0) fcn();
    }
}

// Ticker: Handles the game loop
Ticker = function(fps, updateCallBack, renderCallback) {
	this.state = "stop";
	this._fps = fps;
	this.ticks = 0;
	this._frameMillis = 1000 / fps;
	this._updateCallBack = updateCallBack;
	this._renderCallback = renderCallback;
};
Ticker.prototype.start = function() {
	this.state = "go";
	this.lastUpdate=this.lastDraw=window.performance.now();
	this.loop();
};
Ticker.prototype.loop = function() {
	if (this.state=="stop") return;
	window.requestAnimationFrame(this.loop.bind(this));
	this.ticks++;
	let now = window.performance.now();
    let drawDiff = now - this.lastDraw;
    this.actualFPS = 1000/drawDiff;
    let updateDiff = now - this.lastUpdate||0;
	// 2s passed without drawing -> halt game
	if (drawDiff>20000) g.Pause();//return this.state="stop";
	this._updateCallBack(updateDiff/this._frameMillis);
	this.lastUpdate = now;
	// if enough time has elapsed, draw the next frame
	if (drawDiff > this._frameMillis) {
		this.lastDraw = now - (drawDiff % this._frameMillis);
		this._renderCallback();
	}
};
Ticker.prototype.stop = function() {this.state="stop";};

// Sprite: Draw an image on the screen
function Sprite(options) {
	this.x = options.x || 0;
	this.y = options.y  || 0;
	this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.offX = options.offX || 0;
    this.offY = options.offY || 0;
    this.scale = options.scale || 1;
    this.center = options.center || false;
    this.img = g.ImageLoader.get[options.sprite||"sprites"];
    return this;
}
Sprite.prototype.renderer = function(ctx) {
    ctx.save();
    this.offW = this.w * this.scale;
    this.offH = this.h * this.scale;
    if (this.center) g.ctx.translate(-this.offW/2, -this.offH/2)
    ctx.drawImage(this.img, this.offX, this.offY, this.w, this.h, this.x, this.y, this.offW, this.offH);
    ctx.restore();
}

// Keyboard: Input stuff
function Keyboard(keyCode) {
	var key = {};
	key.codes = Array.isArray(keyCode)?keyCode:[keyCode];
	key.isDown = false;
	key.isUp = true;
	key.downHandler = function(event) {
		if (key.codes.includes(event.code)) {
			if (key.down) key.down();
			else if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
			event.preventDefault();
		}
	};
	key.upHandler = function(event) {
		if (key.codes.includes(event.code)) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
			event.preventDefault();
		}
    };
	key.clickHandler = function(event) {
		key.press(event);
	}
    if (keyCode!=="click") {
		window.addEventListener("keydown", key.downHandler.bind(key), false);
		window.addEventListener("keyup", key.upHandler.bind(key), false);
	} else {
		document.addEventListener("touchstart", key.clickHandler.bind(key), false);
	}
	return key;
}

// Vector: Vector stuff
const Vector = {
    norm: (vec)=>{let m = Vector.mag(vec);return m==0?{x:0, y:0}:{x: vec.x/m, y: vec.y/m}},
    mag: (vec)=>{return Math.sqrt(Math.pow(vec.x, 2)+Math.pow(vec.y, 2))},
    subtract: (v1, v2)=>{return {x: v1.x-v2.x, y: v1.y-v2.y}},
    right: ()=>{return {x: 1, y: 0}},
    left: ()=>{return {x: -1, y: 0}},
    up: ()=>{return {x: 0, y: -1}},
    down: ()=>{return {x: 0, y: 1}}
}

// Scene Manager: Entitie and suchlike
g.Scene = function(options) {
    options = options || {};
    this.entities = options.entities || [];
    return this;
}
g.Scene.prototype.add = function(ent) {
	this.entities.push(ent);
	return ent;
};
g.Scene.prototype.insert = function(ent) {
	this.entities.splice(0, 0, ent);
	return ent;
};
g.Scene.prototype.remove = function(ent) {
	if (typeof ent.length == "number") ents = ent; else ents = [ent]
	for(let j=0; j < ents.length; j++)
		for(let i=0; i < this.entities.length; i++)
			if (this.entities[i] == ents[j]) this.entities.splice(i,1);
};
g.Scene.prototype.get = function(tag) {
	result=[];
	this.entities.forEach(function(ent) {
		if (!tag || ent.tag === tag || Array.isArray(tag) && tag.includes(ent.tag)) result.push(ent);
	}, this);
	return result;
};
g.Scene.prototype.count = function(tag) {
	return this.get(tag).length;
};

// Game control stuff
g.Start = function(fps) {
    fps=fps||60;
	this.ticker = new Ticker(fps, function(delta) {
		g.GameUpdate(delta);
	}, function() {
		g.GameRender();
	});
	g.ticker.start();
};
g.Pause=function() {
	if (g.state=="gameOver") {
		g.restart();
	} else if (g.ticker.state=="stop") {
		g.state="play";
		g.ticker.start();
	} else {
		g.ticker.stop();
		if (g.sounds && g.sounds.music) g.sounds.music.pause();
		g.state="pause";
	}
};
g.Halt=function(state){
	if (!g.ticker) return;
	g.ticker.stop();
	g.state=state||"halt";
}
g.Step=function() {
	g.GameUpdate(1);
	g.GameRender();
}
g.GameUpdate = function(delta) {
    if (typeof g.preGameUpdate=="function") g.preGameUpdate(delta);
	g.scene.entities.forEach(function(ent) {
		if (typeof ent.update === "function") ent.update(delta);
	}, this);
    if (typeof g.postGameUpdate=="function") g.postGameUpdate();
};
g.GameRender = function() {
	g.ctx.clearRect(0, 0, g.ui.win.width/g.ui.scale.x, g.ui.win.height/g.ui.scale.y);
	g.ctx.save();
    if (typeof g.preGameRender=="function") {
		g.ctx.save();
		g.preGameRender(g.ctx);
		g.ctx.restore();
	}
	if (g.camera) g.ctx.translate(-g.camera.x, -g.camera.y)

	g.scene.entities.forEach(function(ent) {
		if (typeof ent.renderer !== "function") return;
		if (ent.noRender) return;
		if (g.camera && !g.camera.canSee(ent)) return;
		g.ctx.save();
		if (ent.static && g.camera) g.ctx.translate(g.camera.x, g.camera.y)
		ent.renderer(g.ctx);
		g.ctx.restore();
    }, this);
    if (typeof g.postGameRender=="function") {
		g.ctx.save();
		g.postGameRender(g.ctx);
		g.ctx.restore();
	}
	g.ctx.restore();
};

// Placeholders
g.init = function(title){dp("No game defined in g.init(). Start coding!")}
g.restart = function(title){dp("No game defined in g.restart(). Start coding!")}

// Wait for page to load, sprites to load and start game
window.addEventListener("load", function() {
    let start = g.init();
	g.ImageLoader.onload(start);
});Camera = function(options) {
    this.x=options.x||0;
    this.y=options.y||0;
    this.w=options.w||500;
    this.h=options.h||500;
    this.tag = options.tag||"camera";
    this.box={x:0, y:0, w: options.box||300, h: options.box||300}
}
Camera.prototype.update = function() {
    // Let box follow player if player reaches box's bounds
    if (g.player.x<this.box.x) this.box.x = g.player.x;
    if (g.player.x+g.player.w>this.box.x+this.box.w) this.box.x = g.player.x+g.player.w-this.box.w;
    if (g.player.y<this.box.y) this.box.y = g.player.y;
    if (g.player.y+g.player.h>(this.box.y+this.box.h)) this.box.y = g.player.y+g.player.h-this.box.h;
    
    // Keep camera centered on the box around the player
    let boxCenter = {x: this.box.x+this.box.w/2, y: this.box.y+this.box.h/2}
    let camCenter = {x: this.x+this.w/2, y: this.y+this.h/2}
    if (boxCenter.x!=camCenter.x || boxCenter.y!=camCenter.y) {
        this.x += boxCenter.x-camCenter.x;
        this.y += boxCenter.y-camCenter.y;
    }
}
// canSee: Can the camera "see" this object?
Camera.prototype.canSee = function(obj) {
    // If we are a static (UI) element or without size then always show
    if (obj.static || typeof obj.w === "undefined" || typeof obj.h === "undefined") return true;
    let x1 = this.x;
	let X1 = this.x + this.w;
	let y1 = this.y;
	let Y1 = this.y + this.h;
	let x2 = obj.x;
	let X2 = obj.x + obj.w;
	let y2 = obj.y;
    let Y2 = obj.y + obj.h;
    let xOverlap = btw(x2, x1, X1) || btw(X2, x1, X1) || btw(x1, x2, X2) || btw(X1, x2, X2);
    let yOverlap = btw(y2, y1, Y1) || btw(Y2, y1, Y1) || btw(y1, y2, Y2) || btw(Y1, y2, Y2);
    return xOverlap && yOverlap;
}
Camera.prototype.renderer = function(ctx) {
    if (!Camera.debug) return;
    g.ctx.strokeStyle='#00F'
    g.ctx.strokeRect(this.box.x, this.box.y, this.box.w, this.box.h)
    g.ctx.fillStyle='#F00'
    g.ctx.fillRect(this.x+this.w/2-2, this.y+this.h/2-5, 4, 10)
    g.ctx.fillStyle='#00F'
    g.ctx.strokeRect(this.box.x+this.box.w/2-5, this.box.y+this.box.h/2-5, 10, 10)
}
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
function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.level = 1;
    this.houses = g.scene.get("house")
    shuffleArray(this.houses)
    this.prospects = []
    return this;
}
GameManager.prototype.update = function(dt) {
    if (g.ticker.ticks % 30 == 0) {
        if (this.prospects.length < 2* this.level) this.getNewHungryHouse();
        this.flash = !this.flash;
    }
}
GameManager.prototype.renderer = function(ctx) {
    ctx.fillStyle = 'white'
    ctx.fillText(Math.round(g.ticker.actualFPS/10)+"0", 10, 10)
}
GameManager.prototype.vanStops = function() {
    this.prospects.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            h.placeOrder();
        }
    });
    if (Math.round(g.player.distanceFrom(g.pizzeria)) <= 1) {
        dp("home")
    }
}
GameManager.prototype.getNewHungryHouse = function() {
    for (i=0; i<this.houses.length; i++) {
        let h = this.houses[i];
        if (this.prospects.includes(h)) continue;
        // Is this house within 5 x level blocks of the pizzeria?
        if (h.distanceFrom(g.pizzeria) < this.level*5) {
            return this.prospects.push(h.readyToOrder())
        }
    }
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.flashColor = '';
    this.ordered = 0;
    return this;
};
House.prototype.update = function(dt) {
    //if (this.ordered) tween to impatience(red)
};
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        ctx.strokeStyle='#fff';
        if (this.ordered>0) ctx.strokeStyle='#00f';
        ctx.lineWidth='3';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
};
House.prototype.readyToOrder = function() {
    this.flashColor='white'
    this.flashing = true
    this.ordered = 0;
    return this
};
House.prototype.placeOrder = function() {
    this.flashColor='blue'
    this.flashing = true
    this.ordered = g.ticker.ticks;
    return this
};
House.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};function MiniMap() {
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
        else if (e.flashing && g.manager.flash) {ctx.fillStyle=e.flashColor;sz=3}
        else ctx.fillStyle='rgba(100,100,100,0.75)'
        ctx.fillRect(g.camera.x+x-sz/2,g.camera.y+y-sz/2, sz, sz)
    });
};function Pizzeria() {
    this.pizzas = [];
    this.orders = [];
}
function Player(options) {
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.pizzas = [];
    this.sprite = new Sprite({sprite: "spritemap", w: this.w, h: this.h, offX: 32*4, offY: 96, scale: 1});
    this.collider=0;
    this.tag='player';
    this.acc={x:0, y:0};
    this.speed={x:0, y:0};
    this.velocity = options.velocity || 5;
    this.frame=0;
    this.bulletSpeed=15;
    g.collider.check(this, ["house", "block"], (e1, e2)=>{g.player.stop()}) 
    return this;
}
Player.prototype.update = function(delta) {
    if (g.state!="play") return;
    if (this.nextMove) this.move(this.nextMove);
    this.speed.x += this.acc.x * delta;
    this.speed.y += this.acc.y * delta;
    this.x += this.speed.x;// * delta;
    this.y += this.speed.y;//    * delta;
    if (this.speed.x>0) this.frame=0;
    else if (this.speed.x<0) this.frame=1;
    else if (this.speed.y<0) this.frame=2;
    else if (this.speed.y>0) this.frame=3;
}
Player.prototype.renderer = function(ctx) {
    if (false) {
    // Drop shadow
    ctx.beginPath();
    ctx.fillStyle="rgba(100,100,100,0.5)"
    let offX = 0, offY = 0;
    switch (this.frame) {
        case 0: offX = g.ui.bz; offY=g.ui.bz*0.75; break;
        case 1: offX = -g.ui.bz*0.25; offY=g.ui.bz*0.25; break;
        case 2: offY = -g.ui.bz; break;
        case 3: offY = g.ui.bz;  break;
    }
    ctx.ellipse(this.x+offX, this.y+offY, g.ui.bz/2.5, g.ui.bz/5, 0, 0, 2 * Math.PI);
    ctx.fill();
    }
    this.sprite.x=this.x;
    this.sprite.y=this.y;
    this.sprite.offX=g.ui.bz*4+this.frame*(g.ui.bz);
    this.sprite.renderer(ctx);
}
Player.prototype.move = function(dir) {
    this.nextMove = null;
    if (dir.x*this.velocity==this.speed.x && dir.y*this.velocity==this.speed.y) return this.stop();
    let oldSpeed = {x: this.speed.x, y: this.speed.y};
    let ghost = {tag: "ghost", x: this.x, y: this.y, w: this.w, h: this.h, speed: {x: dir.x*this.velocity, y: dir.y*this.velocity}}
    let wouldCollide = Collider.collide(ghost, ["house", "block"], 0);
    let isColliding = Collider.collide(this, ["house", "block"], 1);
    let stationary = this.speed.x+this.speed.y==0;
    // Move up/down only if on X-grid (left/right)
    let onGrid = (dir.y!==0 && this.x % g.ui.bz == 0)||(dir.x!==0 && this.y % g.ui.bz == 0);
    //dp( this.x % g.ui.bz == 0)
    //dp(isColliding, wouldCollide, stationary, onGrid, this.x, this.x);
    if (isColliding && wouldCollide) {
        // Do nothing
    } else if (stationary && !wouldCollide) {
        // Move now
        this.speed = ghost.speed;
    } else if (wouldCollide || !onGrid) {
        // If we can't move now, move later
        this.nextMove=dir;
    } else {
        // Move now
        this.speed = ghost.speed;
    }
}
Player.prototype.shoot = function() {
    this.stop();
}
Player.prototype.stop = function() {
    this.speed={x: 0, y:0};
    g.manager.vanStops();
}
Player.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};/*global g*/
g.init = function() {
	g.ui.bz=32
    g.ui.blocksInView=10

    // g.ui.canvas = document.getElementById("c");
    // g.ctx = g.ui.canvas.getContext("2d");

    // Separate canvas for background (drawn once)
    g.ui.canvas0 = document.createElement("canvas");
    g.ctx0 = g.ui.canvas0.getContext("2d");
    
    g.ui.hudWidth = 100;
    g.ui.scale = {x: 2, y: 2};
    g.ui.canvas.width=g.ui.hudWidth+g.ui.blocksInView*g.ui.bz*g.ui.scale.x;
    g.ui.canvas.height=g.ui.blocksInView*g.ui.bz*g.ui.scale.y;
    g.ui.canvas.style.position = "absolute";
    g.ui.canvas.style.left = 0.5*g.ui.blocksInView*g.ui.bz*g.ui.scale.y + "px";

	g.ctx.translate(g.ui.hudWidth, 0);
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
        g.camera = g.scene.add(new Camera({x: 24*g.ui.bz, w: g.ui.blocksInView*g.ui.bz, h: g.ui.blocksInView*g.ui.bz, box: 200}));
        g.collider = g.scene.add(new Collider);
		g.manager = g.scene.add(new GameManager());
		g.minimap = g.scene.add(new MiniMap());
        g.player = g.scene.add(new Player({x: 28*g.ui.bz, y: 37*g.ui.bz, velocity: 2}));
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
		//case 3: g.scene.add(new House({x: x*g.ui.bz, y: y*g.ui.bz})); break;
		//case -1: g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz}); break;
		//case 15: g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz}); break;
		//case 16: g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz}); break;
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
g.postGameRender = function(ctx) {
    // Draw background
    g.minimap.draw(ctx);
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
    let spriteSize = g.ui.bz;
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
            //if (g.map[y][x]==2) ctx.globalAlpha=0.7 + rand*0.3;
            if (g.map[y][x]==0) { // Sea variations
                if (rand<0.25) y1 = 1;
            }
            if (g.map[y][x]==1) { // Sand variations
                if (rand<0.25) y1 = 1;
                //g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
            }
            if (g.map[y][x]==3) { // House variations
                if (rand<0.25) y1 = 1; // Red House
                else if (rand<0.50) y1 = 2; // Black house
                else if (rand<0.75) y1 = 3; // Green house
                else {
                    // Block 
                    g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz})
                    g.map[y][x]=-1 
                    continue; // No house
                }
                g.scene.add(new House({x: x*g.ui.bz, y: y*g.ui.bz}));
            }
            if (g.map[y][x]==2) { // Grass variations
                ctx.drawImage(spriteSheet, 2*spriteSize, y1*spriteSize*y2, spriteSize, y2*spriteSize, x*spriteSize, y*spriteSize-y3*spriteSize, spriteSize, spriteSize*y2);
                continue; // No house
                if (rand<0.5) y1 = 1;
                else if (rand<0.6) y1 = 2;
                else if (rand<0.7) y1 = 3;
            }
            if (g.map[y][x]==15) { // Pizzeria
                g.pizzeria = g.scene.add({tag: "pizzeria", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
                y2 = 2;
                y3 = 1;
            }
            if (g.map[y][x]==16) { // High building
                g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
                y2 = 2;
                y3 = 1;
            }
            if (g.map[y][x]==17) { // Block
                g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
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
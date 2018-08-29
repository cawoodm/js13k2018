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
Sprite.prototype.renderer = function(ctx, x, y) {
	ctx.save();
	this.x=x||this.x;
	this.y=y||this.y;
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
});
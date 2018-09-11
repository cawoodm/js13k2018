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
Sprite.prototype.renderer = function(ctx, x, y, scale) {
	ctx.save();
	this.x=x||this.x;
	this.y=y||this.y;
	this.scale=scale||this.scale;
    this.offW = this.w * this.scale;
    this.offH = this.h * this.scale;
    if (this.center) g.ctx.translate(-this.offW/2, -this.offH/2)
    ctx.drawImage(this.img, this.offX, this.offY, this.w, this.h, this.x, this.y, this.offW, this.offH);
    ctx.restore();
}

// Keyboard: Input stuff
g.Keyboard = function(keyCode) {
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
	g.ctx.clearRect(0, 0, g.ui.canvas.width, g.ui.canvas.height);
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
});function Collider(options) {
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
Camera = function(options) {
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
function Player(options) {
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.pizzas = [];
    this.sprite = new Sprite({w: this.w, h: this.h, offX: 32*4, offY: 96, scale: 1});
    this.collider=0;
    this.tag='player';
    this.acc={x:0, y:0};
    this.speed={x:0, y:0};
    this.velocity = options.velocity || 5;
    this.frame=0;
    this.fuel=100;
    g.collider.check(this, ["house", "block"], (e1, e2)=>{g.player.stop()}) 
    return this;
}
Player.prototype.update = function(delta) {
    if (g.state!="play") return;
    if (Math.round(this.distanceFrom(g.pizzeria)) == 0) g.manager.atPizzeria();
    if (this.nextMove) this.move(this.nextMove);
    this.speed.x += this.acc.x * delta;
    this.speed.y += this.acc.y * delta;
    this.x += this.speed.x;// * delta;
    this.y += this.speed.y;//    * delta;
    if (this.speed.x!=0 || this.speed.y!=0) this.fuel-=0.03;
    if (this.speed.x>0) this.frame=0;
    else if (this.speed.x<0) this.frame=1;
    else if (this.speed.y<0) this.frame=2;
    else if (this.speed.y>0) this.frame=3;
}
Player.prototype.renderer = function(ctx) {
    this.sprite.x=this.x;
    this.sprite.y=this.y;
    this.sprite.offX=g.ui.bz*4+this.frame*(g.ui.bz);
    this.sprite.renderer(ctx);
    g.manager.carrying.forEach((p,i)=>{
        let o = {x: 14, y: 7, xi:-3, yi:0};
        if (this.frame==1) o = {x: 10, y:-2, xi:3, yi:0}
        else if (this.frame==2) o = {x: 19, y:7, xi:0, yi:3}
        else if (this.frame==3) o = {x: 6, y:7, xi:0, yi:-3}
        g.sprites.minipizza.renderer(ctx, this.x+o.x+i*o.xi, this.y+o.y+i*o.yi, 0.5)
    });
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
Player.prototype.stop = function() {
    this.speed={x: 0, y:0};
}
Player.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};function House(options) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w || g.ui.bz;
    this.h = options.h || g.ui.bz;
    this.tag = "house";
    this.lastFlash = 0  ;
    this.flashing = false;
    this.state = 0;
    this.customer = false;
    this.waittime = -1;
    this.satisfaction = -1;
    return this;
};
// House states 0=nothing, 1=waiting to order, 2=ordered, 3=lost customer
House.colors=['', 'white', 'blue', 'red'];
House.prototype.update = function(dt) {
    if (g.ticker.ticks % 60 == 0) {
        // Approx every second
        if (this.state==1) this.waittime+=0.5;
        if (this.state==2) this.waittime++;
        if (this.debug) debugger;
        if (this.waittime>=0 && this.state<3) {
            if (this.waittime/this.patience<0.5) this.satisfaction=2;
            else if (this.waittime < this.patience) this.satisfaction=1;
            else if (this.waittime/this.patience>3) g.manager.loseCustomer(this);
        }
    }
};
House.prototype.renderer = function(ctx) {
    if (this.flashing && g.manager.flash) {
        if (this.state==1) {
            g.sprites.cloud.renderer(ctx, this.x, this.y)
            g.sprites.pizza.renderer(ctx, this.x+6, this.y+4)
        } else if (this.state==2) {
            g.sprites.cloud.renderer(ctx, this.x, this.y)
            g.sprites.pizza.renderer(ctx, this.x+6, this.y+4)
            arc(ctx, this.x+13, this.y+11, 5, this.waittime/this.patience, '#4B1716')
        }
    }
    if (this.state==3) {
        ctx.strokeStyle = House.colors[this.state]
        ctx.lineWidth='2';
        ctx.strokeRect(this.x, this.y, this.w, this.h)
    }
    if (this.satisfaction>=0) {
        g.sprites.sat[this.satisfaction].renderer(ctx, this.x+16, this.y+16)
    }
};
House.prototype.readyToOrder = function() {
    this.patience = Math.round(this.distanceFrom(g.pizzeria))*5;
    this.state=1; // Waiting to order
    this.waittime = 0;
    this.flashing = true
    return this
};
House.prototype.placeOrder = function() {
    this.state=2; // Waiting for order
    this.flashing = true
    this.waittime = 0;
    g.sound.play("order")
    return this
};
House.prototype.deliverOrder = function() {
    this.state=0;
    this.waittime = -1;
    this.customer = true;
    this.flashing=false;
}
House.prototype.distanceFrom = function(ent) {
    return Math.sqrt(Math.pow(ent.x-this.x,2)+Math.pow(ent.y-this.y,2))/g.ui.bz 
};
function arc(ctx, x, y, r, per, col) {
    ctx.beginPath();
    ctx.fillStyle=col
    ctx.moveTo(x,y);
    ctx.arc(x, y, r, -Math.PI/2, per*2*Math.PI-Math.PI/2);
    ctx.closePath();
    ctx.fill();
}function MiniMap() {
    return this;
}
MiniMap.prototype.draw = function(ctx) {
    ctx.translate(g.camera.x, g.camera.y)
    ctx.translate(-g.ui.hudWidth, 0)
    g.rect(0,0,g.ui.hudWidth,g.ui.height,'gray')
    g.rect(1,1,g.player.fuel*(g.ui.hudWidth-2)/100, 12, 'blue')
    ctx.fillStyle='white';ctx.fillText("Fuel " + Math.round(g.player.fuel),2,11)

    ctx.fillStyle = 'white'
    ctx.font = '8pt Consolas'
    ctx.fillText("prospects=" + g.manager.prospects.length, 1, 20)
    ctx.fillText("orders=" + g.manager.orders.length, 1, 30)
    ctx.fillText("money=" + g.manager.money, 1, 40)

    ctx.translate(0, 100)
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
        else if (e.satisfaction==2) ctx.fillStyle='green';
        ctx.fillRect(x-sz/2,y-sz/2, sz, sz)
    });
};function GameManager(options) {
    this.static = true;
    this.flash = false;
    this.level = 1;
    this.houses = g.scene.get("house")
    this.prospects = []
    this.orders = []
    this.carrying=[];
    this.lost = []
    this.customers = []
    this.deliveries=0;
    this.money=0;
    g.sprites = {
        cloud: new Sprite({w: 32, h: 32, offX: 32*4, offY: 32*1}),
        pizza: new Sprite({w: 14, h: 14, offX: 32*5, offY: 32*1}),
        minipizza: new Sprite({w: 14, h: 14, offX: 32*5, offY: 32*1, scale: 0.5}),
        sat: [
            new Sprite({w: 32, h: 32, offX: 32*5, offY: 32*2}),
            new Sprite({w: 32, h: 32, offX: 32*6, offY: 32*2}),
            new Sprite({w: 32, h: 32, offX: 32*4, offY: 32*2})
        ]
    };
    return this;
}
GameManager.prototype.update = function(dt) {
    // Every 1/2 second
    if (g.ticker.ticks % 30 == 0) this.flash = !this.flash;
    // Every 5s
    if (this.prospects.length+this.orders.length==0 || g.ticker.ticks % (60*5) == 0) {
        if (this.prospects.length  < 4*this.level) this.getNewHungryHouse();
    }
    this.level=Math.floor(this.deliveries/6)+1;
}
GameManager.prototype.vanStops = function() {
    this.prospects.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            if (h.state==1) {
                // Take order
                h.placeOrder();
                this.orders.push(h)
                ArrayRemove(this.prospects, h)
            } 
        }
    });
    g.manager.carrying.forEach((h)=>{
        if (Math.round(h.distanceFrom(g.player)) <= 1) {
            // Deliver order
            h.deliverOrder();
            if(!this.customers.includes(h)) this.customers.push(h)
            this.money+=20;
            this.deliveries++;
            g.sound.play("delivery")
            ArrayRemove(this.orders, h)
            ArrayRemove(g.manager.carrying, h)
        }
    });
}
GameManager.prototype.atPizzeria = function() {
    // Transfer all orders into carrying pizzas
    if (g.ticker.ticks%60==0 && this.orders.length>0) {
        let o = this.orders[0];
        g.manager.carrying.push(o)
        ArrayRemove(this.orders, o)
        //this.orders.forEach((o)=>{if(!g.manager.carrying.includes(o)) g.manager.carrying.push(o)});
    }
    if (g.ticker.ticks%10==0)
        if (this.money>0 && g.player.fuel<100) {
            this.money--;
            g.player.fuel++;
        }
}
GameManager.prototype.getNewHungryHouse = function() {
    let possibles=[];
    for (i=0; i<this.houses.length; i++) {
        let h = this.houses[i];
        if (!h.state==0) continue;
        if (h.satisfaction==0) continue;
        // Is this house within 5 x level blocks of the pizzeria?
        if (h.distanceFrom(g.pizzeria) < this.level*6) {possibles.push(h)}
    }
    if (possibles.length==0) return;
    let h = rnda(possibles)
    g.sound.play("prospect")
    return this.prospects.push(h.readyToOrder())
}
GameManager.prototype.loseCustomer = function(h) {
    if (h.state==1) ArrayRemove(this.prospects, this);
    else if (h.state==2) {ArrayRemove(this.orders, this);ArrayRemove(this.carrying, this);}
    this.lost.push(this)
    h.satisfaction = 0;
    h.waittime = 0;
    h.flashing = false
    h.state = 3;
    g.sound.play("lost")
}
//GameManager.prototype.renderer = function(ctx) {}
function ArrayShuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function ArrayRemove(arr, item) {
    for(let i=0; i<arr.length; i++) if (arr[i]===item) return arr.splice(i,1);
}function GameTitle() {
    this.texts = [
        "The Internet DIED!",
        "Everyone is OFFLINE!!",
        "But they need their PIZZA!!!",
        "As the only PSYCHIC in town...",
        "...only YOU can save them!",
        "1) Travel to the needy",
        "2) Press <SPACE> to take their order",
        "3) Drive back to the pizzeria and get the pizza",
        "4) Deliver the pizza with <SPACE>",
        "Keep the hungry happy",
        "Try not to lose customers",
        "GOOD LUCK!"
    ];
    this.frame=0;
}
GameTitle.prototype.renderer = function(ctx) {
    ctx.fillStyle='#FFF';
    ctx.font='20pt Consolas';
    ctx.fillText("OFFLINE PIZZA", 20, 40)
    if (g.ticker.ticks % 180 == 0) this.frame++;
    if (this.frame==this.texts.length) return g.restart(false);
    ctx.font='12pt Consolas';
    ctx.fillText(this.texts[this.frame], 20, 80)
};
/*global g*/
g.init = function() {
	g.ui.bz=32
    g.ui.blocksInView=10
    
    g.ui.hudWidth = 50;
    g.ui.scale = {x: 2, y: 2};
    g.ui.width=g.ui.hudWidth+g.ui.blocksInView*g.ui.bz;
    g.ui.canvas.width=g.ui.width*g.ui.scale.x;
    g.ui.height=g.ui.blocksInView*g.ui.bz;
    g.ui.canvas.height=g.ui.height*g.ui.scale.y;
    g.ui.canvas.style.position = "absolute";
    g.ui.canvas.style.left = g.ui.win.width/2-0.5*g.ui.width*g.ui.scale.x + "px";
    g.ui.canvas.style.top = g.ui.win.height/2-0.5*g.ui.width*g.ui.scale.y + "px";

	g.ctx.scale(g.ui.scale.x, g.ui.scale.y);
	g.ctx.translate(g.ui.hudWidth, 0);
	// We want pixelated scaling:
	g.ctx.imageSmoothingEnabled=false

	g.ImageLoader.add("tilemap", "./tilemap.png");
	g.ImageLoader.add("sprites", "./spritemap.png");

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
        g.state="play";
	}
	g.Start();
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
    if(!g.camera) return;
    g.ctx.drawImage(g.c0, g.camera.x, g.camera.y, 320, 320, 0, 0, 320, 320)
};
g.postGameRender = function(ctx) {
    // Draw background
    if(!g.minimap) return;
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
};
g.rect=function(x,y,w,h,c) {g.ctx.fillStyle=c;g.ctx.fillRect(x,y,w,h)}
g.drawMap = function() {
    // Draw static map to hidden c0
    let bz = g.ui.bz;
    let mw = g.map[0].length;
    let mh = g.map.length;
    let c0 = document.createElement("canvas");g.c0=c0;
    let ctx = c0.getContext("2d");
    c0.width = mw * bz;
    c0.height = mh * bz;

    g.rect(0, 0, c0.width, c0.height, '#DDD');
    let spriteSheet = g.ImageLoader.get["sprites"];
    
    // Land background is green
    for (let y = 0; y < mh; y++)
        for (let x = 0; x < mw; x++)
            if (g.map[y][x]==3) // House, draw green square
                ctx.drawImage(spriteSheet, 2*bz, 3*bz, bz, bz, x*bz, y*bz, bz, bz);
            else if (g.map[y][x]>=2) // If not sea, sand draw grass
                ctx.drawImage(spriteSheet, 2*bz, 0*bz, bz, bz, x*bz, y*bz, bz, bz);
    for (let y = 0; y < mh; y++)
        for (let x = 0; x < mw; x++) {
            ctx.globalAlpha=1;
            let y1 = 0;
            let y2 = 1;
            // Don't put any block to the right of the pizzeria
            if (x>0 && g.map[y][x-1]==15) {
                g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
                continue;
            }
            let rand = Math.random();
            // Sea, Sand and Grass alpha variations
            if (g.map[y][x]==0) ctx.globalAlpha=0.9 + rand*0.1;
            if (g.map[y][x]==1) ctx.globalAlpha=0.7 + rand*0.2;
            if (g.map[y][x]==0 && rand<0.25) y1 = 1; // Sea variations
            if (g.map[y][x]==1 && rand<0.25) y1 = 1; // Sand variations
            if (g.map[y][x]==3) { // House variations
                if (rand<0.25) y1 = 1; // Red House
                else if (rand<0.50) y1 = 2; // Black house
                else if (rand<0.75) y1 = 3; // Green house
                else {
                    // Block 
                    ctx.drawImage(spriteSheet, 2*bz, 0*bz, bz, bz, x*bz, y*bz, bz, bz);
                    g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz})
                    g.map[y][x]=-1 
                    continue; // No house
                }
                // Shadow
                ctx.fillStyle="rgba(70,70,70,0.8)";ctx.fillRect((x+0.8)*bz, (y+0.6)*bz, 0.4*bz, 0.4*bz, )
                g.scene.add(new House({x: x*g.ui.bz, y: y*g.ui.bz}));
            }
            else if (g.map[y][x]==2) { // Grass variations
                if (rand<0.3) y1 = 1; // Tree
                else if (rand<0.5) y1 = 2; // Bush
            }
            else if (g.map[y][x]>=4 && g.map[y][x]<=14) { // Road
                //ctx.drawImage(spriteSheet, 2*bz, 3*bz, bz, bz, x*bz, y*bz, bz, bz);
            }
            else if (g.map[y][x]==15) { // Pizzeria
                g.pizzeria = g.scene.add({tag: "pizzeria", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
                ctx.drawImage(spriteSheet, 0, 2*bz, bz*2, 2*bz, x*bz, (y-1)*bz, bz*2, bz*2);
                continue;
            }
            else if (g.map[y][x]==17) { // Block
                g.scene.add({tag: "block", x: x*g.ui.bz, y: y*g.ui.bz, w: g.ui.bz, h: g.ui.bz});
                continue;
            }
            ctx.drawImage(spriteSheet, g.map[y][x]*bz, y1*bz*y2, bz, y2*bz, x*bz, y*bz, bz, bz*y2);
        }
}
g.ui.keys = {
	left: g.Keyboard(["KeyA", "ArrowLeft"]) // left arrow
	,right: g.Keyboard(["KeyD", "ArrowRight"]) // right arrow
	,up: g.Keyboard(["KeyW", "ArrowUp"])
	,down: g.Keyboard(["KeyS", "ArrowDown"])
	,fire: g.Keyboard("Space") // space
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
	if (g.state=="title") {new AudioContext;return g.restart(false);}
    if (g.state!="play") return g.restart();
    g.manager.vanStops();
};
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

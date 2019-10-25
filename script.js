var board = [];
var reserves = [];
var n_rev = 0;
var game_over = false;
var score = 0;
var timer = 1.0;
var anim_x = 0;
var shift_x = 0;
var board_size = 16;
var highscore = 0;
var ongoingTouches = [];
var touch_max_dist = [];
var prev_tap = null;
var in_anim = false;

function handleStart(evt) {
	evt.preventDefault();
	var el = document.getElementById("game");
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		ongoingTouches.push(copyTouch(touches[i]));
		touch_max_dist.push(0);
	}
}

function handleMove(evt) {
	evt.preventDefault();
	var el = document.getElementById("game");
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	var g_s = el.width / board_size;
	for (var i = 0; i < touches.length; i++) {
		var idx = ongoingTouchIndexById(touches[i].identifier);
		if (idx >= 0) {
			var start_x = ongoingTouches[idx].pageX;
			var start_y = ongoingTouches[idx].pageY;
			var dist_x = touches[i].pageX - start_x;
			var dist_y = touches[i].pageY - start_y;
      if (!game_over && !in_anim){
        if (dist_y < -g_s){
          if (n_rev < (board_size / 4) - 1){
            n_rev += 1;
          }
          ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        }
        if (dist_y > g_s){
          if (n_rev > 0){
            n_rev -= 1;
          }
          ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        }
        if (dist_x > g_s){
          var tmp = reserves[n_rev].pop();
          reserves[n_rev].unshift(tmp);
          ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        }
        if (dist_x < -g_s){
          var tmp = reserves[n_rev].shift();
          reserves[n_rev].push(tmp);
          ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        }
        var dist = Math.sqrt(dist_x * dist_x + dist_y * dist_y);
        if (touch_max_dist[idx] < dist) {
          touch_max_dist[idx] = dist;
        }
      }else{
        ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
      }
		}
	}
}

function handleEnd(evt) {
	evt.preventDefault();
	var el = document.getElementById("game");
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	var g_s = el.width / board_size;
	for (var i = 0; i < touches.length; i++) {
		var idx = ongoingTouchIndexById(touches[i].identifier);
		if (idx >= 0) {
      if (!game_over && !in_anim){
        if (touch_max_dist[idx] < g_s/2){
          if (prev_tap == null){
            prev_tap = copyTouch(ongoingTouches[idx]);
          }else{
            var dist_x = ongoingTouches[idx].pageX - prev_tap.pageX;
            var dist_y = ongoingTouches[idx].pageY - prev_tap.pageY;
            if (Math.sqrt(dist_x * dist_x + dist_y * dist_y) < g_s / 2){
              prev_tap = null;
              checkRound();
            }else{
              prev_tap = copyTouch(ongoingTouches[idx]);
            }
          }
        }
      }
			ongoingTouches.splice(idx, 1);  // remove it; we're done
		  touch_max_dist.splice(idx, 1);  // remove it; we're done
		}
	}
}

function handleCancel(evt) {
	evt.preventDefault();
	console.log("touchcancel.");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		var idx = ongoingTouchIndexById(touches[i].identifier);
		ongoingTouches.splice(idx, 1);  // remove it; we're done
	}
}

function copyTouch(touch) {
	return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function ongoingTouchIndexById(idToFind) {
	for (var i = 0; i < ongoingTouches.length; i++) {
		var id = ongoingTouches[i].identifier;
		if (id == idToFind) {
			return i;
		}
	}
	return -1;    // not found
}

function checkRound(){
	for (var i = 0; i < board_size; i ++){
		if (reserves[n_rev][i] != -1){
			if (board[i] == -1){
				board[i] = reserves[n_rev][i];
			}else{
				game_over = true;
				if (isNaN(highscore) || score > highscore){
					document.cookie = "highscore="+score.toString()+";";
				}
				return;
			}
		}
	}
	var set_count = 0;
	for (var i = 0; i < board_size; i ++){
		if (board[i] == -1) break;
		set_count += 1;
	}
	if (set_count >= 4){
		for (var i = 0; i < board_size; i++){
			reserves[n_rev][i] = -1;
		}
		shift_x = set_count;
		in_anim = true;
	}
	timer = 1.0;
}

function keyDownEvent(e){
	if (game_over) return;
	if (in_anim) return;
	switch(e.keyCode){
		case 32: 
			//space
			checkRound();
			break;
		case 38: 
			//up
			if (n_rev < (board_size / 4) - 1){
				n_rev += 1;
			}
			break;
		case 40: 
			//down
			if (n_rev > 0){
				n_rev -= 1;
			}
			break;
		case 39: 
			//right
			var tmp = reserves[n_rev].pop();
			reserves[n_rev].unshift(tmp);
			break;
		case 37: 
			var tmp = reserves[n_rev].shift();
			reserves[n_rev].push(tmp);
			//left
			break;
	}
}

function keyUpEvent(e){
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function setup(){
	for (var i = 0; i < board_size; i++){
		board.push(-1);
	}
	for (var i = 0; i < board_size / 4; i++){
		reserves.push(genRndRow(4,1));
	}
	var c = document.getElementById("game");
	highscore = parseInt(getCookie("highscore"));
	window.addEventListener('keydown', keyDownEvent, false);
	window.addEventListener('keyup', keyUpEvent, false);
	window.addEventListener('resize', resizeCanvas, false);
	window.addEventListener("touchstart", handleStart, false);
	window.addEventListener("touchend", handleEnd, false);
	window.addEventListener("touchcancel", handleCancel, false);
	window.addEventListener("touchmove", handleMove, false);
	setInterval(function() {
		update();
		draw();
	}, 30);
	resizeCanvas();
}

function draw(){
	var c = document.getElementById("game");
	var ctx = c.getContext("2d");
	ctx.clearRect(0,0,c.width,c.height);
	if (game_over){
		ctx.fillStyle = "#510";
	}else{
		ctx.fillStyle = "#012";
	}
	ctx.fillRect(0,0,c.width,c.height);
	ctx.fillStyle = "#333";
	var g_s = c.width / board_size;
	var g_m = g_s / 15;
	var timer_colour = "rgb(128," + (timer * 255) + ",0)";
	for (var i = 0; i < 4; i++){
    ctx.fillStyle = "#548";
		ctx.fillRect(g_s * i + g_m/2, c.height/2.0 - g_s/2 - g_m/2, g_s - g_m, g_s - g_m);
	}
	for (var i = 0; i < board_size + 1; i++){
		if (i == board_size){
			ctx.fillStyle = "#333";
		}else{
			if (board[i] == -1){
				ctx.fillStyle = "#333";
			}else{
				if (reserves[n_rev][i] != -1){
					ctx.fillStyle = "#845";
				}else{
					ctx.fillStyle = "#548";
				}
			}
		}
		ctx.fillRect(g_s * (i - anim_x) + g_m, c.height/2.0 - g_s/2, g_s - g_m*2, g_s - g_m*2);
	}
	for (var j = 0; j < board_size / 4; j++){
		for (var i = 0; i < board_size + 1; i++){
			if (i == board_size){
				ctx.fillStyle = "#444";
			}else{
				if (reserves[j][i] == -1){
					ctx.fillStyle = "#444";
				}else{
					ctx.fillStyle = timer_colour;
				}
			}
			if (j == n_rev){
				ctx.fillRect(g_s * (i - anim_x) + g_m*4, c.height/2.0 - g_s/2 + (j - n_rev) * g_s + g_m*3, g_s - g_m*8, g_s - g_m*8);
			}else{
				ctx.fillRect(g_s * i + g_m*4, c.height/2.0 - g_s/2 + (j - n_rev) * g_s + g_m*3, g_s - g_m*8, g_s - g_m*8);
			}
		}
	}
	ctx.fillStyle = "#444";
	ctx.fillRect(0, c.height - g_m * 4, c.width, g_m * 4);
	ctx.fillStyle = timer_colour;
	ctx.fillRect(0, c.height - g_m * 4, c.width * timer, g_m * 4);
	var text_height = g_s/2;
	ctx.fillStyle = "#FFF";
	ctx.font = text_height.toString() + "px Arial";
	ctx.fillText(score.toString(), 0, text_height);
	if (!isNaN(highscore)){
		ctx.font = text_height.toString()/2 + "px Arial";
		ctx.fillText("Highscore:" + highscore.toString(), c.width * 0.85, text_height);
	}
}

function resizeCanvas(){
	var ratio = 2.0;
	var c = document.getElementById("center");
	var game = document.getElementById("game");
	min_len = Math.min(window.innerWidth / ratio,window.innerHeight);
	c.width = min_len * ratio;
	c.height = min_len;
	c.style.width = min_len * ratio + 'px';
	c.style.height = min_len + 'px';
	game.width = min_len * ratio;
	game.height = min_len;
	game.style.width = min_len * ratio + 'px';
	game.style.height = min_len + 'px';
	scl = min_len / 1024.0;
	draw();
}

function genRndRow(n, val){
	var pos = [];
	var rlt = [];
	for (var i = 0; i < board_size; i++){
		pos.push(i);
		rlt.push(-1);
	}
	for (var i = 0; i < n; i++){
		var idx = pos.splice(Math.floor(Math.random() * (board_size - i)), 1);
		rlt[idx] = val;
	}
	return rlt;
}

function update(){
	if (game_over) return;
	if (shift_x > 0 || anim_x > 0){
		if (anim_x >= 1.0){
			if (shift_x > 0){
				anim_x = 0.0;
				shift_x -= 1;
				board.shift();
				board.push(-1);
				score += 1;
			}
		}else{
			anim_x += 0.2;
		}
	}else{
		in_anim = false;
		if (timer == 1.0){
			reserves[n_rev] = genRndRow(4,1);
		}
		timer -= 0.001;
		if (timer <= 0){
			checkRound();
		}
	}
}

setup();


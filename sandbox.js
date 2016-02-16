"use strict";
var canvas = document.getElementById('display');
var display = canvas.getContext('2d');
var render = document.getElementById('render');
var ctx = render.getContext('2d');
ctx.imageSmoothingEnabled = false;
display.imageSmoothingEnabled = false;

// Supporting old browsers
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var map = [];

var MAP_WIDTH = 200;
var MAP_HEIGHT = 150;

//Left mouse button pressed
var lmb = false;

var materials = [
    {
        "name": "AIR",
        "color": {"r": 151, "g": 255, "b": 255} //Using sky color for now
    },
    {
        "name": "STONE",
        "color": {"r": 112, "g": 112, "b": 112}
    }
];

//Render scale
var scale = 4;

var mousePos = {
    x: 0,
    y: 0
};



function genMap() {
    for (var x = 0; x <= MAP_WIDTH; x++) {
        map[x] = [];
        for (var y = 0; y <= MAP_HEIGHT; y++) {
            if (Math.random() > 0.9)
                map[x][y] = 1;
            else map[x][y] = 0;
        }
    }
}


function drawDebug() {
    display.font = "18px Arial";
    display.fillText("Mouse X:" + mousePos.x, 5, 20);
    display.fillText("Mouse Y:" + mousePos.y, 5, 40);
    display.fillText("Left Button: " + (lmb ? "Down" : "Up"), 5, 60);
}

canvas.addEventListener('mousemove', function (evt) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {
        x: Math.floor((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.floor((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
}, false);



canvas.addEventListener('mouseup', function (evt) {
    lmb = false;
}, false);
canvas.addEventListener('mousedown', function (evt) {
    lmb = true;
}, false);

function draw() {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    var imageData = ctx.createImageData(200, 150);
    var color;
    for (var x = 0; x < MAP_WIDTH; x++)
        for (var y = MAP_HEIGHT; y >= 0; y--) {
            {
                color = materials[map[x][y]].color;
                var r = 0;
                if (map[x][y] != 0)
                    r = 150 - y * 1.2;
                setPixel(imageData, x, y, color.r + r, color.g + r, color.b + r, 255);
            }

        }
    setPixel(imageData, Math.floor(mousePos.x / scale), Math.floor(mousePos.y / scale), 0, 0, 0, 1);
    ctx.putImageData(imageData, 0, 0);
    ctx.save();
    display.drawImage(render, 0, 0, scale * render.width, scale * render.height);
    drawDebug();
    requestAnimationFrame(draw);
}

function physics() {
    //Simplest physics ever
    for (var x = 0; x < MAP_WIDTH; x++) {
        for (var y = MAP_HEIGHT; y >= 0; y--) {
            if (map[x][y] != 0 && y < MAP_HEIGHT && map[x][y + 1] == 0) {
                map[x][y + 1] = map[x][y];
                map[x][y] = 0;
            }
            if (Math.random() > 0.5) {
                if (map[x][y] != 0 && x < MAP_WIDTH && x > 0 && y < MAP_HEIGHT && map[x + 1][y + 1] == 0) {
                    map[x + 1][y + 1] = map[x][y];
                    map[x][y] = 0;
                }
            }
            else if (map[x][y] != 0 && x < MAP_WIDTH && x > 0 && y < MAP_HEIGHT && map[x - 1][y + 1] == 0) {
                map[x - 1][y + 1] = map[x][y];
                map[x][y] = 0;
            }
        }
    }
}

function interact() {
    if (lmb) {
        for (var i = 0; i < 6; i++) {
            map[Math.floor(mousePos.x / scale + Math.random() * 3)][Math.floor(mousePos.y / scale + Math.random() * 3)] = 1;
        }
    }
}

//Simplyfing work with pixels 
function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}

genMap();
setInterval(physics, 20);
setInterval(interact, 100);
draw();


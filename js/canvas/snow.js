(function () {
    // If already initialized, destroy the old one first
    if (window.SnowApp && typeof window.SnowApp.destroy === 'function') {
        window.SnowApp.destroy();
    }

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createSnowItem(canvas, ctx, options) {
        const { radius, speed, wind, color } = options;
        const params = {
            color,
            x: getRandom(0, canvas.offsetWidth),
            y: getRandom(-canvas.offsetHeight, 0),
            radius: getRandom(radius[0], radius[1]),
            speed: getRandom(speed[0], speed[1]),
            wind: getRandom(wind[0], wind[1]),
            isResized: false
        };

        return {
            resized: () => params.isResized = true,
            update: () => {
                params.y += params.speed;
                params.x += params.wind;
                if (params.y >= canvas.offsetHeight) {
                    if (params.isResized) {
                        params.x = getRandom(0, canvas.offsetWidth);
                        params.y = getRandom(-canvas.offsetHeight, 0);
                        params.isResized = false;
                    } else {
                        params.y = 0;
                        params.x = getRandom(0, canvas.offsetWidth);
                    }
                }
            },
            draw: () => {
                ctx.beginPath();
                ctx.arc(params.x, params.y, params.radius, 0, 2 * Math.PI);
                ctx.fillStyle = params.color;
                ctx.fill();
                ctx.closePath();
            }
        };
    }

    function Snow(canvas, count, userOptions = {}) {
        const defaultOptions = {
            color: 'white',
            radius: [0.5, 3.0],
            speed: [1, 3],
            wind: [-0.5, 3.0]
        };

        const options = $.extend({}, defaultOptions, userOptions);
        const ctx = canvas.getContext('2d');
        const snowFlakes = [];
        let animationFrameId;

        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        if (typeof(browser) === 'undefined'){
            bgImg.src = chrome.runtime.getURL('media/bg/snow.jpg');
        }else{
            bgImg.src = browser.runtime.getURL('media/bg/snow.jpg');
        }

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            snowFlakes.forEach(flake => flake.resized());
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (bgImg.complete) {
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            }
            snowFlakes.forEach(flake => flake.draw());
        }

        function update() {
            snowFlakes.forEach(flake => flake.update());
        }

        function loop() {
            draw();
            update();
            animationFrameId = requestAnimationFrame(loop);
        }

        function init() {
            for (let i = 0; i < count; i++) {
                snowFlakes.push(createSnowItem(canvas, ctx, options));
            }
            $(window).on('resize.snow', resize);
            resize();
            loop();
        }

        init();

        return {
            destroy: function () {
                cancelAnimationFrame(animationFrameId);
                $(window).off('resize.snow');
                snowFlakes.length = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };
    }

    // ✅ Bootstrap
    $(function () {
        const canvas = document.createElement("canvas");
        $('#canvasContainer').empty().append(canvas);

        // Save to global object so you can destroy it before reloading
        window.SnowApp = Snow(canvas, 1000);
    });

})();
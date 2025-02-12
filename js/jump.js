class JumpGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.isCharging = false;
        this.chargeStart = 0;
        this.initGame();
        this.initControls();
        this.gameLoop();
    }

    initGame() {
        this.player = {
            x: 160,
            y: 400,
            size: 20,
            velocityX: 0,
            velocityY: 0,
            baseX: 160,
            baseY: 400,
            isAirborne: false
        };
        
        this.platforms = [
            this.createPlatform(140, 450),
            this.createPlatform()
        ];
        this.targetPlatform = null;
    }

    createPlatform(x = null, y = null) {
        const minWidth = 60, maxWidth = 100;
        const types = ['normal', 'normal', 'normal', 'special'];
        return {
            x: x || Math.random() * (this.canvas.width - maxWidth),
            y: y || this.platforms[0].y - 150 - Math.random() * 50,
            width: minWidth + Math.random() * (maxWidth - minWidth),
            height: 12,
            type: types[Math.floor(Math.random() * types.length)],
            center: function() { return this.x + this.width/2; }
        };
    }

    initControls() {
        const startCharge = (e) => {
            e.preventDefault();
            if (this.player.isAirborne) return;
            this.isCharging = true;
            this.chargeStart = Date.now();
        };

        const endCharge = (e) => {
            e.preventDefault();
            if (!this.isCharging) return;
            this.isCharging = false;
            this.executeJump();
        };

        this.canvas.addEventListener('mousedown', startCharge);
        this.canvas.addEventListener('mouseup', endCharge);
        this.canvas.addEventListener('touchstart', startCharge);
        this.canvas.addEventListener('touchend', endCharge);
    }

    executeJump() {
        const chargeTime = Date.now() - this.chargeStart;
        const maxCharge = 1000;
        const chargeRatio = Math.min(chargeTime, maxCharge) / maxCharge;
        
        // 抛物线运动参数
        const jumpPower = 20 + chargeRatio * 25;
        const target = this.findTargetPlatform();
        const dx = target.center() - this.player.x;
        
        this.player.velocityX = dx * 0.015 * jumpPower;
        this.player.velocityY = -jumpPower;
        this.player.isAirborne = true;
        this.targetPlatform = target;
    }

    findTargetPlatform() {
        return this.platforms.reduce((prev, curr) => 
            (Math.abs(curr.y - this.player.baseY) < Math.abs(prev.y - this.player.baseY)) ? curr : prev
        );
    }

    updatePhysics() {
        if (!this.player.isAirborne) return;

        const gravity = 0.8;
        const airResistance = 0.98;
        
        this.player.velocityY += gravity;
        this.player.y += this.player.velocityY;
        this.player.x += this.player.velocityX *= airResistance;

        // 边界限制
        this.player.x = Math.max(10, Math.min(this.canvas.width - 10, this.player.x));

        // 落地检测
        if (this.player.y >= this.player.baseY) {
            this.handleLanding();
        }
    }

    handleLanding() {
        const platform = this.platforms.find(p => 
            this.player.x >= p.x - 5 && 
            this.player.x <= p.x + p.width + 5 &&
            Math.abs(this.player.y + this.player.size - p.y) < 15
        );

        if (platform && platform === this.targetPlatform) {
            this.handleSuccess(platform);
        } else {
            this.handleFail();
        }
    }

    handleSuccess(platform) {
        const distanceFromCenter = Math.abs(this.player.x - platform.center());
        this.score += platform.type === 'special' ? 2 : 
            distanceFromCenter < 10 ? 3 : 
            distanceFromCenter < 20 ? 2 : 1;
        
        document.getElementById('score').textContent = this.score;
        
        this.player.baseX = platform.center();
        this.player.baseY = platform.y - this.player.size;
        this.player.isAirborne = false;
        
        this.generateNewPlatform();
        this.cleanOldPlatforms();
    }

    generateNewPlatform() {
        const lastPlatform = this.platforms[this.platforms.length - 1];
        this.platforms.push(this.createPlatform());
        
        // 动态难度调整
        if (this.score % 5 === 0) {
            this.platforms.forEach(p => p.y += 30);
        }
    }

    cleanOldPlatforms() {
        while (this.platforms[0].y > this.canvas.height + 100) {
            this.platforms.shift();
        }
    }

    handleFail() {
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isAirborne = false;
        alert(`游戏结束！得分：${this.score}`);
        this.initGame();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制平台
        this.platforms.forEach(plat => {
            this.ctx.fillStyle = plat.type === 'special' ? '#FF5722' : '#4CAF50';
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            this.ctx.strokeStyle = '#00000022';
            this.ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        });

        // 绘制玩家
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.player.isAirborne ? '#2196F3' : '#1976D2';
        this.ctx.fill();
        this.ctx.strokeStyle = '#00000022';
        this.ctx.stroke();
    }

    gameLoop() {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

new JumpGame();

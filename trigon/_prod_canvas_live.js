import { SYSTEM_CONFIG } from './config.js';

export class CanvasBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.gridOffset = 0;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.dragonSegments = [];
        for (let i = 0; i < 40; i++) {
            this.dragonSegments.push({ x: this.mouseX, y: this.mouseY });
        }
        this.splashes = [];

        // Cursor tracking disabled per user request
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    draw3DGrid(time) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const horizon = height * 0.6;
        
        ctx.save();
        ctx.strokeStyle = "rgba(200, 200, 200, 0.15)"; // Cement/Grey 3D grid
        ctx.lineWidth = 1;
        
        // Perspective magic
        const fov = 300;
        this.gridOffset = (time * 50) % 50; // Moving forward effect

        ctx.beginPath();
        // Draw vertical lines tapering to center
        for (let i = -20; i <= 20; i++) {
            let startX = width / 2 + i * 100;
            let endX = width / 2 + (i * 100) * (height / fov);
            ctx.moveTo(width / 2 + (i * 10), horizon);
            ctx.lineTo(endX, height);
        }

        // Draw horizontal lines spreading out
        for (let i = 0; i < 30; i++) {
            let z = i * 50 - this.gridOffset;
            if (z > 0) {
                let y = horizon + (height - horizon) * (fov / (fov + z));
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    drawAICore() {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2 + 80; // hero centerpiece
        const time = Date.now() * 0.001;

        // Site's color palette
        const ringColor   = "rgba(255, 45, 120, 0.9)";   // Cyan
        const glowColor   = "rgba(123, 111, 240, 0.7)";   // Indigo
        const topColor    = "#FFD6E8";                    // Icy crystal top
        const bottomColor = "#7B6FF0";                    // Indigo crystal bottom

        ctx.save();
        ctx.translate(cx, cy);

        // â”€â”€ 1. ISOMETRIC 3D BASE CYLINDER â”€â”€
        ctx.save();
        ctx.globalAlpha = 0.5;

        // Top ellipse face
        ctx.beginPath();
        ctx.ellipse(0, 0, 280, 90, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1d26";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,45,120,0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cylinder side depth
        ctx.beginPath();
        ctx.moveTo(-280, 0);
        ctx.lineTo(-280, 50);
        ctx.ellipse(0, 50, 280, 90, 0, Math.PI, 0, false);
        ctx.lineTo(280, 0);
        ctx.ellipse(0, 0, 280, 90, 0, 0, Math.PI, true);
        ctx.fillStyle = "#0d0f18";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,45,120,0.12)";
        ctx.stroke();

        // Inner hollow dark well
        ctx.beginPath();
        ctx.ellipse(0, -4, 195, 62, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#070810";
        ctx.fill();
        ctx.restore();

        // â”€â”€ 2. SACRED GEOMETRY RINGS (isometric-scaled) â”€â”€
        ctx.save();
        ctx.translate(0, -10);
        ctx.scale(1, 90/280); // match bigger cylinder perspective

        ctx.shadowBlur = 14 + Math.sin(time * 2) * 4;
        ctx.shadowColor = glowColor;
        ctx.strokeStyle = ringColor;
        ctx.fillStyle   = ringColor;
        ctx.lineWidth   = 1.5;

        // Slow overall rotation
        ctx.rotate(time * 0.04);

        // â”€â”€ 2a. Inner Sunburst â”€â”€
        ctx.save();
        ctx.rotate(-time * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.18 + Math.sin(time * 3) * 0.08;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let i = 0; i < 16; i++) {
            let a = (i * Math.PI) / 8;
            let isLong = i % 2 === 0;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
            ctx.lineTo(Math.cos(a) * (isLong ? 50 : 42), Math.sin(a) * (isLong ? 50 : 42));
            ctx.stroke();
        }
        ctx.restore();

        // â”€â”€ 2b. Middle Complex Ring â”€â”€
        ctx.save();
        ctx.rotate(time * 0.14);

        ctx.beginPath();
        ctx.arc(0, 0, 62, 0, Math.PI * 1.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 76, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();

        // Triangular arrow markers
        for (let i = 0; i < 3; i++) {
            let angle = Math.PI * 0.8 + i * 0.18;
            ctx.save();
            ctx.rotate(angle);
            ctx.translate(62, 0);
            ctx.beginPath();
            ctx.moveTo(-5, -5);
            ctx.lineTo(7, 0);
            ctx.lineTo(-5, 5);
            ctx.fill();
            ctx.restore();
        }

        // Tick marks
        for (let i = 0; i < 12; i++) {
            let angle = Math.PI * 1.2 + i * 0.055;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 76, Math.sin(angle) * 76);
            ctx.lineTo(Math.cos(angle) * 84, Math.sin(angle) * 84);
            ctx.stroke();
        }
        ctx.restore();

        // â”€â”€ 2c. Outer Ring & Celestial Bodies â”€â”€
        ctx.save();
        ctx.rotate(-time * 0.07);

        // Dotted orbit
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, 97, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Solid outer arc segment
        ctx.beginPath();
        ctx.arc(0, 0, 114, Math.PI * 0.7, Math.PI * 2.3);
        ctx.stroke();

        // Crescent Moon
        ctx.save();
        ctx.rotate(Math.PI * 1.2);
        ctx.translate(114, 0);
        ctx.rotate(-time * 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, 11, Math.PI * 0.5, Math.PI * 1.5, false);
        ctx.arc(4, 0, 9, Math.PI * 1.5, Math.PI * 0.5, true);
        ctx.fill();
        ctx.restore();

        // 8-Pointed Star
        ctx.save();
        ctx.rotate(Math.PI * 0.2);
        ctx.translate(114, 0);
        ctx.rotate(time * 0.5);
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
            let r = i % 2 === 0 ? 14 : 5;
            let a = (i * Math.PI) / 8;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Orbiting planets (3)
        for (let i = 0; i < 3; i++) {
            let angle = i * Math.PI * 0.67 + time * 0.18;
            let r = 132;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 97, Math.sin(angle) * 97);
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.restore();

        ctx.restore(); // end rings scale group

        // â”€â”€ 3. FLOATING DIAMOND CRYSTAL â”€â”€
        ctx.save();
        let hoverOffset = Math.sin(time * 1.5) * 12 - 155;
        ctx.translate(0, hoverOffset);
        ctx.globalAlpha = 1;
        ctx.lineJoin = "round";

        const w = 85, hTop = 125, hMid = 28, hBot = 122;

        // Top-left face (bright icy)
        ctx.beginPath();
        ctx.moveTo(0, -hTop);
        ctx.lineTo(-w, 0);
        ctx.lineTo(0, hMid);
        ctx.closePath();
        ctx.fillStyle = topColor;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "rgba(255,45,120,0.9)";
        ctx.fill();

        // Top-right face (slightly darker)
        ctx.beginPath();
        ctx.moveTo(0, -hTop);
        ctx.lineTo(w, 0);
        ctx.lineTo(0, hMid);
        ctx.closePath();
        ctx.fillStyle = topColor;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fill();

        // Bottom-left face (indigo)
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.lineTo(0, hBot);
        ctx.lineTo(0, hMid);
        ctx.closePath();
        ctx.fillStyle = bottomColor;
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(123,111,240,0.9)";
        ctx.fill();

        // Bottom-right face (darker indigo)
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(0, hBot);
        ctx.lineTo(0, hMid);
        ctx.closePath();
        ctx.fillStyle = bottomColor;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fill();

        // Internal facet grid lines
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.8;
        for (let j = 1; j < 8; j++) {
            let ratio = j / 8;
            ctx.beginPath();
            ctx.moveTo(w * ratio, -hTop * (1 - ratio));
            ctx.lineTo(w * ratio,  hMid * (1 - ratio));
            ctx.moveTo(w * ratio,  hBot * (1 - ratio));
            ctx.lineTo(w * ratio,  hMid * (1 - ratio));
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        ctx.restore(); // end translate to center
    }

    drawParticles() {
        const ctx = this.ctx;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        });
        
        // Connect nearby particles (Cement/White theme)
        ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
        ctx.lineWidth = 0.5;
        for(let i=0; i<this.particles.length; i++) {
            for(let j=i+1; j<this.particles.length; j++) {
                let dx = this.particles[i].x - this.particles[j].x;
                let dy = this.particles[i].y - this.particles[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                    ctx.globalAlpha = 1 - (dist / 100);
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    drawDragon() {
        const ctx = this.ctx;
        
        // Ease head towards mouse
        const head = this.dragonSegments[0];
        const dxHead = this.mouseX - head.x;
        const dyHead = this.mouseY - head.y;
        head.x += dxHead * 0.15;
        head.y += dyHead * 0.15;
        
        // Follow segments
        for (let i = 1; i < this.dragonSegments.length; i++) {
            const current = this.dragonSegments[i];
            const prev = this.dragonSegments[i - 1];
            const dx = prev.x - current.x;
            const dy = prev.y - current.y;
            current.x += dx * 0.5;
            current.y += dy * 0.5;
            
            // Generate splashes randomly from body movement to create misty water effect
            if (Math.random() < 0.08 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
                this.splashes.push({
                    x: current.x,
                    y: current.y,
                    vx: -dx * 0.2 + (Math.random() - 0.5) * 2,
                    vy: -dy * 0.2 + (Math.random() - 0.5) * 2,
                    life: 1,
                    size: Math.random() * 2.5 + 0.5
                });
            }
        }
        
        // Update and draw splashes
        ctx.save();
        ctx.fillStyle = "rgba(220, 240, 255, 0.6)"; // light watery blue/white
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(220, 240, 255, 0.8)";
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const s = this.splashes[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.02;
            if (s.life <= 0) {
                this.splashes.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = s.life;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        
        // Draw the misty watery dragon body layers
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // Layer 1: Wide, very faint mist (water aura)
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(200, 230, 255, 0.15)";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        for (let i = 0; i < this.dragonSegments.length; i++) {
            const p = this.dragonSegments[i];
            // Taper off towards tail
            ctx.lineWidth = Math.max(2, 35 - i * 0.8);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // Layer 2: Medium watery flow inner body
        ctx.strokeStyle = "rgba(230, 245, 255, 0.4)";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let i = 0; i < this.dragonSegments.length; i++) {
            const p = this.dragonSegments[i];
            ctx.lineWidth = Math.max(1, 18 - i * 0.4);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        
        // Layer 3: Sharp glowing energetic core
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 5;
        ctx.beginPath();
        for (let i = 0; i < this.dragonSegments.length; i++) {
            const p = this.dragonSegments[i];
            ctx.lineWidth = Math.max(0.5, 5 - i * 0.1);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // Draw watery head
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowBlur = 15;
        ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes/details
        const angle = Math.atan2(head.y - this.dragonSegments[1].y, head.x - this.dragonSegments[1].x);
        ctx.fillStyle = "rgba(10, 40, 80, 0.9)"; // Dark mystical blue eye
        ctx.beginPath();
        ctx.arc(head.x + Math.cos(angle - 0.6) * 3, head.y + Math.sin(angle - 0.6) * 3, 1.5, 0, Math.PI * 2);
        ctx.arc(head.x + Math.cos(angle + 0.6) * 3, head.y + Math.sin(angle + 0.6) * 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    animate() {
        const time = Date.now() * 0.001;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.draw3DGrid(time);
        this.drawAICore();
        this.drawParticles();
        this.drawDragon();
        
        requestAnimationFrame(() => this.animate());
    }
}


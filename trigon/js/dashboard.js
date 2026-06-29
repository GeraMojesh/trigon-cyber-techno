/**
 * dashboard.js — Trigon Cyber-Techno PVT. LTD.
 * Live Cyber Defense Dashboard Engine
 * Handles: Threat feed, Gauges, Donut chart, Threat map, Activity sparkline, Event log, Clock
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only run dashboard if section exists
    const dashSection = document.getElementById('dashboard');
    if (!dashSection) return;

    // ── 1. LIVE UTC CLOCK ────────────────────────────────────────────
    const dashTime = document.getElementById('dash-time');
    function updateClock() {
        if (!dashTime) return;
        const now = new Date();
        const hh = String(now.getUTCHours()).padStart(2, '0');
        const mm = String(now.getUTCMinutes()).padStart(2, '0');
        const ss = String(now.getUTCSeconds()).padStart(2, '0');
        dashTime.textContent = `${hh}:${mm}:${ss} UTC`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ── 2. GAUGE BAR ANIMATIONS (IntersectionObserver) ───────────────
    const gaugesPanel = document.querySelector('.gauges-panel');
    if (gaugesPanel) {
        const gaugeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.gauge-bar[data-target]').forEach(bar => {
                        const target = bar.dataset.target;
                        setTimeout(() => {
                            bar.style.width = target + '%';
                        }, 300);
                    });
                    gaugeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        gaugeObserver.observe(gaugesPanel);
    }

    // ── 3. DONUT CHART (Canvas) ──────────────────────────────────────
    const donutCanvas = document.getElementById('threat-donut');
    if (donutCanvas) {
        const donutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    drawDonut(donutCanvas);
                    donutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        donutObserver.observe(donutCanvas);
    }

    function drawDonut(canvas) {
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = 52;
        const innerRadius = 32;
        const data = [
            { value: 42, color: '#F97316' },
            { value: 28, color: '#1E3A8A' },
            { value: 18, color: '#F97316' },
            { value: 12, color: '#1E3A8A' }
        ];
        const total = data.reduce((s, d) => s + d.value, 0);
        let startAngle = -Math.PI / 2;
        const duration = 900;
        const start = performance.now();

        function animateDonut(now) {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            data.forEach(seg => {
                const sliceAngle = (seg.value / total) * 2 * Math.PI * eased;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = seg.color;
                ctx.fill();
                startAngle += sliceAngle;
            });

            // Inner circle mask
            ctx.beginPath();
            ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#111827';
            ctx.fill();

            // Center label
            ctx.fillStyle = 'rgba(249, 250, 251,0.8)';
            ctx.font = 'bold 11px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('THREATS', cx, cy - 6);
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.fillStyle = '#F97316';
            ctx.fillText('BY TYPE', cx, cy + 7);

            startAngle = -Math.PI / 2;
            if (elapsed < 1) requestAnimationFrame(animateDonut);
        }
        requestAnimationFrame(animateDonut);
    }

    // ── 4. THREAT MAP CANVAS ─────────────────────────────────────────
    const mapCanvas = document.getElementById('threat-map-canvas');
    if (mapCanvas) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initThreatMap(mapCanvas);
                    mapObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        mapObserver.observe(mapCanvas);
    }

    function initThreatMap(canvas) {
        const ctx = canvas.getContext('2d');
        let W = 0;
        let H = 0;

        // Match the canvas bitmap to its rendered size for crisp, retina-sharp rendering
        function resizeMap() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            W = Math.max(Math.round(rect.width), 280);
            H = Math.max(Math.round(rect.height), Math.round(W * 9 / 16));
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resizeMap();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeMap, 150);
        });

        // Mercator lon/lat → canvas x,y
        function project(lon, lat) {
            const x = ((lon + 180) / 360) * W;
            const latRad = lat * Math.PI / 180;
            const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
            const y = (H / 2) - (W * mercN / (2 * Math.PI)) * 0.6 + H * 0.08;
            return { x, y };
        }

        // Continent outline polygons [lon, lat]
        const landMasses = [
            // North America
            [[-140,60],[-60,50],[-55,45],[-80,25],[-90,15],[-85,10],[-80,8],[-75,10],[-78,15],[-90,20],[-88,25],[-110,25],[-120,32],[-125,40],[-130,50],[-140,60]],
            // South America
            [[-80,12],[-60,10],[-50,5],[-35,-5],[-35,-15],[-40,-25],[-55,-35],[-70,-45],[-75,-50],[-68,-55],[-65,-45],[-60,-30],[-55,-20],[-45,-10],[-50,0],[-60,5],[-70,10],[-80,12]],
            // Europe
            [[-10,35],[0,42],[5,45],[10,55],[15,58],[20,60],[30,70],[25,68],[15,65],[10,62],[5,58],[0,52],[-5,48],[-10,44],[-10,38],[-10,35]],
            // Africa
            [[-15,15],[0,15],[15,15],[30,10],[40,5],[45,10],[50,12],[45,15],[35,22],[30,30],[32,32],[30,35],[28,38],[20,38],[10,35],[0,30],[-5,25],[-10,20],[-15,15]],
            // Russia/Asia
            [[25,70],[60,72],[80,73],[100,73],[140,72],[160,68],[170,65],[175,60],[160,55],[150,48],[135,42],[130,35],[120,30],[100,22],[80,28],[60,22],[55,25],[50,28],[45,38],[38,40],[30,45],[25,55],[28,65],[25,70]],
            // India
            [[65,25],[80,28],[90,25],[85,20],[80,15],[75,10],[70,8],[67,22],[65,25]],
            // Australia
            [[115,-22],[125,-15],[135,-12],[145,-15],[150,-25],[145,-38],[135,-38],[125,-35],[115,-30],[115,-22]],
            // Japan (simplified)
            [[130,33],[133,35],[136,36],[140,40],[141,43],[140,45],[135,45],[133,40],[130,36],[130,33]],
        ];

        // City nodes: [name, lon, lat, color, isTarget]
        const cities = [
            { name: 'New York',    lon: -74,  lat: 40.7, color: '#F97316', target: true },
            { name: 'London',      lon: -0.1, lat: 51.5, color: '#1E3A8A', target: false },
            { name: 'Moscow',      lon: 37.6, lat: 55.7, color: '#F97316', target: true },
            { name: 'Beijing',     lon: 116,  lat: 39.9, color: '#F97316', target: true },
            { name: 'Tokyo',       lon: 139,  lat: 35.7, color: '#F97316', target: false },
            { name: 'Mumbai',      lon: 72.8, lat: 19,   color: '#1E3A8A', target: false },
            { name: 'São Paulo',   lon: -46,  lat: -23.5,color: '#F9FAFB', target: false },
            { name: 'Lagos',       lon: 3.4,  lat: 6.5,  color: '#F97316', target: false },
            { name: 'Sydney',      lon: 151,  lat: -33.8,color: '#1E3A8A', target: false },
            { name: 'Dubai',       lon: 55.3, lat: 25.2, color: '#1E3A8A', target: false },
            { name: 'Singapore',   lon: 103.8,lat: 1.3,  color: '#F9FAFB', target: false },
            { name: 'Kyiv',        lon: 30.5, lat: 50.5, color: '#F97316', target: true },
        ];

        // Attack routes [srcIdx, dstIdx, color]
        const attacks = [
            { src: 2, dst: 0, color: '#F97316' }, // Moscow → NY
            { src: 3, dst: 1, color: '#F97316' }, // Beijing → London
            { src: 3, dst: 0, color: '#F97316' }, // Beijing → NY
            { src: 2, dst: 11, color: '#F97316'}, // Moscow → Kyiv
            { src: 3, dst: 9, color: '#1E3A8A' }, // Beijing → Dubai
            { src: 0, dst: 7, color: '#1E3A8A' }, // NY → Lagos
        ];

        // Give each attack a staggered phase
        attacks.forEach((a, i) => { a.phase = (i / attacks.length) * Math.PI * 2; a.speed = 0.012 + Math.random() * 0.008; });

        let frame = 0;
        let raf;

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // ── Background grid (lat/lon lines) ──
            ctx.strokeStyle = 'rgba(30,58,138,0.06)';
            ctx.lineWidth = 0.5;
            for (let lon = -180; lon <= 180; lon += 30) {
                const p1 = project(lon, 85); const p2 = project(lon, -85);
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
            for (let lat = -75; lat <= 75; lat += 30) {
                ctx.beginPath();
                for (let lon = -180; lon <= 180; lon += 5) {
                    const p = project(lon, lat);
                    lon === -180 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // ── Land masses ──
            landMasses.forEach(poly => {
                ctx.beginPath();
                poly.forEach(([lon, lat], i) => {
                    const p = project(lon, lat);
                    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                });
                ctx.closePath();
                ctx.fillStyle = 'rgba(30,58,138,0.12)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(30,58,138,0.3)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            });

            // ── Attack arcs ──
            attacks.forEach(atk => {
                const src = project(cities[atk.src].lon, cities[atk.src].lat);
                const dst = project(cities[atk.dst].lon, cities[atk.dst].lat);
                const mx = (src.x + dst.x) / 2;
                const my = Math.min(src.y, dst.y) - 35;

                // Trail arc
                ctx.beginPath();
                ctx.moveTo(src.x, src.y);
                ctx.quadraticCurveTo(mx, my, dst.x, dst.y);
                ctx.strokeStyle = atk.color + '30';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 5]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Moving projectile
                const t = ((frame * atk.speed + atk.phase) % (Math.PI * 2));
                const progress = (Math.sin(t) * 0.5 + 0.5);
                const bx = (1-progress)*(1-progress)*src.x + 2*(1-progress)*progress*mx + progress*progress*dst.x;
                const by = (1-progress)*(1-progress)*src.y + 2*(1-progress)*progress*my + progress*progress*dst.y;

                const g = ctx.createRadialGradient(bx, by, 0, bx, by, 7);
                g.addColorStop(0, atk.color + 'ff');
                g.addColorStop(0.4, atk.color + '99');
                g.addColorStop(1, atk.color + '00');
                ctx.beginPath();
                ctx.arc(bx, by, 5, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
            });

            // ── City nodes ──
            const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;
            cities.forEach((city, i) => {
                const p = project(city.lon, city.lat);
                // Outer ring pulse
                if (city.target) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 6 + pulse * 5, 0, Math.PI * 2);
                    ctx.strokeStyle = city.color + '40';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                // Core dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, city.target ? 4 : 2.5, 0, Math.PI * 2);
                ctx.fillStyle = city.color;
                ctx.fill();
                // Label
                if (W > 250) {
                    ctx.fillStyle = 'rgba(249, 250, 251,0.55)';
                    ctx.font = '7px Inter, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(city.name, p.x + 6, p.y + 3);
                }
            });

            // ── Live counter overlay ──
            ctx.fillStyle = 'rgba(249,115,22,0.85)';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`▶ ${attacks.length} LIVE ATTACKS`, W - 6, H - 5);

            frame++;
            raf = requestAnimationFrame(draw);
        }

        draw();
        // Stop animation when section leaves viewport to save CPU
        const stopObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = null; }
                else if (!raf) { frame = 0; draw(); }
            });
        }, { threshold: 0.1 });
        stopObserver.observe(canvas);
    }

    // ── 5. SECURITY SCORE RING ───────────────────────────────────────
    const scoreCanvas = document.getElementById('score-ring');
    if (scoreCanvas) {
        const scoreObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    drawScoreRing(scoreCanvas, 0.96);
                    scoreObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        scoreObserver.observe(scoreCanvas);
    }

    function drawScoreRing(canvas, fraction) {
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = 48;
        const duration = 1200;
        const start = performance.now();

        function animate(now) {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Track
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(249, 250, 251,0.06)';
            ctx.lineWidth = 8;
            ctx.stroke();

            // Fill
            const endAngle = -Math.PI / 2 + 2 * Math.PI * fraction * eased;
            const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
            grad.addColorStop(0, '#F97316');
            grad.addColorStop(1, '#F9FAFB');
            ctx.beginPath();
            ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();

            if (elapsed < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ── 6. LIVE THREAT FEED ──────────────────────────────────────────
    const feedEl = document.getElementById('threat-feed');
    const feedData = [
        { time: '22:41', type: 'Phishing', src: '185.220.x.x', sev: 'HIGH', status: 'BLOCKED', color: '#F97316' },
        { time: '22:39', type: 'Port Scan', src: '103.14.x.x', sev: 'LOW', status: 'LOGGED', color: '#1E3A8A' },
        { time: '22:37', type: 'Brute Force', src: '91.193.x.x', sev: 'MED', status: 'BLOCKED', color: '#F97316' },
        { time: '22:35', type: 'Malware', src: '45.147.x.x', sev: 'HIGH', status: 'QUARANTINE', color: '#F97316' },
        { time: '22:33', type: 'SQL Inject', src: '194.165.x.x', sev: 'CRIT', status: 'BLOCKED', color: '#F97316' },
        { time: '22:30', type: 'DDoS Pulse', src: '198.98.x.x', sev: 'MED', status: 'MITIGATED', color: '#F97316' },
        { time: '22:28', type: 'XSS Probe', src: '89.248.x.x', sev: 'LOW', status: 'LOGGED', color: '#1E3A8A' },
    ];

    if (feedEl) {
        const feedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    populateFeed();
                    feedObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        feedObserver.observe(feedEl);
    }

    function populateFeed() {
        feedData.forEach((item, i) => {
            setTimeout(() => {
                if (!feedEl) return;
                const row = document.createElement('div');
                row.className = 'feed-row feed-row-enter';
                row.innerHTML = `
                    <span class="feed-time">${item.time}</span>
                    <span class="feed-type" style="color:${item.color}">${item.type}</span>
                    <span class="feed-src">${item.src}</span>
                    <span class="feed-sev sev-${item.sev.toLowerCase()}">${item.sev}</span>
                    <span class="feed-status">${item.status}</span>
                `;
                feedEl.appendChild(row);
                requestAnimationFrame(() => row.classList.add('feed-row-visible'));

                // Live-add new rows periodically
                if (i === feedData.length - 1) startLiveFeed();
            }, i * 220);
        });
    }

    const liveTypes = ['DNS Poison', 'Phishing', 'Scan', 'Trojan Drop', 'Botnet', 'MITM'];
    const liveSevs = ['LOW', 'MED', 'HIGH', 'CRIT'];
    const liveStatuses = ['BLOCKED', 'LOGGED', 'QUARANTINE', 'MITIGATED'];
    const sevColors = { LOW: '#1E3A8A', MED: '#F97316', HIGH: '#F97316', CRIT: '#F97316' };

    function startLiveFeed() {
        setInterval(() => {
            if (!feedEl) return;
            const now = new Date();
            const hh = String(now.getUTCHours()).padStart(2, '0');
            const mm = String(now.getUTCMinutes()).padStart(2, '0');
            const type = liveTypes[Math.floor(Math.random() * liveTypes.length)];
            const sev = liveSevs[Math.floor(Math.random() * liveSevs.length)];
            const status = liveStatuses[Math.floor(Math.random() * liveStatuses.length)];
            const ip = `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200)}.x.x`;

            const row = document.createElement('div');
            row.className = 'feed-row feed-row-enter';
            row.innerHTML = `
                <span class="feed-time">${hh}:${mm}</span>
                <span class="feed-type" style="color:${sevColors[sev]}">${type}</span>
                <span class="feed-src">${ip}</span>
                <span class="feed-sev sev-${sev.toLowerCase()}">${sev}</span>
                <span class="feed-status">${status}</span>
            `;
            feedEl.insertBefore(row, feedEl.firstChild);
            requestAnimationFrame(() => row.classList.add('feed-row-visible'));

            // Keep max 10 rows
            while (feedEl.children.length > 10) {
                feedEl.removeChild(feedEl.lastChild);
            }
        }, 4000);
    }

    // ── 7. EVENT LOG TABLE ───────────────────────────────────────────
    const tbody = document.getElementById('events-tbody');
    const eventCountEl = document.getElementById('event-count');
    const events = [
        { time: '22:41:03', type: 'Phishing Attempt', src: '185.220.101.47', sev: 'HIGH', status: 'BLOCKED' },
        { time: '22:39:51', type: 'Port Scan', src: '103.14.250.14', sev: 'LOW', status: 'LOGGED' },
        { time: '22:37:22', type: 'Brute Force SSH', src: '91.193.18.202', sev: 'MEDIUM', status: 'BLOCKED' },
        { time: '22:35:10', type: 'Malware Dropper', src: '45.147.200.91', sev: 'HIGH', status: 'QUARANTINE' },
        { time: '22:33:08', type: 'SQL Injection', src: '194.165.16.76', sev: 'CRITICAL', status: 'BLOCKED' },
        { time: '22:30:44', type: 'DDoS Pulse', src: '198.98.53.115', sev: 'MEDIUM', status: 'MITIGATED' },
        { time: '22:28:19', type: 'XSS Probe', src: '89.248.165.38', sev: 'LOW', status: 'LOGGED' },
    ];

    if (tbody) {
        const tableObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    populateTable();
                    tableObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        tableObserver.observe(tbody);
    }

    function populateTable() {
        if (!tbody) return;
        events.forEach((ev, i) => {
            setTimeout(() => {
                const tr = document.createElement('tr');
                tr.className = 'event-row-enter';
                const sevClass = `sev-${ev.sev.toLowerCase().replace(' ', '')}`;
                const statusClass = ev.status === 'BLOCKED' || ev.status === 'QUARANTINE' ? 'stat-blocked' : ev.status === 'MITIGATED' ? 'stat-mitigated' : 'stat-logged';
                tr.innerHTML = `
                    <td class="ev-time">${ev.time}</td>
                    <td class="ev-type">${ev.type}</td>
                    <td class="ev-src">${ev.src}</td>
                    <td><span class="ev-sev ${sevClass}">${ev.sev}</span></td>
                    <td><span class="ev-status ${statusClass}">${ev.status}</span></td>
                `;
                tbody.appendChild(tr);
                requestAnimationFrame(() => tr.classList.add('event-row-visible'));
                if (eventCountEl) eventCountEl.textContent = `${i + 1} events`;
            }, i * 150);
        });
    }

    // ── 8. ACTIVITY SPARKLINE CHART ───────────────────────────────────
    const actCanvas = document.getElementById('activity-chart');
    if (actCanvas) {
        const actObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    drawActivityChart(actCanvas);
                    actObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        actObserver.observe(actCanvas);
    }

    function drawActivityChart(canvas) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        // 24 hours of simulated data
        const raw = [80, 120, 200, 180, 160, 90, 70, 85, 140, 190, 220, 175, 130, 100, 115, 145, 180, 210, 165, 130, 90, 75, 85, 95];
        const max = Math.max(...raw);
        const points = raw.map((v, i) => ({
            x: (i / (raw.length - 1)) * (W - 20) + 10,
            y: H - 20 - ((v / max) * (H - 35))
        }));

        const duration = 1200;
        const start = performance.now();

        function animate(now) {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            const visibleCount = Math.max(2, Math.floor(eased * points.length));
            ctx.clearRect(0, 0, W, H);

            // Grid lines
            ctx.strokeStyle = 'rgba(249, 250, 251,0.04)';
            ctx.lineWidth = 0.5;
            for (let y = 0; y <= H - 20; y += (H - 20) / 4) {
                ctx.beginPath(); ctx.moveTo(10, y + 10); ctx.lineTo(W - 10, y + 10); ctx.stroke();
            }

            // Fill under curve
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(249,115,22,0.3)');
            grad.addColorStop(1, 'rgba(249,115,22,0.0)');

            ctx.beginPath();
            ctx.moveTo(points[0].x, H - 20);
            ctx.lineTo(points[0].x, points[0].y);
            for (let i = 1; i < visibleCount; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[visibleCount - 1].x, H - 20);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < visibleCount; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = '#F97316';
            ctx.lineWidth = 2;
            ctx.stroke();

            // X-axis labels
            ctx.fillStyle = 'rgba(249, 250, 251,0.25)';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ['00', '06', '12', '18', '24'].forEach((label, i) => {
                const x = (i / 4) * (W - 20) + 10;
                ctx.fillText(label + 'h', x, H - 4);
            });

            if (elapsed < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ── 9. KPI LIVE COUNTER FLICKER ───────────────────────────────────
    const kpiObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startKpiFlicker();
                kpiObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const kpiRow = document.querySelector('.dashboard-kpi-row');
    if (kpiRow) kpiObserver.observe(kpiRow);

    function startKpiFlicker() {
        // Blocked counter flicker
        const kpiBlocked = document.getElementById('kpi-blocked');
        if (kpiBlocked) {
            let count = 8900;
            const blockedInterval = setInterval(() => {
                count += Math.floor(Math.random() * 3);
                kpiBlocked.textContent = count.toLocaleString();
                if (count >= 8934) clearInterval(blockedInterval);
            }, 80);
        }

        // Queries counter
        const kpiQueries = document.getElementById('kpi-queries');
        if (kpiQueries) {
            let qCount = 1100000;
            const qInterval = setInterval(() => {
                qCount += Math.floor(Math.random() * 5000);
                kpiQueries.textContent = (qCount / 1000000).toFixed(1) + 'M';
                if (qCount >= 1200000) clearInterval(qInterval);
            }, 60);
        }
    }

    // ── 10. LIVE KPI MINOR UPDATES ────────────────────────────────────
    setInterval(() => {
        const kpiNodes = document.getElementById('kpi-nodes');
        if (kpiNodes) {
            const n = 240 + Math.floor(Math.random() * 15);
            kpiNodes.textContent = n;
        }
        const kpiAi = document.getElementById('kpi-ai');
        if (kpiAi) {
            const ai = (99.0 + Math.random() * 0.8).toFixed(1);
            kpiAi.textContent = ai + '%';
        }
    }, 5000);
});

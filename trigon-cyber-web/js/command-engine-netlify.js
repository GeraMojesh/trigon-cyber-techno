import { TerminalUI } from './terminal.js';
import * as API from './api.js';

export class CommandEngine {
    constructor(terminalUI) {
        this.terminal = terminalUI;
        this.input = document.getElementById('command-input');
        this.suggestBox = document.getElementById('auto-suggestion-box');
        
        this.history = [];
        this.historyIndex = -1;
        
        // ── Trimmed command list (removed: research, repo, roadmap, systems,
        //    fields, intel, threats/threads, demo, news, search, social) ──
        this.commands = [
            'help', 'info', 'about', 'features', 'projects', 'services',
            'partner', 'founder', 'ceo', 'coo', 'dashboard', 'tools',
            'network', 'security', 'status', 'scan', 'threat',
            'updates', 'version', 'contact', 'collaborate', 'clear'
        ];

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('input', () => this.handleInput());

        // ── FIX: Only refocus terminal input when user clicks INSIDE the
        //    terminal section itself — NOT on any random part of the page.
        const terminalSection = document.getElementById('hero');
        if (terminalSection) {
            terminalSection.addEventListener('click', (e) => {
                if (!e.target.closest('.shortcut-btn') &&
                    !e.target.closest('#profile-popup') &&
                    !e.target.closest('#cinema-overlay') &&
                    !e.target.closest('.spatial-card')) {
                    this.terminal.focusInput();
                }
            });
        }
    }

    showPopup(title, subtitle, contentHtml, imgUrl = null) {
        const specialCards = {
            'Founder of Trigon'  : 'card-founder',
            'Co-Founder & CEO'   : 'card-ceo',
            'COO'                : 'card-coo',
            'Partner'            : 'card-partner',
            'INTERFACE'          : 'card-dashboard',
            'PLATFORM'           : 'card-features',
            'CONTACT'            : 'card-contact',
            'COLLABORATE'        : 'card-collaborate',
        };

        let targetId = specialCards[title] || 'card-generic';
        let card = document.getElementById(targetId);

        if (!card) {
            targetId = 'card-generic';
            card = document.getElementById('card-generic');
        }

        if (targetId === 'card-generic') {
            const imgEl = card.querySelector('.card-image');
            if (imgUrl) { imgEl.src = imgUrl; imgEl.style.display = 'inline-block'; }
            else { imgEl.style.display = 'none'; }
            card.querySelector('.card-title').textContent = title;
            card.querySelector('.card-name').textContent = subtitle;
            card.querySelector('.card-desc').innerHTML = contentHtml;
        }

        const overlay  = document.getElementById('cinema-overlay');
        const universe = document.getElementById('spatial-universe');
        const termBox  = document.querySelector('.terminal-container');

        overlay.classList.add('active');
        if (termBox) termBox.classList.add('blurred-out');
        universe.classList.add('popup-active');
        card.classList.add('active-card');
        document.body.classList.add('popup-open');

        const doClose = () => {
            overlay.classList.remove('active');
            if (termBox) termBox.classList.remove('blurred-out');
            universe.classList.remove('popup-active');
            document.body.classList.remove('popup-open');
            document.querySelectorAll('.spatial-card.active-card')
                    .forEach(c => c.classList.remove('active-card'));
            overlay.removeEventListener('click', onBgClick);
            document.removeEventListener('keydown', onEsc);
        };

        const oldBtn = document.getElementById('close-popup');
        if (oldBtn) {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', (e) => { e.stopPropagation(); doClose(); });
            const positionBtn = () => {
                const rect = card.getBoundingClientRect();
                newBtn.style.top   = (rect.top  + 12) + 'px';
                newBtn.style.right = (window.innerWidth - rect.right + 12) + 'px';
            };
            requestAnimationFrame(() => { requestAnimationFrame(positionBtn); });
            window.addEventListener('resize', positionBtn);
        }

        const onBgClick = (e) => { if (e.target === overlay) doClose(); };
        overlay.addEventListener('click', onBgClick);
        const onEsc = (e) => { if (e.key === 'Escape') doClose(); };
        document.addEventListener('keydown', onEsc);
    }

    handleInput() {
        const val = this.input.value.toLowerCase();
        if (val.length === 0) {
            this.suggestBox.textContent = '';
            return;
        }
        const matches = this.commands.filter(c => c.startsWith(val));
        if (matches.length > 0) {
            this.suggestBox.innerHTML = `Suggestion: <span style="color: var(--neon-green)">${matches[0]}</span>`;
        } else {
            this.suggestBox.innerHTML = '';
        }
    }

    async handleKeyDown(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            if (cmd) {
                this.history.push(cmd);
                this.historyIndex = this.history.length;
                this.input.value = '';
                this.suggestBox.textContent = '';
                await this.executeCommand(cmd.toLowerCase());
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const val = this.input.value.toLowerCase();
            const matches = this.commands.filter(c => c.startsWith(val));
            if (matches.length > 0) {
                this.input.value = matches[0];
                this.suggestBox.textContent = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
                this.handleInput();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
            this.handleInput();
        }
    }

    async executeCommand(cmdStr) {
        const args = cmdStr.split(' ');
        const cmd  = args[0];

        this.terminal.printCommandEcho(cmdStr);
        this.terminal.showLoading();

        try {
            switch (cmd) {

                // ── META ─────────────────────────────────────────────
                case 'help':
                    this.terminal.printLine('Available commands:');
                    this.terminal.printLine(this.commands.join(', '));
                    break;

                case 'clear':
                    this.terminal.clear();
                    break;

                case 'version':
                    const vState = await API.getSystemState();
                    this.terminal.printLine(`${vState.version}<br>Security Engine v1.0<br>AI Threat Engine v0.9`);
                    break;

                case 'updates':
                    this.terminal.printLine(
                        '▸ v2.1.3 — Dashboard live telemetry enabled<br>' +
                        '▸ v2.1.2 — COO profile added to personnel registry<br>' +
                        '▸ v2.1.1 — Threat map upgraded to real-time vectors<br>' +
                        '▸ v2.1.0 — CyberOS terminal prototype shipped'
                    );
                    break;

                // ── COMPANY INFO ──────────────────────────────────────
                case 'info':
                    const infoData = await API.getCompanyInfo();
                    this.terminal.printLine(`Opening Company Info...`, 'command');
                    this.showPopup(
                        'COMPANY OVERVIEW',
                        infoData.company,
                        `Domain: ${infoData.domain}<br>Founder: ${infoData.founder}<br>Co-Founder/CEO: ${infoData.coFounder}<br><br><span style="color:var(--neon-green)">Type 'founder', 'ceo', 'coo', or 'partner' for personnel profiles.</span>`,
                        null
                    );
                    break;

                case 'about':
                    this.showPopup(
                        'ABOUT',
                        'Trigon Cyber-Techno PVT. LTD.',
                        '<span style="color:#F97316;font-weight:700">MISSION</span><br>' +
                        'AI-driven predictive defense for proactive threat detection.<br>' +
                        'Specialized in zero-day prevention and neural intelligence.<br>' +
                        'Securing enterprise systems through autonomous cybersecurity.<br><br>' +
                        '<span style="color:#7B6FF0;font-weight:700">CORE PILLARS</span><br>' +
                        '▸ Zero-Trust Security Architecture<br>' +
                        '▸ AI-First Threat Intelligence<br>' +
                        '▸ Decentralized ICP Infrastructure'
                    );
                    break;

                case 'security':
                    this.showPopup(
                        'SECURITY',
                        'Trigon Defense Framework',
                        '<span style="color:#F97316;font-weight:700">ACTIVE SYSTEMS</span><br>' +
                        'Advanced IDS, neural encryption, and malware defense active.<br>' +
                        'NIST &amp; GDPR compliant architecture.<br>' +
                        'High-integrity protection against unauthorized access.<br><br>' +
                        '<span style="color:#28c840;font-weight:700">COMPLIANCE</span><br>' +
                        '▸ NIST CSF 2.0 Aligned<br>' +
                        '▸ GDPR Article 25 — Data Protection by Design<br>' +
                        '▸ ISO/IEC 27001 Framework Ready'
                    );
                    break;

                case 'status':
                    this.showPopup(
                        'STATUS',
                        'System Status — OPERATIONAL',
                        '<span style="color:#28c840;font-weight:700">● PROTECTION STATUS: GREEN</span><br><br>' +
                        'All systems operational at peak performance.<br>' +
                        'Threat monitoring active with zero breaches detected.<br>' +
                        'AI engine confidence: 99.4%<br><br>' +
                        '<span style="color:#F97316;font-weight:700">NODES</span><br>' +
                        '▸ Firewall: 98% | Endpoint: 91%<br>' +
                        '▸ ICP Node: Synced | AI Engine: Online'
                    );
                    break;

                // ── PERSONNEL ─────────────────────────────────────────
                case 'founder':
                    this.terminal.printLine(`[PERSONNEL CLEARANCE: CORE] Loading profile...`);
                    this.showPopup(
                        'Founder of Trigon',
                        'G Mojesh',
                        '[PERSONNEL CLEARANCE: CORE]<br><br>' +
                        '<strong>Identity:</strong> G Mojesh<br>' +
                        '<strong>Rank:</strong> Founder<br><br>' +
                        '<strong>Profile:</strong> Overseeing technical architecture and high-level platform development to ensure enterprise-grade security standards.',
                        'src/frontend/assets/founder.png'
                    );
                    break;

                case 'ceo':
                case 'co-founder':
                    this.terminal.printLine(`[SECURE ACCESS GRANTED: ROOT LEVEL] Loading profile...`);
                    this.showPopup(
                        'Co-Founder & CEO',
                        'J Vinay',
                        '[SECURE ACCESS GRANTED: ROOT LEVEL]<br><br>' +
                        '<strong>Identity:</strong> J Vinay<br>' +
                        '<strong>Rank:</strong> Co-Founder &amp; CEO<br><br>' +
                        '<strong>Profile:</strong> Leading strategic operations and executive decisions. Architect of Trigon\'s vision for AI-First Intelligence and decentralized resilience.',
                        'src/frontend/assets/ceo.jpg'
                    );
                    break;

                case 'coo':
                    this.terminal.printLine(`[PERSONNEL CLEARANCE: OPERATIONAL ROOT LEVEL] Loading profile...`);
                    this.showPopup(
                        'COO',
                        'N G N V SatyaSai Chetan',
                        '[PERSONNEL CLEARANCE: OPERATIONAL ROOT LEVEL]<br><br>' +
                        '<strong>Identity:</strong> N G N V SatyaSai Chetan<br>' +
                        '<strong>Rank:</strong> COO<br><br>' +
                        '<strong>Profile:</strong> Strategic Operations &amp; Internal Defense Infrastructure.<br><br>' +
                        '<strong>Responsibility:</strong> Managing the deployment of Trigon\'s security stack and optimizing organizational workflow for maximum incident response speed.',
                        'src/frontend/assets/coo.png'
                    );
                    break;

                case 'partner':
                    const partner = await API.getPartner();
                    this.terminal.printLine(`Opening profile database for Partner...`);
                    this.showPopup(
                        'Partner',
                        partner.representative,
                        `Organization: ${partner.organization}<br>Website: ${partner.website}`,
                        'src/frontend/assets/partner.jpg'
                    );
                    break;

                // ── PLATFORM ──────────────────────────────────────────
                case 'features':
                    const features = await API.getFeatures();
                    this.terminal.printLine('Decrypting system architecture...');
                    this.showPopup('PLATFORM', 'System Features', features.join('<br>'));
                    break;

                case 'projects':
                    const projects = await API.getProjects();
                    this.terminal.printLine('Querying active initiative registry...');
                    const projHtml = projects.map(p => `<strong>${p.name}</strong> [${p.status}]<br>${p.description}`).join('<br><br>');
                    this.showPopup('PORTFOLIO', 'Active Projects', projHtml);
                    break;

                case 'services':
                    const services = await API.getServices();
                    this.showPopup('OPERATIONS', 'Trigon Services', services.join('<br>'));
                    break;

                case 'dashboard':
                    this.terminal.printLine('Launching Cyber Defense Dashboard...');
                    this.showPopup(
                        'INTERFACE',
                        'Cyber Defense Dashboard',
                        `Active Threats: <span style="color:var(--neon-green)">0 (Secure)</span><br>Network Nodes: Online<br>Security Mode: Maximum<br><br><span style="color:var(--electric-blue)">Live telemetry connection established tracking global vectors.</span>`
                    );
                    break;

                case 'tools':
                    const tools = await API.getTools();
                    this.showPopup('UTILITIES', 'Cyber Tools', tools.join('<br>'));
                    break;

                // ── NETWORK / THREAT ──────────────────────────────────
                case 'network':
                    const state = await API.getSystemState();
                    this.showPopup(
                        'DIAGNOSTICS',
                        'Network State',
                        `Network Status: ${state.networkStatus}<br>Infrastructure: ${state.infrastructure}<br>Security Mode: ${state.securityMode}`
                    );
                    break;

                case 'scan':
                    await this.terminal.typeLine('Initializing vulnerability scanner...', 'command', 10);
                    await this.terminal.typeLine('Scanning deep web nodes...', '', 20);
                    await this.terminal.typeLine('Analyzing endpoints...', '', 20);
                    this.terminal.printLine('Scan complete: 0 vulnerabilities found. System secure.');
                    break;

                case 'threat':
                    this.showPopup('INTELLIGENCE', 'Threat Radar',
                        '<span style="color:#28c840">● No active APT groups detected on Trigon infrastructure.</span><br>' +
                        'AI Scanning waves actively monitoring boundary limits.<br><br>' +
                        '▸ Phishing attempts blocked: 42 (24h)<br>' +
                        '▸ Malware signatures flagged: 28 (24h)<br>' +
                        '▸ DDoS pulses mitigated: 18 (24h)'
                    );
                    break;

                // ── CONTACT & COLLABORATE ─────────────────────────────
                case 'contact':
                    this.terminal.printLine('Opening contact card...');
                    this.showPopup('card-contact');
                    break;

                case 'collaborate':
                    this.terminal.printLine('Accessing collaboration portal...');
                    this.showPopup(
                        'COLLABORATE',
                        'Partnership & Collaboration',
                        '<div style="text-align:center;padding:1rem 0">' +
                        '<div style="font-size:2.5rem;margin-bottom:1rem">🚀</div>' +
                        '<div style="font-family:\'Outfit\',sans-serif;font-size:1.5rem;font-weight:800;color:#F97316;letter-spacing:4px;margin-bottom:0.75rem">COMING SOON</div>' +
                        '<div style="color:rgba(255,255,255,0.5);font-size:0.85rem;line-height:1.6">We are building a dedicated collaboration portal<br>for enterprise partnerships and research programs.<br><br>' +
                        '<span style="color:#7B6FF0">Stay tuned — access opens Q3 2026.</span>' +
                        '</div></div>'
                    );
                    break;

                default:
                    this.terminal.printLine(
                        `Command not found: <span style="color:#FF2D78">${cmd}</span>. Type <span style="color:#F97316">'help'</span> for available commands.`,
                        'error'
                    );
            }
        } catch (err) {
            this.terminal.printLine(`Error executing ${cmd}: ${err.message}`, 'error');
        } finally {
            this.terminal.hideLoading();
        }
    }
}

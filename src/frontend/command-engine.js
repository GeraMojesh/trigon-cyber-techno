import { TerminalUI } from './terminal.js';
import * as API from './api.js';

export class CommandEngine {
    constructor(terminalUI) {
        this.terminal = terminalUI;
        this.input = document.getElementById('command-input');
        this.suggestBox = document.getElementById('auto-suggestion-box');
        
        this.history = [];
        this.historyIndex = -1;
        
        this.commands = [
            'help', 'info', 'about', 'features', 'projects', 'services', 
            'partner', 'founder', 'ceo', 'dashboard', 'tools', 'network', 'networks', 'security', 
            'research', 'repo', 'roadmap', 'status', 'systems', 'contact', 
            'fields', 'scan', 'intel', 'threat', 'threats', 'try', 'demo', 
            'news', 'updates', 'search', 'version', 'social', 'collaborate', 'clear'
        ];

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('input', () => this.handleInput());
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.shortcut-btn') && !e.target.closest('#profile-popup')) {
                this.terminal.focusInput();
            }
        });
    }

    showPopup(title, subtitle, contentHtml, imgUrl = null) {
        const specialCards = {
            'Founder of Trigon': 'card-founder',
            'Co-Founder & CEO': 'card-ceo',
            'Partner': 'card-partner',
            'INTERFACE': 'card-dashboard',
            'PLATFORM': 'card-features'
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
        document.body.classList.add('popup-open'); // show × button

        // ── Close handler — fully self-contained, no DOM moving ────────
        const doClose = () => {
            overlay.classList.remove('active');
            if (termBox) termBox.classList.remove('blurred-out');
            universe.classList.remove('popup-active');
            document.body.classList.remove('popup-open'); // hide × button
            document.querySelectorAll('.spatial-card.active-card')
                    .forEach(c => c.classList.remove('active-card'));
            overlay.removeEventListener('click', onBgClick);
            document.removeEventListener('keydown', onEsc);
        };

        // Clone close-button to remove any stale listeners, then attach fresh one
        const oldBtn = document.getElementById('close-popup');
        if (oldBtn) {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            newBtn.addEventListener('click', (e) => { e.stopPropagation(); doClose(); });

            // Position the button inside the top-right of the active card
            const positionBtn = () => {
                const rect = card.getBoundingClientRect();
                newBtn.style.top  = (rect.top  + 12) + 'px';
                newBtn.style.right = (window.innerWidth - rect.right + 12) + 'px';
            };
            // Small delay to let the card's CSS transition start
            requestAnimationFrame(() => { requestAnimationFrame(positionBtn); });
            window.addEventListener('resize', positionBtn);
            // Clean up resize listener on close
            const origClose = doClose;
        }

        // Click the dark background to close
        const onBgClick = (e) => { if (e.target === overlay) doClose(); };
        overlay.addEventListener('click', onBgClick);

        // Escape key to close
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
            const suggestion = matches[0];
            this.suggestBox.innerHTML = `Suggestion: <span style="color: var(--neon-green)">${suggestion}</span>`;
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
        const cmd = args[0];

        this.terminal.printCommandEcho(cmdStr);
        this.terminal.showLoading();

        try {
            switch(cmd) {
                case 'help':
                    this.terminal.printLine('Available commands:');
                    this.terminal.printLine(this.commands.join(', '));
                    break;
                case 'clear':
                    this.terminal.clear();
                    break;
                case 'info':
                    const infoData = await API.getCompanyInfo();
                    this.terminal.printLine(`Opening Company Info card...`, 'command');
                    this.showPopup(
                        'COMPANY OVERVIEW',
                        infoData.company,
                        `Domain: ${infoData.domain}<br>Founder: ${infoData.founder}<br>Co-Founder/CEO: ${infoData.coFounder}<br><br><span style="color:var(--neon-green)">Type 'founder', 'ceo', or 'partner' for personnel profiles.</span>`,
                        null
                    );
                    break;
                case 'founder':
                    const fInfo = await API.getCompanyInfo();
                    this.terminal.printLine(`Opening profile database for Founder...`);
                    this.showPopup(
                        'Founder of Trigon', 
                        fInfo.founder, 
                        `Visionary architect behind ${fInfo.company}. Pioneering future ${fInfo.domain} solutions.`, 
                        'assets/founder.jpg'
                    );
                    break;
                case 'ceo':
                case 'co-founder':
                    const cInfo = await API.getCompanyInfo();
                    this.terminal.printLine(`Opening profile database for CEO...`);
                    this.showPopup(
                        'Co-Founder & CEO', 
                        cInfo.coFounder, 
                        `Leading strategic operations and executive decisions at ${cInfo.company}.`, 
                        'assets/ceo.jpg'
                    );
                    break;
                case 'about':
                    this.terminal.printLine('Accessing Trigon Mission database...');
                    this.showPopup(
                        'ABOUT',
                        'Trigon Mission',
                        'Cybersecurity intelligence<br>AI threat detection<br>Phishing email analysis<br>Malicious link verification<br>Steganography detection<br>Enterprise cyber analytics'
                    );
                    break;
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
                case 'partner':
                    const partner = await API.getPartner();
                    this.terminal.printLine(`Opening profile database for Partner...`);
                    this.showPopup(
                        'Partner', 
                        partner.representative, 
                        `Organization: ${partner.organization}<br>Website: ${partner.website}`, 
                        'assets/partner.jpg'
                    );
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
                case 'network':
                case 'networks':
                case 'status':
                case 'systems':
                    const state = await API.getSystemState();
                    this.showPopup(
                        'DIAGNOSTICS',
                        'System State',
                        `Network Status: ${state.networkStatus}<br>Infrastructure: ${state.infrastructure}<br>Security Mode: ${state.securityMode}`
                    );
                    break;
                case 'scan':
                    await this.terminal.typeLine('Initializing simulated vulnerability scanner...', 'command', 10);
                    await this.terminal.typeLine('Scanning deep web nodes...', '', 20);
                    await this.terminal.typeLine('Analyzing endpoints...', '', 20);
                    this.terminal.printLine('Scan complete: 0 vulnerabilities found. System secure.');
                    break;
                case 'intel':
                case 'threat':
                case 'threats':
                    this.showPopup('INTELLIGENCE', 'Threat Radar', '- No active APT groups detected on Trigon infrastructure.<br>- AI Scanning waves actively monitoring boundary limits.');
                    break;
                case 'try':
                case 'demo':
                    this.showPopup('INTERACTIVE', 'Platform Demos', 'Available demos:<br>1. Malicious Link Scanner Demo<br>2. Phishing Email Detection Demo<br>3. Steganography Analyzer Demo<br><br><i>Select a demo from the main console menu when authorized.</i>');
                    break;
                case 'news':
                case 'updates':
                    const news = await API.getNews();
                    this.showPopup('COMMUNICATIONS', 'System Updates', news.join('<br><br>'));
                    break;
                case 'search':
                    if (args.length < 2) {
                        this.terminal.printLine('Usage: search [query]');
                    } else {
                        await this.terminal.typeLine(`Searching for '${args.slice(1).join(' ')}'...`, 'command');
                        this.terminal.printLine('0 results found in local databanks.');
                    }
                    break;
                case 'version':
                    const vState = await API.getSystemState();
                    this.terminal.printLine(`${vState.version}<br>Security Engine v1.0<br>AI Threat Engine v0.9`);
                    break;
                case 'fields':
                    const fields = await API.getFields();
                    this.terminal.printLine(fields.join('<br>'));
                    break;
                case 'social':
                case 'contact':
                case 'collaborate':
                    this.terminal.printLine('For collaborations, contact or social links, please visit GitHub/LinkedIn references or send inquiry to Trigon contact module.');
                    break;
                case 'security':
                case 'research':
                case 'repo':
                case 'roadmap':
                    this.terminal.printLine(`${cmd} module loaded: Content pending clearance from CyberOS Admin.`);
                    break;
                default:
                    this.terminal.printLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
            }
        } catch (e) {
            this.terminal.printLine(`Error executing ${cmd}: ${e.message}`, 'error');
        } finally {
            this.terminal.hideLoading();
        }
    }
}

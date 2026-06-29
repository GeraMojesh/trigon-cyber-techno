import { SYSTEM_CONFIG } from './config.js';

export class TerminalUI {
    constructor() {
        this.outputContainer = document.getElementById('terminal-output');
        this.container = document.getElementById('terminal-container');
        this.inputElement = document.getElementById('command-input');
        this.loadingIndicator = document.getElementById('loading-indicator');
    }

    focusInput() {
        this.inputElement.focus();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text; // allow HTML tags if needed, e.g., for info tables
        this.outputContainer.appendChild(line);
        this.scrollToBottom();
    }

    async bootAnimationLine(text, speed = 15) {
        return new Promise((resolve) => {
            const line = document.createElement('div');
            line.className = `terminal-line boot-line`;
            this.outputContainer.appendChild(line);
            
            let i = 0;
            const typeChar = () => {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                    this.scrollToBottom();
                    setTimeout(typeChar, speed);
                } else {
                    setTimeout(() => {
                        line.innerHTML = `${text} <span style="color: var(--neon-green); font-weight: bold;">[ OK ]</span>`;
                        resolve();
                    }, 150);
                }
            };
            typeChar();
        });
    }

    async typeLine(text, className = '', speed = 20) {
        return new Promise((resolve) => {
            const line = document.createElement('div');
            line.className = `terminal-line typing-line ${className}`;
            this.outputContainer.appendChild(line);
            
            let i = 0;
            const typeChar = () => {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                    this.scrollToBottom();
                    setTimeout(typeChar, speed);
                } else {
                    resolve();
                }
            };
            typeChar();
        });
    }

    showLoading() {
        this.loadingIndicator.style.display = 'block';
        this.inputElement.disabled = true;
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
        this.inputElement.disabled = false;
        this.focusInput();
    }

    clear() {
        this.outputContainer.innerHTML = '';
        this.printBanner();
    }

    formatStartupBanner(raw) {
        const lines = raw.split('\n');
        let html = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                html += '\n';
                continue;
            }
            if (trimmed.startsWith('~')) {
                html += `<span class="banner-subtitle">${this.escapeHtml(line)}</span>\n`;
            } else {
                html += `<span class="banner-logo-line">${this.escapeHtml(line)}</span>\n`;
            }
        }
        return html;
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    formatTermPrompt(suffix = ':~$') {
        return `<span class="term-user">cyberos@</span><span class="term-host">trigon</span><span class="term-path">${suffix}</span>`;
    }

    printBanner() {
        const inner = this.formatStartupBanner(SYSTEM_CONFIG.startupBanner);
        const bannerStr = `<div class="ascii-art banner">${inner}</div>`;
        this.printLine(bannerStr, '');
    }

    printCommandEcho(command) {
        const prompt = this.formatTermPrompt(':~$');
        this.printLine(`${prompt} <span class="command-text">${this.escapeHtml(command)}</span>`, 'command');
    }
}

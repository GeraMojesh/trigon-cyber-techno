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

    printBanner() {
        const bannerStr = `<div class="ascii-art banner">${SYSTEM_CONFIG.startupBanner}</div>`;
        this.printLine(bannerStr, '');
    }

    printCommandEcho(command) {
        this.printLine(`cyberos@trigon:~$ ${command}`, 'command');
    }
}

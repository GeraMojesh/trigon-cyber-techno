import { SYSTEM_CONFIG } from '../../config/system.config.js';
import { CanvasBackground } from './canvas-bg.js';
import { TerminalUI } from './terminal.js';
import { CommandEngine } from './command-engine.js';
import { initNavigation } from './navigation.js';
import * as API from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init background
    const bg = new CanvasBackground('cyber-bg');

    // 2. Init Terminal
    const terminalUI = new TerminalUI();
    
    // 3. Init Engine
    const engine = new CommandEngine(terminalUI);

    // 4. Init navigation buttons
    initNavigation(engine);

    // 5. Populate 3D Vintage Content Sections
    await populateContentSections();

    // 6. Run Boot Sequence
    terminalUI.inputElement.disabled = true;
    for (const bootText of SYSTEM_CONFIG.bootSequenceText) {
        await terminalUI.bootAnimationLine(bootText, 15);
        await new Promise(r => setTimeout(r, 100)); // small delay between lines
    }
    
    await new Promise(r => setTimeout(r, 800)); // pause for visibility

    // Clear and print banner
    terminalUI.clear();
    terminalUI.inputElement.disabled = false;
    terminalUI.focusInput();

    // 7. Setup Popup Close Event
    const closePopup = () => {
        document.getElementById('cinema-overlay').classList.remove('active');
        document.querySelector('.terminal-container').classList.remove('blurred-out');
        document.getElementById('spatial-universe').classList.remove('popup-active');
        
        const activeCards = document.querySelectorAll('.spatial-card.active-card');
        activeCards.forEach(card => card.classList.remove('active-card'));
        
        terminalUI.focusInput();
    };

    document.getElementById('close-popup').addEventListener('click', closePopup);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('cinema-overlay').classList.contains('active')) {
            closePopup();
        }
    });
});

async function populateContentSections() {
    const featuresGrid = document.getElementById('features-grid');
    const projectsGrid = document.getElementById('projects-grid');

    const features = await API.getFeatures();
    features.forEach((feature, idx) => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.innerHTML = `
            <h3>0${idx+1}</h3>
            <p>${feature}</p>
        `;
        featuresGrid.appendChild(card);
    });

    const projects = await API.getProjects();
    projects.forEach((proj) => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.innerHTML = `
            <h3>${proj.name}</h3>
            <span class="status-badge">${proj.status}</span>
            <p>${proj.description}</p>
        `;
        projectsGrid.appendChild(card);
    });
}

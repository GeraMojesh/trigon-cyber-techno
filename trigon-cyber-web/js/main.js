import { SYSTEM_CONFIG } from './config.js';
import { CanvasBackground } from './canvas-bg.js';
import { TerminalUI } from './terminal.js';
import { CommandEngine } from './command-engine.js';
import { initNavigation } from './navigation.js';

document.addEventListener('DOMContentLoaded', async () => {
  new CanvasBackground('cyber-bg');
  const terminalUI = new TerminalUI();
  const engine = new CommandEngine(terminalUI);
  initNavigation(engine);

  terminalUI.inputElement.disabled = true;
  for (const line of SYSTEM_CONFIG.bootSequenceText) {
    await terminalUI.bootAnimationLine(line, 15);
    await new Promise((r) => setTimeout(r, 80));
  }
  await new Promise((r) => setTimeout(r, 600));
  terminalUI.clear();
  terminalUI.inputElement.disabled = false;
  terminalUI.focusInput();
});

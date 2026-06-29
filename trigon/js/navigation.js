export function initNavigation(commandEngine) {
    const commands = commandEngine.commands;
    const grid = document.getElementById('shortcuts-grid');
    
    // Group some commands for visual styling
    const tools = ['scan', 'search', 'intel', 'threat'];
    const system = ['network', 'status', 'version', 'systems', 'clear'];
    
    commands.forEach(cmd => {
        const btn = document.createElement('button');
        btn.className = 'shortcut-btn';
        if (tools.includes(cmd)) btn.classList.add('category-tools');
        if (system.includes(cmd)) btn.classList.add('category-system');
        
        btn.textContent = cmd;
        btn.onclick = () => {
            // Write to input and trigger execution to mimic real usage
            commandEngine.input.value = '';
            commandEngine.suggestBox.textContent = '';
            commandEngine.executeCommand(cmd);
        };
        grid.appendChild(btn);
    });
}

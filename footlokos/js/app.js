class ChecklistApp {
    constructor() {
        this.items = [];
        this.selectedItems = [];
        this.itemContents = new Map();
        this.instanceCounter = 0;
        
        this.checklistElement = document.getElementById('checklist');
        this.descriptionsContent = document.getElementById('descriptionsContent');
        this.copyButton = document.getElementById('copyButton');
        
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/data/items.json');
            const data = await response.json();
            this.items = data.items;
            this.renderChecklist();
        } catch (error) {
            console.error('Error loading items:', error);
        }
    }

    renderChecklist() {
        this.checklistElement.innerHTML = this.items.map(item => `
            <li class="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                <div class="flex items-center space-x-3">
                    <span class="text-gray-700">${item.name}</span>
                </div>
                <button
                    class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                    data-id="${item.id}"
                >
                    + Agregar
                </button>
            </li>
        `).join('');

        this.checklistElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.addItem(button));
        });
    }

    async addItem(button) {
        const id = parseInt(button.dataset.id);
        const item = this.items.find(i => i.id === id);
        const instanceId = `${id}-${this.instanceCounter++}`;
        
        try {
            const response = await fetch(`/data/texts/${item.textFile}`);
            const text = await response.text();
            this.selectedItems.push({
                instanceId,
                id,
                name: item.name,
                text
            });
            this.updateDescriptions();
        } catch (error) {
            console.error('Error loading text file:', error);
        }
    }

    removeItem(instanceId) {
        this.selectedItems = this.selectedItems.filter(item => item.instanceId !== instanceId);
        this.updateDescriptions();
    }

    updateDescriptions() {
        if (this.selectedItems.length === 0) {
            this.descriptionsContent.innerHTML = '<div class="text-gray-500 text-center py-8">Seleccione elementos para ver sus descripciones</div>';
            this.copyButton.disabled = true;
        } else {
            const descriptions = this.selectedItems.map(item => `
                <div class="bg-white p-4 rounded-lg shadow-sm relative group">
                    <button 
                        onclick="app.removeItem('${item.instanceId}')"
                        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        ✕
                    </button>
                    <h3 class="font-semibold text-gray-800 mb-2">${item.name}</h3>
                    <div class="text-gray-600 whitespace-pre-line">${item.text}</div>
                </div>
            `).join('');
            
            this.descriptionsContent.innerHTML = descriptions;
            this.copyButton.disabled = false;
        }
    }

    async copyToClipboard() {
        if (this.selectedItems.length === 0) return;

        try {
            const textToCopy = this.selectedItems
                .map(item => `${item.name}:\n${item.text}`)
                .join('\n\n');

            await navigator.clipboard.writeText(textToCopy);
            
            this.copyButton.classList.remove('bg-gray-100', 'text-gray-700');
            this.copyButton.classList.add('bg-green-100', 'text-green-700');
            this.copyButton.textContent = '✓ Copiado!';
            
            setTimeout(() => {
                this.copyButton.classList.remove('bg-green-100', 'text-green-700');
                this.copyButton.classList.add('bg-gray-100', 'text-gray-700');
                this.copyButton.innerHTML = '📋 Copiar Todo';
            }, 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    }
}

// Iniciar la aplicación
const app = new ChecklistApp();
window.app = app; // Necesario para acceder a removeItem desde el HTML
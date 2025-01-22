function populateChecklist(data) {
    const checklist = document.getElementById('checklist');
    const output = document.getElementById('output');

    data.items.forEach(item => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.filename = item.filename;
        checkbox.addEventListener('change', updateOutput);

        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(item.name));
        checklist.appendChild(li);
    });

    async function updateOutput() {
        const selected = document.querySelectorAll('#checklist input:checked');
        let text = '';
    
        for (const checkbox of selected) {  // Uso de for...of en lugar de forEach
            const filename = checkbox.dataset.filename;
            const fileContent = await fetchFileContent(filename);
            text += `${fileContent}\n\n`; // Agrega un salto de línea entre descripciones
        }
    
        output.value = text.trim();
    }
    

    async function fetchFileContent(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${filename}`);
            }
            return await response.text();
        } catch (error) {
            console.error(error);
            return 'Error loading file.';
        }
    }
}

document.getElementById('copyButton').addEventListener('click', () => {
    const output = document.getElementById('output');
    output.select();
    document.execCommand('copy');
    alert('Text copied to clipboard!');
});

loadChecklistData();





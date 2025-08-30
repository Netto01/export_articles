class ExportArticles {
    constructor() {
        this.files = [];
        this.selectedFiles = new Set();
        this.init();
    }

    init() {
        this.bindEvents();
        this.showStatus('Pronto para escanear páginas web', 'info');
    }

    bindEvents() {
        // Event listeners
        document.getElementById('scan-btn').addEventListener('click', () => this.scanPage());
        document.getElementById('select-all').addEventListener('click', () => this.toggleSelectAll());
        document.getElementById('download-selected').addEventListener('click', () => this.downloadSelected());
        
        // Enter key na URL
        document.getElementById('url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.scanPage();
            }
        });

        // Checkbox "Todos"
        document.getElementById('all').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.filter-grid input[type="checkbox"]:not(#all)');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    async scanPage() {
        const urlInput = document.getElementById('url');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showStatus('Por favor, insira uma URL válida', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showStatus('URL inválida. Use o formato: https://exemplo.com', 'error');
            return;
        }

        const scanBtn = document.getElementById('scan-btn');
        const originalText = scanBtn.innerHTML;
        
        try {
            scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
            scanBtn.disabled = true;

            this.showStatus('Escaneando página em busca de arquivos...', 'info');

            const filters = this.getSelectedFilters();
            const depth = document.getElementById('depth').value;

            const response = await fetch('/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    filters: filters,
                    depth: parseInt(depth)
                })
            });

            const result = await response.json();

            if (result.success) {
                this.files = result.files;
                this.displayFiles();
                this.showStatus(`Encontrados ${this.files.length} arquivo(s)`, 'success');
            } else {
                this.showStatus(`Erro ao escanear: ${result.error}`, 'error');
            }

        } catch (error) {
            console.error('Erro ao escanear:', error);
            this.showStatus('Erro de conexão com o servidor', 'error');
        } finally {
            scanBtn.innerHTML = originalText;
            scanBtn.disabled = false;
        }
    }

    getSelectedFilters() {
        const filters = [];
        const checkboxes = {
            'pdf': ['.pdf'],
            'doc': ['.doc', '.docx'],
            'xls': ['.xls', '.xlsx'],
            'ppt': ['.ppt', '.pptx'],
            'txt': ['.txt'],
            'zip': ['.zip', '.rar', '.7z'],
            'img': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']
        };

        for (const [id, extensions] of Object.entries(checkboxes)) {
            if (document.getElementById(id).checked) {
                filters.push(...extensions);
            }
        }

        return filters;
    }

    displayFiles() {
        const filesList = document.getElementById('files-list');
        const resultsSection = document.getElementById('results-section');
        
        if (this.files.length === 0) {
            filesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhum arquivo encontrado com os filtros selecionados.</p>';
        } else {
            filesList.innerHTML = this.files.map((file, index) => 
                this.createFileItem(file, index)
            ).join('');
        }
        
        resultsSection.style.display = 'block';
        this.selectedFiles.clear();
        this.updateDownloadButton();
    }

    createFileItem(file, index) {
        const extension = this.getFileExtension(file.name);
        const fileType = this.getFileTypeClass(extension);
        const sizeText = file.size ? this.formatFileSize(file.size) : 'Desconhecido';
        
        return `
            <div class="file-item">
                <input type="checkbox" class="file-checkbox" data-index="${index}" onchange="exportApp.toggleFileSelection(${index})">
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-url">${this.escapeHtml(file.url)}</div>
                </div>
                <div class="file-size">${sizeText}</div>
                <div class="file-type ${fileType}">${extension.replace('.', '')}</div>
            </div>
        `;
    }

    toggleFileSelection(index) {
        if (this.selectedFiles.has(index)) {
            this.selectedFiles.delete(index);
        } else {
            this.selectedFiles.add(index);
        }
        this.updateDownloadButton();
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        const allSelected = this.selectedFiles.size === this.files.length;
        
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = !allSelected;
            if (!allSelected) {
                this.selectedFiles.add(index);
            } else {
                this.selectedFiles.delete(index);
            }
        });
        
        this.updateDownloadButton();
        
        const selectAllBtn = document.getElementById('select-all');
        selectAllBtn.innerHTML = allSelected 
            ? '<i class="fas fa-check-square"></i> Selecionar Todos'
            : '<i class="fas fa-square"></i> Desselecionar Todos';
    }

    updateDownloadButton() {
        const downloadBtn = document.getElementById('download-selected');
        downloadBtn.disabled = this.selectedFiles.size === 0;
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download Selecionados (${this.selectedFiles.size})`;
    }

    async downloadSelected() {
        if (this.selectedFiles.size === 0) {
            this.showStatus('Selecione pelo menos um arquivo para download', 'error');
            return;
        }

        const selectedFilesList = Array.from(this.selectedFiles).map(index => this.files[index]);
        const downloadBtn = document.getElementById('download-selected');
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        try {
            downloadBtn.disabled = true;
            progressSection.style.display = 'block';
            
            this.showStatus(`Iniciando download de ${selectedFilesList.length} arquivo(s)...`, 'info');

            // Enviar lista de arquivos para o servidor
            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    files: selectedFilesList
                })
            });

            if (response.ok) {
                // Criar um link para download do arquivo ZIP
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'exported_files.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                progressFill.style.width = '100%';
                progressText.textContent = 'Download concluído!';
                
                this.showStatus(`Download de ${selectedFilesList.length} arquivo(s) concluído com sucesso!`, 'success');
                
                setTimeout(() => {
                    progressSection.style.display = 'none';
                    progressFill.style.width = '0%';
                }, 3000);
                
            } else {
                const result = await response.json();
                this.showStatus(`Erro no download: ${result.error}`, 'error');
            }

        } catch (error) {
            console.error('Erro no download:', error);
            this.showStatus('Erro de conexão durante o download', 'error');
        } finally {
            downloadBtn.disabled = false;
            progressSection.style.display = 'none';
            progressFill.style.width = '0%';
        }
    }

    getFileExtension(filename) {
        return filename.toLowerCase().substring(filename.lastIndexOf('.'));
    }

    getFileTypeClass(extension) {
        const types = {
            '.pdf': 'pdf',
            '.doc': 'doc', '.docx': 'doc',
            '.xls': 'xls', '.xlsx': 'xls',
            '.ppt': 'ppt', '.pptx': 'ppt',
            '.txt': 'txt',
            '.zip': 'zip', '.rar': 'zip', '.7z': 'zip',
            '.jpg': 'img', '.jpeg': 'img', '.png': 'img', '.gif': 'img', '.bmp': 'img', '.svg': 'img'
        };
        return types[extension] || 'txt';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    showStatus(message, type) {
        const statusContainer = document.getElementById('status-messages');
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        
        // Remover mensagens antigas
        statusContainer.innerHTML = '';
        statusContainer.appendChild(statusDiv);
        
        // Auto-remove after 5 seconds for success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 5000);
        }
    }
}

// Inicializar a aplicação
const exportApp = new ExportArticles();

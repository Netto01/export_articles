from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import os
import zipfile
import tempfile
import threading
import time
from urllib.parse import urljoin, urlparse
import mimetypes
from pathlib import Path
import re

app = Flask(__name__, static_folder='.')
CORS(app)

# Configurações
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB por arquivo
MAX_TOTAL_SIZE = 500 * 1024 * 1024  # 500MB total
REQUEST_TIMEOUT = 30
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

class FileScanner:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def scan_page(self, url, filters, depth=1):
        """Escaneia uma página em busca de arquivos"""
        try:
            visited_urls = set()
            found_files = []
            
            self._scan_recursive(url, filters, depth, visited_urls, found_files)
            
            # Remover duplicatas
            unique_files = []
            seen_urls = set()
            for file in found_files:
                if file['url'] not in seen_urls:
                    unique_files.append(file)
                    seen_urls.add(file['url'])
            
            return {'success': True, 'files': unique_files}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _scan_recursive(self, url, filters, depth, visited_urls, found_files):
        """Escaneia recursivamente as páginas"""
        if depth <= 0 or url in visited_urls:
            return
        
        visited_urls.add(url)
        
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html5lib')
            
            # Buscar arquivos na página atual
            files = self._extract_files(soup, url, filters)
            found_files.extend(files)
            
            # Se ainda há profundidade, buscar em links internos
            if depth > 1:
                links = self._extract_internal_links(soup, url)
                for link in links[:10]:  # Limitar a 10 links por página
                    self._scan_recursive(link, filters, depth - 1, visited_urls, found_files)
                    
        except Exception as e:
            print(f"Erro ao processar URL {url}: {e}")
    
    def _extract_files(self, soup, base_url, filters):
        """Extrai arquivos da página"""
        files = []
        
        # Buscar em links <a>
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            if self._is_valid_file(full_url, filters):
                file_info = self._get_file_info(full_url, link.get_text(strip=True))
                if file_info:
                    files.append(file_info)
        
        # Buscar em outros elementos que podem conter arquivos
        for element in soup.find_all(['img', 'source', 'embed', 'object']):
            src = element.get('src') or element.get('data')
            if src:
                full_url = urljoin(base_url, src)
                if self._is_valid_file(full_url, filters):
                    file_info = self._get_file_info(full_url, element.get('alt', ''))
                    if file_info:
                        files.append(file_info)
        
        return files
    
    def _extract_internal_links(self, soup, base_url):
        """Extrai links internos para navegação recursiva"""
        base_domain = urlparse(base_url).netloc
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            # Verificar se é do mesmo domínio
            if urlparse(full_url).netloc == base_domain:
                # Evitar arquivos e âncoras
                if not self._is_file_url(full_url) and '#' not in full_url:
                    links.append(full_url)
        
        return links
    
    def _is_valid_file(self, url, filters):
        """Verifica se a URL é de um arquivo válido"""
        if not filters:
            return True
        
        parsed_url = urlparse(url)
        path = parsed_url.path.lower()
        
        return any(path.endswith(ext) for ext in filters)
    
    def _is_file_url(self, url):
        """Verifica se a URL aponta para um arquivo"""
        file_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
                          '.txt', '.zip', '.rar', '.7z', '.jpg', '.jpeg', '.png', 
                          '.gif', '.bmp', '.svg', '.mp3', '.mp4', '.avi']
        
        parsed_url = urlparse(url)
        path = parsed_url.path.lower()
        
        return any(path.endswith(ext) for ext in file_extensions)
    
    def _get_file_info(self, url, name):
        """Obtém informações do arquivo"""
        try:
            # Fazer HEAD request para obter tamanho
            head_response = self.session.head(url, timeout=10)
            size = head_response.headers.get('content-length')
            size = int(size) if size and size.isdigit() else None
            
            # Obter nome do arquivo
            if not name:
                name = os.path.basename(urlparse(url).path)
            if not name:
                name = f"arquivo_{int(time.time())}"
            
            # Verificar se o arquivo não é muito grande
            if size and size > MAX_FILE_SIZE:
                return None
            
            return {
                'name': name,
                'url': url,
                'size': size
            }
            
        except Exception:
            # Se não conseguir obter info, retornar com informações básicas
            name = name or os.path.basename(urlparse(url).path) or "arquivo"
            return {
                'name': name,
                'url': url,
                'size': None
            }

class FileDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
    
    def download_files(self, files):
        """Baixa arquivos e cria um ZIP"""
        try:
            # Criar diretório temporário
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, 'exported_files.zip')
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                total_size = 0
                
                for i, file_info in enumerate(files):
                    try:
                        # Verificar limite de tamanho total
                        if total_size > MAX_TOTAL_SIZE:
                            break
                        
                        response = self.session.get(
                            file_info['url'], 
                            timeout=REQUEST_TIMEOUT,
                            stream=True
                        )
                        response.raise_for_status()
                        
                        # Obter nome do arquivo
                        filename = self._get_safe_filename(file_info['name'], i)
                        
                        # Escrever arquivo no ZIP
                        content = b''
                        for chunk in response.iter_content(chunk_size=8192):
                            content += chunk
                            if len(content) > MAX_FILE_SIZE:
                                break
                        
                        if content:
                            zip_file.writestr(filename, content)
                            total_size += len(content)
                        
                    except Exception as e:
                        print(f"Erro ao baixar {file_info['url']}: {e}")
                        continue
            
            return zip_path
            
        except Exception as e:
            raise Exception(f"Erro ao criar arquivo ZIP: {e}")
    
    def _get_safe_filename(self, filename, index):
        """Gera um nome de arquivo seguro"""
        if not filename:
            filename = f"arquivo_{index}"
        
        # Remover caracteres perigosos
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = filename.strip()
        
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename

# Instâncias globais
scanner = FileScanner()
downloader = FileDownloader()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

@app.route('/scan', methods=['POST'])
def scan_page():
    """Endpoint para escanear uma página"""
    try:
        data = request.get_json()
        url = data.get('url')
        filters = data.get('filters', [])
        depth = data.get('depth', 1)
        
        if not url:
            return jsonify({'success': False, 'error': 'URL é obrigatória'}), 400
        
        # Validar URL
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        result = scanner.scan_page(url, filters, depth)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def download_files():
    """Endpoint para baixar arquivos"""
    try:
        data = request.get_json()
        files = data.get('files', [])
        
        if not files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        # Baixar arquivos e criar ZIP
        zip_path = downloader.download_files(files)
        
        return send_file(
            zip_path,
            as_attachment=True,
            download_name='exported_files.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Iniciando Export Articles...")
    print("📝 Acesse: http://localhost:8080")
    print("🔍 Para parar o servidor, pressione Ctrl+C")
    app.run(debug=True, host='0.0.0.0', port=8080)

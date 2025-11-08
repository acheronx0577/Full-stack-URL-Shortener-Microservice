// URL Shortener Frontend
document.addEventListener('DOMContentLoaded', function() {
    const shortenBtn = document.getElementById('shorten');
    const urlInput = document.getElementById('urlInput');
    const output = document.getElementById('output');
    const resultDiv = document.getElementById('result');
    const totalUrls = document.getElementById('total-urls');
    const activeUrls = document.getElementById('active-urls');

    // Update stats
    function updateStats() {
        // In a real app, you'd fetch this from the backend
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                totalUrls.textContent = data.total || '0';
                activeUrls.textContent = data.active || '0';
            })
            .catch(() => {
                // Fallback stats
                totalUrls.textContent = '0';
                activeUrls.textContent = '0';
            });
    }

    // Copy to clipboard function
    function copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const copyBtn = buttonElement;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'COPIED!';
            copyBtn.style.background = 'var(--accent-success)';
            copyBtn.style.borderColor = 'var(--accent-success)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'var(--accent-purple)';
                copyBtn.style.borderColor = 'var(--accent-purple)';
            }, 2000);
        }).catch((err) => {
            alert('Failed to copy to clipboard');
        });
    }

    // Shorten URL function
    shortenBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert("Please enter a URL to shorten!");
            return;
        }

        // Show loading state
        output.classList.remove('hide');
        resultDiv.innerHTML = '<div style="text-align: center; color: var(--text-dim);">PROCESSING_URL...</div>';
        shortenBtn.disabled = true;
        shortenBtn.textContent = 'SHORTENING...';

        // Send POST request to backend
        fetch('/api/shorturl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `url=${encodeURIComponent(url)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultDiv.innerHTML = `
                    <div style="color: var(--accent-error); text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                        <div style="font-weight: 600; margin-bottom: 10px;">INVALID_URL</div>
                        <div>Please enter a valid HTTP/HTTPS URL</div>
                    </div>
                `;
            } else {
                const shortUrl = `${window.location.origin}/api/shorturl/${data.short_url}`;
                
                resultDiv.innerHTML = `
                    <div class="url-result">
                        <div class="original-url">
                            <strong>ORIGINAL:</strong><br>
                            ${data.original_url}
                        </div>
                        <div class="short-url">
                            <strong>SHORTENED:</strong><br>
                            ${shortUrl}
                        </div>
                        <button class="copy-btn" onclick="copyToClipboard('${shortUrl}', this)">
                            COPY_URL
                        </button>
                    </div>
                    <div style="color: var(--accent-success); text-align: center; margin-top: 15px;">
                        ✅ URL successfully shortened!
                    </div>
                `;
                
                // Update stats
                updateStats();
            }
        })
        .catch(error => {
            resultDiv.innerHTML = `
                <div style="color: var(--accent-error); text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 10px;">❌</div>
                    <div>NETWORK_ERROR: Failed to shorten URL</div>
                </div>
            `;
        })
        .finally(() => {
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'SHORTEN_URL';
        });
    });

    // Enter key support
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            shortenBtn.click();
        }
    });

    // Initialize stats
    updateStats();

    // Add some example URLs for quick testing
    urlInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'https://example.com';
        }
    });

    // Global function for copy button
    window.copyToClipboard = copyToClipboard;
});

// Example usage with predefined URL
console.log("URL Shortener Microservice Frontend Loaded");
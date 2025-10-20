const express = require('express');
const { applyMiddleware, errorHandler, notFoundHandler } = require('./middleware');

// Import routes
const userRoutes = require('./routes/users');
const imageRoutes = require('./routes/images');

const app = express();

// Apply global middleware
applyMiddleware(app);

// Root documentation page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forge Backend API Documentation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 30px; }
        .test-section { background: #e8f5e8; padding: 20px; border-radius: 6px; margin-bottom: 30px; border-left: 4px solid #27ae60; }
        .test-section h2 { color: #27ae60; margin-bottom: 15px; }
        .test-controls { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .btn { 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .btn-primary { background: #3498db; color: white; }
        .btn-primary:hover { background: #2980b9; }
        .btn-success { background: #27ae60; color: white; }
        .btn-success:hover { background: #229954; }
        .endpoint { 
            border: 1px solid #e1e8ed; 
            border-radius: 6px; 
            margin-bottom: 20px; 
            overflow: hidden;
        }
        .endpoint-header { 
            padding: 15px 20px; 
            background: #f8f9fa; 
            border-bottom: 1px solid #e1e8ed;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .method { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-weight: bold; 
            font-size: 12px;
            text-transform: uppercase;
        }
        .method.get { background: #d4edda; color: #155724; }
        .method.post { background: #d1ecf1; color: #0c5460; }
        .method.delete { background: #f8d7da; color: #721c24; }
        .endpoint-path { font-family: monospace; font-weight: 500; margin-left: 10px; }
        .endpoint-body { padding: 20px; }
        .endpoint-desc { margin-bottom: 15px; color: #555; }
        .params { margin-top: 15px; }
        .params h4 { margin-bottom: 8px; color: #2c3e50; }
        .param { 
            background: #f8f9fa; 
            padding: 8px 12px; 
            margin: 5px 0; 
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
        .test-result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 4px; 
            font-family: monospace; 
            font-size: 14px;
            white-space: pre-wrap;
            display: none;
        }
        .test-result.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .test-result.error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .loading { display: none; color: #6c757d; }
      </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Forge Backend API</h1>
            <p>AI-powered image analysis service documentation and testing interface</p>
        </div>
        
        <div class="content">
            <div class="test-section">
                <h2>Quick Test Suite</h2>
                <p>Test common APIs with predefined data (excluding file upload and destructive endpoints)</p>
                <div class="test-controls">
                    <span><strong>Test User ID:</strong> 712020:7d7c92b6-e4a1-4a3d-b7c0-4feb30cf2ecc</span>
                    <span><strong>Test Image ID:</strong> d0b455ab-d8d4-4b85-b7e3-3e8e90edd9b8</span>
                    <button class="btn btn-success" onclick="runAllTests()">Run All Tests</button>
                    <button class="btn btn-primary" onclick="clearResults()">Clear Results</button>
                </div>
                <div id="globalResults" class="test-result"></div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/health</span>
                    </div>
                    <button class="btn btn-primary" onclick="testEndpoint('/health', 'GET', null, 'health')">Test</button>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Health check endpoint to verify service status</div>
                    <div id="health-result" class="test-result"></div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/images/capabilities</span>
                    </div>
                    <button class="btn btn-primary" onclick="testEndpoint('/api/images/capabilities', 'GET', null, 'capabilities')">Test</button>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Get AI analysis capabilities (supported models and prompt types)</div>
                    <div id="capabilities-result" class="test-result"></div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/users</span>
                    </div>
                    <button class="btn btn-primary" onclick="testCreateUser()">Test</button>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Create or check if user exists</div>
                    <div class="params">
                        <h4>Request Body:</h4>
                        <div class="param">{ "id": "string" }</div>
                    </div>
                    <div id="users-result" class="test-result"></div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/users/:userId/images</span>
                    </div>
                    <button class="btn btn-primary" onclick="testUserImages()">Test</button>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Get user's image analysis history</div>
                    <div class="params">
                        <h4>Path Parameters:</h4>
                        <div class="param">userId: User identifier</div>
                    </div>
                    <div id="userImages-result" class="test-result"></div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method get">GET</span>
                        <span class="endpoint-path">/api/images/:imageId</span>
                    </div>
                    <button class="btn btn-primary" onclick="testImageResult()">Test</button>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Get image analysis result by ID</div>
                    <div class="params">
                        <h4>Path Parameters:</h4>
                        <div class="param">imageId: Image analysis task identifier</div>
                    </div>
                    <div id="imageResult-result" class="test-result"></div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method delete">DELETE</span>
                        <span class="endpoint-path">/api/images/:imageId</span>
                    </div>
                    <span style="color: #6c757d; font-style: italic;">Destructive operation - manual testing only</span>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Delete image analysis record (including storage and database)</div>
                    <div class="params">
                        <h4>Path Parameters:</h4>
                        <div class="param">imageId: Image analysis task identifier</div>
                    </div>
                </div>
            </div>

            <div class="endpoint">
                <div class="endpoint-header">
                    <div>
                        <span class="method post">POST</span>
                        <span class="endpoint-path">/api/images</span>
                    </div>
                    <span style="color: #6c757d; font-style: italic;">File upload - manual testing required</span>
                </div>
                <div class="endpoint-body">
                    <div class="endpoint-desc">Create image analysis task (upload image and queue for analysis)</div>
                    <div class="params">
                        <h4>Request Body (multipart/form-data):</h4>
                        <div class="param">imageFile: Image file to analyze</div>
                        <div class="param">prompt: Analysis prompt text</div>
                        <div class="param">model_name: AI model to use</div>
                        <div class="param">prompt_type: Type of prompt</div>
                        <div class="param">language: Response language</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

    <script>
        const TEST_USER_ID = '712020:7d7c92b6-e4a1-4a3d-b7c0-4feb30cf2ecc';
        const TEST_IMAGE_ID = 'd0b455ab-d8d4-4b85-b7e3-3e8e90edd9b8';

        async function testEndpoint(url, method, body, resultId) {
            const resultDiv = document.getElementById(resultId + '-result');
            const loadingDiv = document.getElementById(resultId + '-loading');
            
            showLoading(resultId);
            
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                
                if (body) {
                    options.body = JSON.stringify(body);
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                showResult(resultId, {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                }, response.ok);
                
            } catch (error) {
                showResult(resultId, {
                    error: error.message
                }, false);
            }
        }

        function testCreateUser() {
            testEndpoint('/api/users', 'POST', { id: TEST_USER_ID }, 'users');
        }

        function testUserImages() {
            testEndpoint(\`/api/users/\${encodeURIComponent(TEST_USER_ID)}/images\`, 'GET', null, 'userImages');
        }

        function testImageResult() {
            testEndpoint(\`/api/images/\${TEST_IMAGE_ID}\`, 'GET', null, 'imageResult');
        }



        async function runAllTests() {
            const globalResults = document.getElementById('globalResults');
            globalResults.style.display = 'block';
            globalResults.className = 'test-result';
            globalResults.textContent = 'Running tests...';
            
            const tests = [
                { name: 'Health Check', fn: () => testEndpoint('/health', 'GET', null, 'health') },
                { name: 'AI Capabilities', fn: () => testEndpoint('/api/images/capabilities', 'GET', null, 'capabilities') },
                { name: 'Create/Check User', fn: () => testCreateUser() },
                { name: 'User Images', fn: () => testUserImages() },
                { name: 'Image Result', fn: () => testImageResult() }
            ];
            
            let results = [];
            
            for (const test of tests) {
                try {
                    await test.fn();
                    results.push(\`✅ \${test.name}: PASSED\`);
                } catch (error) {
                    results.push(\`❌ \${test.name}: FAILED - \${error.message}\`);
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
            }
            
            globalResults.className = 'test-result success';
            globalResults.textContent = \`Test Suite Results:\\n\\n\${results.join('\\n')}\`;
        }

        function clearResults() {
            const results = document.querySelectorAll('.test-result');
            results.forEach(result => {
                result.style.display = 'none';
                result.textContent = '';
            });
        }

        function showLoading(resultId) {
            const resultDiv = document.getElementById(resultId + '-result');
            resultDiv.style.display = 'block';
            resultDiv.className = 'test-result';
            resultDiv.textContent = 'Loading...';
        }

        function showResult(resultId, result, success) {
            const resultDiv = document.getElementById(resultId + '-result');
            resultDiv.style.display = 'block';
            resultDiv.className = success ? 'test-result success' : 'test-result error';
            resultDiv.textContent = JSON.stringify(result, null, 2);
        }
    </script>
    </body>
</html>`;
  
  res.send(html);
});


app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register API routes
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

// Handle 404
app.use(notFoundHandler);

// Handle all errors
app.use(errorHandler);

module.exports = app; 

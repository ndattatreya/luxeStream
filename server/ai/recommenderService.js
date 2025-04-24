const { spawn } = require('child_process');
const path = require('path');

class RecommenderService {
    constructor() {
        this.pythonPath = 'C:\\Users\\91903\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
        this.scriptPath = path.join(__dirname, 'recommender.py');
    }

    async trainModel(movies, preferences) {
        return this._executePythonScript({
            action: 'train',
            movies,
            preferences
        });
    }

    async getRecommendations(movies, preferences) {
        return this._executePythonScript({
            action: 'predict',
            movies,
            preferences
        });
    }

    async _executePythonScript(data) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn(this.pythonPath, [this.scriptPath]);

            let output = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${error}`));
                    return;
                }

                try {
                    const result = JSON.parse(output);
                    if (result.status === 'error') {
                        reject(new Error(result.message || 'Unknown error'));
                    } else {
                        resolve(result);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${e.message}`));
                }
            });

            pythonProcess.stdin.write(JSON.stringify(data));
            pythonProcess.stdin.end();
        });
    }
}

module.exports = new RecommenderService(); 
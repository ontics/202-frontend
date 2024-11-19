from flask import Flask, request, jsonify
from flask_cors import CORS
import gensim.downloader
import numpy as np

app = Flask(__name__)
# More specific CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

print("Loading word2vec model...")
model = gensim.downloader.load('word2vec-google-news-300')
print("Model loaded successfully!")

@app.route('/calculate-similarity', methods=['POST', 'OPTIONS'])
def calculate_similarity():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        word1 = data.get('word1', '').lower()
        word2 = data.get('word2', '').lower()
        
        print(f"Calculating similarity between '{word1}' and '{word2}'")
        similarity = model.similarity(word1, word2)
        print(f"Similarity: {similarity}")
        
        return jsonify({'similarity': float(similarity)})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(host='127.0.0.1', port=5000, debug=True) 
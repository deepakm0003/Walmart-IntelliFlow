import os
os.environ['FLASK_SKIP_DOTENV'] = '1'
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json

app = Flask(__name__)
CORS(app)

# Dummy AI/ML prediction function for festival demand
# Replace this with your real ML model logic

def predict_festival_demand(festival, warehouses):
    predictions = []
    for w in warehouses:
        # For each item in the warehouse, predict demand
        item_predictions = []
        for item in w.get('items', []):
            item_predictions.append({
                'itemId': item['id'],
                'itemName': item['name'],
                'predictedDemand': random.randint(100, 1000)  # Dummy prediction
            })
        predictions.append({
            'warehouseId': w['id'],
            'warehouseName': w['name'],
            'festival': festival,
            'items': item_predictions
        })
    return prediction

@app.route('/predict-festival-demand', methods=['POST'])
def predict():
    data = request.json
    festival = data.get('festival')
    warehouses = data.get('warehouses', [])
    predictions = predict_festival_demand(festival, warehouses)
    return jsonify(predictions)

@app.route('/restock-request', methods=['POST', 'OPTIONS'])
def restock_request():
    if request.method == 'OPTIONS':
        # CORS preflight
        return '', 204
    data = request.json
    restock_file = os.path.join(os.path.dirname(__file__), '../server/data/restockRequests.json')
    # Read existing requests
    if os.path.exists(restock_file):
        with open(restock_file, 'r') as f:
            try:
                requests = json.load(f)
            except Exception:
                requests = []
    else:
        requests = []
    # Append new request
    requests.append(data)
    # Write back to file
    with open(restock_file, 'w') as f:
        json.dump(requests, f, indent=2)
    return jsonify({'message': 'Restock request received'}), 200

@app.route('/restock-requests', methods=['GET'])
def get_restock_requests():
    restock_file = os.path.join(os.path.dirname(__file__), '../server/data/restockRequests.json')
    if os.path.exists(restock_file):
        with open(restock_file, 'r') as f:
            try:
                requests = json.load(f)
            except Exception:
                requests = []
    else:
        requests = []
    return jsonify(requests)

@app.route('/restock-request/<int:idx>', methods=['PATCH'])
def update_restock_request(idx):
    restock_file = os.path.join(os.path.dirname(__file__), '../server/data/restockRequests.json')
    if not os.path.exists(restock_file):
        return jsonify({'error': 'No restock requests found'}), 404

    with open(restock_file, 'r') as f:
        try:
            requests = json.load(f)
        except Exception:
            return jsonify({'error': 'Invalid data'}), 500

    if idx < 0 or idx >= len(requests):
        return jsonify({'error': 'Invalid index'}), 400

    data = request.json
    # Update only the status field
    requests[idx]['status'] = data.get('status', requests[idx].get('status'))

    with open(restock_file, 'w') as f:
        json.dump(requests, f, indent=2)

    return jsonify(requests[idx]), 200

if __name__ == '__main__':
    app.run(port=5000) 
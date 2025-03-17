from flask import Flask, request, jsonify
from flask_cors import CORS  # Enable CORS for cross-origin requests
import json
import os

# Path to the GitHub repository folder
REPO_PATH = r"C:\Users\FO\Documents\GitHub\upsc-test-series"
TESTS_FILE = os.path.join(REPO_PATH, "tests.json")

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Ensure tests.json exists and is valid JSON
if not os.path.exists(TESTS_FILE):
    with open(TESTS_FILE, "w") as f:
        json.dump([], f)  # Create empty JSON array

# Function to load JSON safely
def load_tests():
    try:
        with open(TESTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []  # Reset if JSON is corrupted

# Function to save tests
def save_tests(tests):
    with open(TESTS_FILE, "w", encoding="utf-8") as f:
        json.dump(tests, f, indent=2)

@app.route('/')
def home():
    return "Local Server Running! Use /getTests, /addTest, /submitMarks."

### 📌 **1. Fetch Tests (`GET /getTests`)**
@app.route('/getTests', methods=['GET'])
def get_tests():
    tests = load_tests()
    return jsonify(tests)

### 📌 **2. Add New Test (`POST /addTest`)**
@app.route('/addTest', methods=['POST'])
def add_test():
    try:
        data = request.json
        print("Received data:", data)  # Debugging log

        if not data:
            return jsonify({"error": "Invalid data"}), 400

        required_fields = ["name", "subject", "date", "deadline"]
        if not all(k in data for k in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        tests = load_tests()  # Load existing tests
        tests.append(data)  # Add new test
        save_tests(tests)

        print("Test added successfully:", data)  # Debugging log
        return jsonify({"success": True, "test": data})

    except Exception as e:
        print("Error:", str(e))  # Debugging log
        return jsonify({"error": str(e)}), 500

### 📌 **3. Submit Marks (`POST /submitMarks`)**
@app.route('/submitMarks', methods=['POST'])
def submit_marks():
    try:
        data = request.json
        test_id = data.get("testId")
        user_id = data.get("userId")
        marks = data.get("marks")
        reflections = data.get("reflections")

        tests = load_tests()
        for test in tests:
            if test.get("_id") == test_id:  # Ensure test ID matches
                test["marksSubmitted"] = True
                test["submittedBy"] = user_id
                test["marks"] = marks
                test["reflections"] = reflections
                break

        save_tests(tests)

        return jsonify({"success": True, "message": "Marks submitted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

### 📌 **4. Fetch Leaderboard (`GET /getLeaderboard`)**
@app.route('/getLeaderboard', methods=['GET'])
def get_leaderboard():
    tests = load_tests()
    leaderboard = {}

    for test in tests:
        if "submittedBy" in test and "marks" in test:
            user_id = test["submittedBy"]
            marks = int(test["marks"])
            if user_id in leaderboard:
                leaderboard[user_id] += marks
            else:
                leaderboard[user_id] = marks

    sorted_leaderboard = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
    leaderboard_data = [{"userId": uid, "totalMarks": marks} for uid, marks in sorted_leaderboard]

    return jsonify(leaderboard_data)

if __name__ == '__main__':
    try:
        print("Starting Flask server on http://127.0.0.1:5050")
        app.run(host='127.0.0.1', port=5050, debug=True)
    except Exception as e:
        print("Server failed to start:", str(e))

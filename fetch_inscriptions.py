import requests
import json
import time

# Load your metadata file
with open("metadata.json", "r") as file:
    metadata = json.load(file)

# Ordinals API URL
ORDINALS_API_URL = "https://ordinals.com/inscription/"

# Function to fetch inscription number
def fetch_inscription_number(inscription_id):
    url = f"{ORDINALS_API_URL}{inscription_id}"
    headers = {"Accept": "application/json"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get("number", None)
        else:
            return None
    except Exception as e:
        return None

# Iterate through metadata and fetch inscription numbers
for entry in metadata:
    inscription_id = entry["id"]
    inscription_number = fetch_inscription_number(inscription_id)
    entry["meta"]["◉"] = inscription_number  # Insert "◉" field
    time.sleep(1)  # Prevent rate limiting

# Save the updated metadata file
with open("updated_metadata.json", "w") as updated_file:
    json.dump(metadata, updated_file, indent=2)

print("Updated metadata saved as updated_metadata.json")

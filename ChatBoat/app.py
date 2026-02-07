import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.genai as genai
from dotenv import load_dotenv  # Import the load_dotenv function

# Load environment variables from .env file
load_dotenv()
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow all origins (for development)

# Configuration
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load API Key from environment variable
GENAI_API_KEY = os.getenv('GOOGLE_API_KEY')  # Ensure your API key is set in the environment
print(GENAI_API_KEY)
if not GENAI_API_KEY:
    logging.error("No API_KEY found. Please set the GOOGLE_API_KEY environment variable.")
    raise ValueError("No API_KEY found. Please set the GOOGLE_API_KEY environment variable.")

# Initialize Gemini client lazily
client = None

def get_genai_client():
    global client
    if client is None:
        client = genai.Client(api_key=GENAI_API_KEY)
    return client

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}

MIME_TYPES = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
}

def allowed_file(filename):
    """Check if the uploaded file is in an allowed format."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_mime_type(filename):
    """Return the MIME type based on the file extension."""
    ext = filename.rsplit('.', 1)[1].lower()
    return MIME_TYPES.get(ext, 'application/octet-stream')

def generate_prompt(user_query, language):
    """Generate a structured prompt for plant health analysis with numbered, concise responses."""

    if language == 'hi':  # Hindi
        base_prompt = (
            "पौधे की छवि का विश्लेषण करें और निम्न प्रारूप में उत्तर दें बिना किसी अतिरिक्त जानकारी और विशेष वर्णों के:\n"
            "1. वर्तमान स्वास्थ्य स्थिति: पौधे के स्वास्थ्य का विस्तृत विवरण\n"
            "2. संभावित बीमारियां या समस्याएं: किसी भी संभावित स्वास्थ्य जोखिम का वर्णन\n"
            "3. तत्काल उपचार सिफारिशें: तुरंत की जाने वाली कार्रवाई\n"
            "4. दीर्घकालिक देखभाल सुझाव: भविष्य में पौधे की देखभाल के लिए मार्गदर्शन\n"
            "\n"
            f"किसान का सवाल: {user_query}\n"
            "उत्तर स्पष्ट, संक्षिप्त और सटीक होने चाहिए बिना किसी अतिरिक्त विशेष वर्णों के।"
        )

        if "कीट" in user_query or "कीटों" in user_query:
            base_prompt += "\n कीट नियंत्रण पर विशेष ध्यान दें।"
        elif "उर्वरक" in user_query or "खाद" in user_query:
            base_prompt += "\n पोषण और उर्वरक की आवश्यकताओं पर ध्यान दें।"

        return base_prompt

    else:  # Default to English
        base_prompt = (
            "Analyze the plant image and respond in the following format without any extra information and special character:\n"
            "1. Current health status: Detailed description of the plant's health\n"
            "2. Potential diseases or issues: Description of any potential health risks\n"
            "3. Immediate treatment recommendations: Actions to take immediately\n"
            "4. Long-term care suggestions: Guidance for future plant care\n"
            "\n"
            f"Farmer's specific query: {user_query}\n"
            "Responses must be clear, concise, and precise,without any extra special characters."
        )

        if "pest" in user_query or "insect" in user_query:
            base_prompt += "\n Focus specifically on pest control methods."
        elif "fertilizer" in user_query or "manure" in user_query:
            base_prompt += "\n Focus specifically on nutritional needs and fertilization."

        return base_prompt


@app.route("/", methods=["GET"])
def home():
    return jsonify({"analysis": "Hello Team"}), 200

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and return analysis results."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Only images are supported."}), 400

    # Securely save the file
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    logging.info(f"File saved at: {file_path}")

    try:
        # Prepare the prompt based on user query and selected language
        user_query = request.form.get('query', 'general')  # Get the user's query
        language = request.form.get('language', 'en')  # Get the user's selected language
        prompt = generate_prompt(user_query, language)

        # Upload the file to the Gemini AI API
        mime_type = get_mime_type(filename)
        genai_client = get_genai_client()
        sample_file = genai_client.files.upload(file=open(file_path, 'rb'), config={"mime_type": mime_type})

        # Call the API with the prompt and the uploaded file
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, sample_file],
        )

        if response and hasattr(response, 'text'):
            logging.info(f"Analysis Result: {response.text}")
            return jsonify({"analysis": response.text}), 200
        else:
            logging.error("Failed to generate analysis from the AI model.")
            return jsonify({"error": "AI analysis failed. Try again later."}), 429

    except Exception as e:
        logging.error(f"Error during processing: {e}")
        return jsonify({"error": "Failed to analyze the image. Please try again."}), 500

    finally:
        # Clean up the uploaded file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logging.info(f"Temporary file {file_path} removed successfully.")
            else:
                logging.warning(f"File {file_path} not found for cleanup.")
        except Exception as cleanup_error:
            logging.error(f"Error during file cleanup: {cleanup_error}")

def get_chat_prompt(user_message, language):
    """Generate prompt for AI chat - farming assistant."""
    if language == 'hi':
        system_prompt = (
            "आप एक विशेषज्ञ कृषि सहायक हैं। किसानों के सभी प्रश्नों का स्पष्ट, संक्षिप्त और सही उत्तर दें। "
            "कृषि, फसलें, कीट नियंत्रण, उर्वरक, सिंचाई, मौसम और संबंधित विषयों पर मदद करें। "
            "उत्तर हमेशा हिंदी में दें। अगर प्रश्न कृषि से संबंधित नहीं है तो विनम्रता से बताएं कि आप कृषि विशेषज्ञ हैं।"
        )
    else:
        system_prompt = (
            "You are an expert farming assistant. Answer all farmer questions clearly, concisely and accurately. "
            "Help with agriculture, crops, pest control, fertilizers, irrigation, weather and related topics. "
            "Always respond in English. If the question is not related to farming, politely say you are a farming specialist."
        )
    return f"{system_prompt}\n\nUser question: {user_message}"


@app.route('/chat', methods=['POST'])
def chat():
    """AI-powered chatbot for all farming queries using Gemini."""
    try:
        data = request.json or {}
        user_message = (data.get('message') or '').strip()
        language = data.get('language', 'en')

        if not user_message:
            resp = "Please type your question." if language == 'en' else "कृपया अपना प्रश्न टाइप करें।"
            return jsonify({"response": resp}), 400

        genai_client = get_genai_client()
        prompt = get_chat_prompt(user_message, language)

        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        if response and hasattr(response, 'text') and response.text:
            return jsonify({"response": response.text.strip()}), 200
        else:
            fallback = (
                "I couldn't generate a response. Please try rephrasing your question."
                if language == 'en' else
                "मैं उत्तर नहीं बना पाया। कृपया प्रश्न को दोबारा लिखें।"
            )
            return jsonify({"response": fallback}), 200

    except Exception as e:
        logging.error(f"Chat error: {e}")
        try:
            lang = (request.json or {}).get('language', 'en')
        except Exception:
            lang = 'en'
        fallback = (
            "Sorry, I'm having trouble. Please try again later."
            if lang == 'en' else
            "क्षमा करें, समस्या आ रही है। कृपया बाद में पुनः प्रयास करें।"
        )
        return jsonify({"response": fallback}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
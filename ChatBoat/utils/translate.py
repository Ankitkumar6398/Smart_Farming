from googletrans import Translator

translator = Translator()

def translate_text(text, target_language):
    try:
        if target_language == "en":  # No need to translate if it's already English
            return text

        translation = translator.translate(text, dest=target_language)
        return translation.text
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text  # Return original text if translation fails

from deep_translator import GoogleTranslator

text = "That was an incredible finish by Cristiano Ronaldo!"
french_text = GoogleTranslator(source='auto', target='fr').translate(text)
spanish_text = GoogleTranslator(source='auto', target='spanish').translate(text)
print(spanish_text)

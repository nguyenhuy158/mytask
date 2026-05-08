import json
import os
from typing import Any

from fastapi import Request

I18N_DIR = os.path.join(os.path.dirname(__file__), "i18n")
DEFAULT_LANG = "en"


class Translator:
    def __init__(self):
        self._translations = {}
        self._load_translations()

    def _load_translations(self):
        for lang in ["en", "vi"]:
            path = os.path.join(I18N_DIR, f"{lang}.json")
            if os.path.exists(path):
                with open(path, encoding="utf-8") as f:
                    self._translations[lang] = json.load(f)

    def translate(self, key: str, lang: str = DEFAULT_LANG, **kwargs: Any) -> str:
        lang_translations = self._translations.get(
            lang, self._translations.get(DEFAULT_LANG, {})
        )
        message = lang_translations.get(key, key)
        try:
            return message.format(**kwargs)
        except (KeyError, ValueError):
            return message


translator = Translator()


def get_language(request: Request) -> str:
    accept_lang = request.headers.get("Accept-Language", DEFAULT_LANG)
    if "vi" in accept_lang.lower():
        return "vi"
    return DEFAULT_LANG

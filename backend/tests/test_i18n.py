from app.core.i18n import translator


def test_translator_basic():
    # Test default language (en)
    msg = translator.translate("SUCCESS")
    assert msg is not None


def test_translator_with_params():
    # Test with placeholder replacement
    # Assuming BACKUP_COMPLETED has a {result} placeholder
    msg = translator.translate("BACKUP_COMPLETED", result="test.db")
    assert "test.db" in msg


def test_translator_unsupported_lang():
    # Should fallback to default
    msg = translator.translate("SUCCESS", lang="unknown")
    assert msg is not None

from app.agent.intent import _extract_json


def test_plain_json():
    assert _extract_json('{"origin": "Москва", "destination": null}') == {
        "origin": "Москва",
        "destination": None,
    }


def test_markdown_fence():
    text = '```json\n{"origin": "Москва"}\n```'
    assert _extract_json(text) == {"origin": "Москва"}


def test_json_wrapped_in_text():
    text = 'Вот результат: {"origin": "Казань"} и всё.'
    assert _extract_json(text) == {"origin": "Казань"}

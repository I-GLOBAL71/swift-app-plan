INSERT INTO settings (key, value, description)
VALUES
    ('gemini_model', 'gemini-1.5-flash-8b', 'The default Gemini model to use')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

INSERT INTO settings (key, value, description)
VALUES
    ('gemini_models', '["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-1.5-flash-8b"]', 'Available Gemini models')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;
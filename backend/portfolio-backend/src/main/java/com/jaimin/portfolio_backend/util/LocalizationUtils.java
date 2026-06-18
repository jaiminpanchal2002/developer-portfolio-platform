package com.jaimin.portfolio_backend.util;

import java.util.HashMap;
import java.util.Map;

public class LocalizationUtils {

    /**
     * Parse multi-locale localized fields.
     * Raw string can be localized text like "title.en:My Title|title.hi:मेरा शीर्षक|title.de:Mein Titel"
     * or a standard fallback string if localization prefix is missing.
     */
    public static String getLocalizedValue(String rawString, String locale) {
        if (rawString == null || rawString.trim().isEmpty()) {
            return "";
        }
        
        String targetLocale = (locale == null || locale.trim().isEmpty()) ? "en" : locale.toLowerCase().trim();
        Map<String, String> localeMap = parseField(rawString);
        
        if (localeMap.containsKey(targetLocale)) {
            return localeMap.get(targetLocale);
        }
        // Graceful fallback to English
        if (localeMap.containsKey("en")) {
            return localeMap.get("en");
        }
        // Fallback to original value if parsing wasn't matching key format
        return rawString.contains(":") ? "" : rawString;
    }

    private static Map<String, String> parseField(String raw) {
        Map<String, String> map = new HashMap<>();
        if (raw == null) return map;
        
        String[] parts = raw.split("\\|");
        boolean hasLocaleMatches = false;
        for (String part : parts) {
            int colonIdx = part.indexOf(":");
            if (colonIdx > 0) {
                String key = part.substring(0, colonIdx).trim();
                String val = part.substring(colonIdx + 1).trim();
                if (key.length() == 2) { // e.g. en, hi, gu, de, es, fr
                    map.put(key.toLowerCase(), val);
                    hasLocaleMatches = true;
                }
            }
        }
        
        if (!hasLocaleMatches) {
            map.put("en", raw);
        }
        return map;
    }
}

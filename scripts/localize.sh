#!/bin/bash

test_lang="fr"
translate_langs=("fr")
#translate_langs=("fr" "de" "ja" "zh-CN" "it" "ms" "ar" "pt")

# Extract all the tags to localize
ng extract-i18n --output-path src/locale

# Translate a file
for lang in "${translate_langs[@]}"; do
  echo "Translating target: $lang"
  xlf2xlf --in src/locale/messages.xlf --out src/locale/messages."$lang".xlf --from en --to "$lang"
done

ng serve --configuration=development-"$test_lang"
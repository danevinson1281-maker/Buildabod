#!/bin/bash

# New Live Price IDs
KICKSTART="price_1U37oFQVIGuBoBPoMbkMbBPM"
PRO="price_1U37ofQVIGuBoBPoEJYglWcE"
ELITE="price_1U37ovQVIGuBoBPoKxx3Khud"

# OLD Price IDs (find and replace)
OLD_KICKSTART="price_1U37oFQVIGuBoBPoMbkMbBPM"
OLD_PRO="price_1U37ofQVIGuBoBPoEJYglWcE"
OLD_ELITE="price_1U37ovQVIGuBoBPoKxx3Khud"

# Find and replace in all files
find app -type f $$ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" $$ -exec sed -i '' \
  -e "s/$OLD_KICKSTART/$KICKSTART/g" \
  -e "s/$OLD_PRO/$PRO/g" \
  -e "s/$OLD_ELITE/$ELITE/g" \
  {} +

echo "✅ All price IDs updated successfully!"

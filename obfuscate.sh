echo [-- Code Obfuscation --]

node ../tools/javascript-obfuscator/bin/javascript-obfuscator target/client-1.0/js/game.min.js --output temp0.js --config '../obfuscator-settings.js'
node ../tools/javascript-obfuscator/bin/javascript-obfuscator target/client-1.0/js/editor.min.js --output temp1.js --config '../obfuscator-settings.js'

echo [-- Moving Files --]

rm target/client-1.0/js/game.min.js
rm target/client-1.0/js/editor.min.js

mv temp0.js ../royale-client/target/client-1.0/js/game.min.js
mv temp1.js ../royale-client/target/client-1.0/js/editor.min.js




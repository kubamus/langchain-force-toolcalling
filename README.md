ten projekt ma na celu zmusić modele AI nie obsługujące tool callingu do robienia tego
działa jak sigma chciała a kod jest tragicznie napisany, kiedyś może go poprawie
ale coś tam działa

żeby uruchomić potrzebujesz [BUN](https://bun.com/) (używam buna bo nie chciało mi sie konfigurować typescript w node, jestem leniwy)
utworzyć plik `.env` i dodać zmienną `AI_URL=http://localhost:11434` lub inne url jak masz inny
do lokalnego uruchomienia polecam ollama, git jest

po zrobieniu tych kroków, upewnij się komendą `ollama list` że masz model, który jest w pliku `config.ts`
jeśli nie to pobierz go komendą `ollama pull <model_name>`
następnie uruchom `bun run dev` i powinno śmigać

ps kod pisany w celach testowych, chciałem sprawdzić czy da się zmusić modele do tool callingu
interesowało mnie to tylko dla tego że może sie przydać w EcoFlex💪
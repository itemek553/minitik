MiniTikTok - darmowy prototyp (FastAPI + React)

Jak uruchomić lokalnie (krok po kroku):

1) Backend (Python)
   - Przejdź do folderu backend
     cd backend
   - Stwórz virtualenv (opcjonalnie)
     python -m venv venv
     source venv/bin/activate   (Linux/Mac)  lub  venv\Scripts\activate  (Windows)
   - Zainstaluj zależności
     pip install -r requirements.txt
   - Uruchom serwer
     uvicorn main:app --reload --host 0.0.0.0 --port 8000

2) Frontend (Node.js)
   - Przejdź do folderu frontend
     cd frontend
   - Zainstaluj zależności
     npm install
   - Uruchom dev server
     npm run dev
   - Otwórz w przeglądarce: http://localhost:5173

Uwaga/prototyp:
- To bardzo prosty prototyp. Autoryzacja to tylko podawanie nazwy użytkownika (brak haseł) —
  wystarczy do testów lokalnych, ale NIE jest bezpieczne w produkcji.
- Pliki wideo są zapisywane lokalnie w backend/media/videos.
- Możesz użyć PWA lub otoczyć frontend w Capacitor, aby mieć apkę na Androida.

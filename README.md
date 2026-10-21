# Savdo do'koni

Oziq-ovqat do'koni uchun sotuv va ombor dasturi. GM Zapchast dasturidan nusxa olib moslashtirilgan:

- narxlar to'g'ridan-to'g'ri so'mda (dollar kursi yo'q), umumiy ustama standart 20%, narx 100 so'mgacha yaxlitlanadi
- har mahsulotda o'lchov birligi: dona, kg yoki litr (kasr miqdorda sotish mumkin, masalan 0,5 kg)
- mahsulot bazasi bo'sh boshlanadi
- alohida ilova identifikatori (`uz.savdodokoni.app`) va alohida Android imzo kaliti, shuning uchun GM Zapchast bilan bir telefonda yonma-yon o'rnatiladi

- `src/app.html` — dastur manbasi (bitta HTML fayl), `src/seed.json` — boshlang'ich mahsulotlar bazasi
- `tools/build.py` — yig'ish (esbuild bilan siqib, bitta HTML qiladi)
- `desktop/` — Windows EXE (Electron)
- `mobile/` — Android APK (Capacitor)
- `.github/workflows/build.yml` — har `main` ga push qilinganda HTML, APK va EXE yig'iladi va Releases ga joylanadi

Android imzo kaliti `mobile/signing/` da (repozitoriy maxfiy bo'lgani uchun). Uni yo'qotmang: APK yangilanishlari shu kalit bilan imzolanishi shart. Repozitoriyni hech qachon ochiq (public) qilmang. Litsenziya generatori va maxfiy kalit bu repozitoriyda **yo'q** va bo'lmasligi kerak.

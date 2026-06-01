Start-Process powershell -ArgumentList "-NoExit", "npx serve ."
Start-Sleep -Seconds 3
ngrok http 3000
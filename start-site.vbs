Option Explicit
Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' 1) MySQL (XAMPP) - if already running, this is harmless
WshShell.Run """C:\xampp\mysql\bin\mysqld.exe"" --defaults-file=""C:\xampp\mysql\bin\my.ini""", 0, False

WScript.Sleep 4000

' 2) API server (port 5000)
WshShell.Run "cmd /c cd /d ""C:\Users\mouin\E-Commerce-FullStack\backend"" && node server.js", 0, False

WScript.Sleep 2000

' 3) Website server (port 80 - full site + API same origin)
WshShell.Run "cmd /c cd /d ""C:\Users\mouin\E-Commerce-FullStack\backend"" && set PORT=80 && node server.js", 0, False

WScript.Sleep 2000

' 4) Cloudflare Tunnel (parapharmacie.tn + www)
WshShell.Run """C:\Program Files (x86)\cloudflared\cloudflared.exe"" tunnel run parapharmacie", 0, False

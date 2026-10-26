Option Explicit
Dim shell, fso, folder, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File " & Chr(34) & folder & "\launch.ps1" & Chr(34)
Dim result
result = shell.Run(command, 0, True)
If result <> 0 Then MsgBox "QuotaCorner could not start. Exit ChatGPT normally and try again. If this persists, run launch.ps1 to see the error.", 48, "QuotaCorner"

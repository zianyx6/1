Option Explicit
Dim shell, fso, folder, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File " & Chr(34) & folder & "\launch.ps1" & Chr(34)
Dim result
result = shell.Run(command, 0, True)
If result <> 0 Then
  Dim logPath, errorText, logFile
  errorText = "QuotaCorner could not start."
  logPath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\QuotaCorner\launcher-error.log"
  If fso.FileExists(logPath) Then
    Set logFile = fso.OpenTextFile(logPath, 1, False, -1)
    errorText = errorText & vbCrLf & vbCrLf & logFile.ReadAll
    logFile.Close
  End If
  MsgBox errorText, 48, "QuotaCorner"
End If

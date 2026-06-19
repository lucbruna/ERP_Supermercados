; Inno Setup Script - CRM Supermercado Windows Installer
; Generate with: iscc installer.iss

#define MyAppName "CRM Supermercado"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "CRM Supermercado Technology"
#define MyAppURL "https://crm-supermercado.com"
#define MyAppExeName "crm-supermercado.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\CRM Supermercado
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\..\dist
OutputBaseFilename=CRM_Supermercado_Setup_v{#MyAppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible
ChangesEnvironment=yes
; SetupIconFile=..\..\assets\icon.ico   ; Coloque seu icon.ico em assets/ e descomente

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na &Area de Trabalho"; GroupDescription: "Icones adicionais:"
Name: "dockerinstall"; Description: "Instalar Docker Desktop (se nao estiver instalado)"; GroupDescription: "Pre-requisitos:"
Name: "startup"; Description: "Iniciar CRM Supermercado automaticamente ao ligar o computador"; GroupDescription: "Inicializacao:"

[Files]
Source: "start-crm.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "setup-prerequisites.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "configure-first-run.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "stop-crm.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "status-crm.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "backup-crm.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "install-all-npm.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\.env.example"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\docker-compose.yml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\docker-compose.dev.yml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\Makefile"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\start-all.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\stop-all.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\setup-local.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\prisma-generate-all.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\prisma-migrate-all.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\install-all.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\docker\*"; DestDir: "{app}\docker"; Flags: recursesubdirs createallsubdirs
Source: "..\..\database\*"; DestDir: "{app}\database"; Flags: recursesubdirs createallsubdirs
Source: "..\..\deploy\*"; DestDir: "{app}\deploy"; Flags: recursesubdirs createallsubdirs
Source: "..\..\kubernetes\*"; DestDir: "{app}\kubernetes"; Flags: recursesubdirs createallsubdirs
Source: "..\..\docs\*"; DestDir: "{app}\docs"; Flags: recursesubdirs createallsubdirs

[Dirs]
Name: "{app}\data\postgres"; Permissions: users-full
Name: "{app}\data\redis"; Permissions: users-full
Name: "{app}\data\minio"; Permissions: users-full
Name: "{app}\logs"; Permissions: users-full
Name: "{app}\backups"; Permissions: users-full

[Icons]
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\start-crm.bat"; Tasks: desktopicon; WorkingDir: "{app}"
Name: "{group}\{#MyAppName}"; Filename: "{app}\start-crm.bat"; WorkingDir: "{app}"
Name: "{group}\{#MyAppName} Dashboard"; Filename: "http://localhost:3081"
Name: "{group}\{#MyAppName} PDV"; Filename: "http://localhost:3080"
Name: "{commonstartup}\{#MyAppName}"; Filename: "{app}\start-crm.bat"; Tasks: startup; WorkingDir: "{app}"

[Run]
Filename: "{app}\setup-prerequisites.bat"; StatusMsg: "Verificando pre-requisitos..."; Flags: runhidden
Filename: "{app}\configure-first-run.bat"; StatusMsg: "Configuracao inicial..."; Flags: runhidden
Filename: "{app}\start-crm.bat"; Description: "Iniciar CRM Supermercado agora"; Flags: postinstall nowait skipifsilent shellexec
Filename: "http://localhost:3081"; Description: "Abrir Dashboard"; Flags: postinstall nowait skipifsilent shellexec unchecked

[Code]
function CheckDockerInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c docker --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if not IsWin64 then
  begin
    MsgBox('Este instalador requer Windows 64 bits.', mbError, MB_OK);
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    SaveStringToFile(ExpandConstant('{app}\data\.install_complete'), '1', False);
  end;
end;

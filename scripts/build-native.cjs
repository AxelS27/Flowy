const { execFileSync } = require('node:child_process');
const { existsSync, mkdirSync } = require('node:fs');
const path = require('node:path');

if (process.platform !== 'win32') {
  console.log('Native Windows helper is built on Windows only.');
  process.exit(0);
}
const windows = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
const framework = path.join(windows, 'Microsoft.NET', 'Framework64', 'v4.0.30319');
const compiler = path.join(framework, 'csc.exe');
if (!existsSync(compiler)) throw new Error('Windows .NET Framework 4.x compiler is required to build the native helper.');
const output = path.resolve('dist-electron/native');
mkdirSync(output, { recursive: true });
execFileSync(compiler, [
  '/nologo', '/target:exe', '/platform:anycpu', '/optimize+', '/utf8output',
  '/out:' + path.join(output, 'Flowy.Windows.exe'),
  '/reference:' + path.join(framework, 'System.Web.Extensions.dll'),
  '/reference:' + path.join(framework, 'Microsoft.VisualBasic.dll'),
  '/reference:' + path.join(framework, 'WPF', 'UIAutomationClient.dll'),
  '/reference:' + path.join(framework, 'WPF', 'UIAutomationTypes.dll'),
  '/reference:' + path.join(framework, 'WPF', 'WindowsBase.dll'),
  path.resolve('native/Flowy.Windows/Program.cs'),
], { stdio: 'inherit', windowsHide: true });
console.log('Built dist-electron/native/Flowy.Windows.exe');

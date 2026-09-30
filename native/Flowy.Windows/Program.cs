using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Automation;
using Microsoft.Win32;

// One structured request per process. No shell parsing or user-supplied C#.
internal static class Program
{
    [STAThread]
    private static int Main()
    {
        Console.InputEncoding = new UTF8Encoding(false);
        Console.OutputEncoding = new UTF8Encoding(false);
        var json = new JavaScriptSerializer { MaxJsonLength = 131072 };
        try
        {
            var request = json.Deserialize<Dictionary<string, object>>(Console.ReadLine() ?? "");
            object data = Dispatch(request);
            Console.WriteLine(json.Serialize(new { ok = true, data = data }));
            return 0;
        }
        catch (Exception error)
        {
            Console.WriteLine(json.Serialize(new { ok = false, code = "WINDOWS_ACTION_FAILED", error = error.Message }));
            return 1;
        }
    }

    private static string Text(Dictionary<string, object> request, string key)
    {
        object value;
        return request.TryGetValue(key, out value) && value != null ? Convert.ToString(value, CultureInfo.InvariantCulture) : "";
    }

    private static object Dispatch(Dictionary<string, object> request)
    {
        string action = Text(request, "action");
        switch (action)
        {
            case "capabilities":
                return new { protocolVersion = 1, build = FocusAssist.WindowsBuild(), audio = "CoreAudio", focus = "UIAutomation" };
            case "audio.get": return CoreAudio.Read();
            case "audio.volume":
                float level;
                if (!Single.TryParse(Text(request, "param"), NumberStyles.Float, CultureInfo.InvariantCulture, out level) || Single.IsNaN(level) || level < 0 || level > 100)
                    throw new ArgumentException("Volume must be between 0 and 100.");
                CoreAudio.SetVolume(level / 100f);
                return new { volume = level };
            case "audio.mute":
                string mute = Text(request, "param");
                if (mute != "mute_mic" && mute != "unmute_mic" && mute != "mute_audio" && mute != "unmute_audio")
                    throw new ArgumentException("Choose a microphone or speaker mute action.");
                CoreAudio.SetMute(mute.EndsWith("_mic"), mute.StartsWith("mute_"));
                return new { mute = mute };
            case "focus.mode": return FocusAssist.Set(Text(request, "param"));
            case "path.move":
                string source = Text(request, "param");
                string destination = Text(request, "secondaryParam");
                if (!System.IO.Path.IsPathRooted(source) || !System.IO.Path.IsPathRooted(destination))
                    throw new ArgumentException("Move requires full local paths.");
                if (System.IO.File.Exists(destination) || System.IO.Directory.Exists(destination))
                    throw new System.IO.IOException("Destination already exists. Flowy will not overwrite it.");
                if (System.IO.Directory.Exists(source))
                    Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(source, destination, false);
                else
                    Microsoft.VisualBasic.FileIO.FileSystem.MoveFile(source, destination, false);
                return new { moved = destination };
            case "app.open":
                string executable = Text(request, "param");
                if (!executable.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) || executable.IndexOf('\0') >= 0)
                    throw new ArgumentException("Choose a Windows .exe application.");
                using (var process = Process.Start(new ProcessStartInfo(executable) { UseShellExecute = true }))
                    return new { launched = executable };
            case "app.close":
                string name = Text(request, "param");
                var processes = Process.GetProcessesByName(name);
                try
                {
                    // Electron/Chromium apps have helper processes without a window.
                    // Only request closure from processes that own visible app windows.
                    var owners = processes.Where(process => !process.HasExited && process.MainWindowHandle != IntPtr.Zero).ToArray();
                    foreach (var process in owners)
                    {
                        if (!process.CloseMainWindow()) throw new InvalidOperationException("Application refused to close: " + name);
                    }
                    var deadline = Stopwatch.StartNew();
                    foreach (var process in owners)
                    {
                        while (!process.HasExited)
                        {
                            process.Refresh();
                            if (process.MainWindowHandle == IntPtr.Zero) break;
                            if (deadline.ElapsedMilliseconds >= 10000)
                                throw new InvalidOperationException("Application window is still open. Check its save dialog, then retry: " + name);
                            Thread.Sleep(100);
                        }
                    }
                    // Apps configured to minimize to tray may keep background processes.
                    return new { closedWindows = owners.Length, application = name };
                }
                finally { foreach (var process in processes) process.Dispose(); }
            case "system.sleep":
                if (!SetSuspendState(false, false, false)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
                return new { sleeping = true };
            case "system.displayOff":
                UIntPtr result;
                if (SendMessageTimeout(new IntPtr(0xffff), 0x0112, new UIntPtr(0xf170), new IntPtr(2), 2, 2000, out result) == IntPtr.Zero)
                    throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
                return new { displayOff = true };
            default: throw new ArgumentException("Unknown native action: " + action);
        }
    }

    [DllImport("powrprof.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.U1)]
    private static extern bool SetSuspendState([MarshalAs(UnmanagedType.U1)] bool hibernate, [MarshalAs(UnmanagedType.U1)] bool force, [MarshalAs(UnmanagedType.U1)] bool disableWake);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SendMessageTimeout(IntPtr hwnd, uint message, UIntPtr wParam, IntPtr lParam, uint flags, uint timeout, out UIntPtr result);
}

internal static class CoreAudio
{
    private static T Endpoint<T>(bool microphone, Func<IAudioEndpointVolume, T> operation)
    {
        IMMDeviceEnumerator enumerator = null;
        IMMDevice device = null;
        object endpoint = null;
        try
        {
            enumerator = (IMMDeviceEnumerator)new MMDeviceEnumerator();
            Marshal.ThrowExceptionForHR(enumerator.GetDefaultAudioEndpoint(microphone ? 1 : 0, microphone ? 2 : 1, out device));
            Guid iid = typeof(IAudioEndpointVolume).GUID;
            Marshal.ThrowExceptionForHR(device.Activate(ref iid, 23, IntPtr.Zero, out endpoint));
            return operation((IAudioEndpointVolume)endpoint);
        }
        catch (COMException error)
        {
            throw new InvalidOperationException("Cannot access the default " + (microphone ? "microphone" : "speaker") + ". Connect an audio device and check Windows sound settings.", error);
        }
        finally
        {
            if (endpoint != null) Marshal.ReleaseComObject(endpoint);
            if (device != null) Marshal.ReleaseComObject(device);
            if (enumerator != null) Marshal.ReleaseComObject(enumerator);
        }
    }

    public static object Read()
    {
        var speaker = Endpoint(false, endpoint => {
            float volume; bool mute;
            Marshal.ThrowExceptionForHR(endpoint.GetMasterVolumeLevelScalar(out volume));
            Marshal.ThrowExceptionForHR(endpoint.GetMute(out mute));
            return new { volume = Math.Round(volume * 100, 2), muted = mute };
        });
        bool? microphoneMute = null;
        try { microphoneMute = Endpoint(true, endpoint => { bool mute; Marshal.ThrowExceptionForHR(endpoint.GetMute(out mute)); return mute; }); }
        catch (InvalidOperationException) { }
        return new { speaker = speaker, microphoneMuted = microphoneMute };
    }

    public static void SetVolume(float level)
    {
        Endpoint(false, endpoint => {
            Guid context = Guid.Empty;
            Marshal.ThrowExceptionForHR(endpoint.SetMasterVolumeLevelScalar(level, ref context));
            float actual;
            Marshal.ThrowExceptionForHR(endpoint.GetMasterVolumeLevelScalar(out actual));
            if (Math.Abs(actual - level) > 0.015) throw new InvalidOperationException("Windows did not apply the requested volume.");
            return true;
        });
    }

    public static void SetMute(bool microphone, bool mute)
    {
        Endpoint(microphone, endpoint => {
            Guid context = Guid.Empty;
            Marshal.ThrowExceptionForHR(endpoint.SetMute(mute, ref context));
            bool actual;
            Marshal.ThrowExceptionForHR(endpoint.GetMute(out actual));
            if (actual != mute) throw new InvalidOperationException("Windows did not apply the requested mute state.");
            return true;
        });
    }

    [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    private class MMDeviceEnumerator { }
    [ComImport, Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDeviceEnumerator
    {
        [PreserveSig] int EnumAudioEndpoints(int flow, uint mask, out IntPtr devices);
        [PreserveSig] int GetDefaultAudioEndpoint(int flow, int role, out IMMDevice device);
        [PreserveSig] int GetDevice([MarshalAs(UnmanagedType.LPWStr)] string id, out IMMDevice device);
        [PreserveSig] int RegisterEndpointNotificationCallback(IntPtr client);
        [PreserveSig] int UnregisterEndpointNotificationCallback(IntPtr client);
    }
    [ComImport, Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDevice
    {
        [PreserveSig] int Activate(ref Guid iid, uint context, IntPtr parameters, [MarshalAs(UnmanagedType.IUnknown)] out object instance);
        [PreserveSig] int OpenPropertyStore(uint access, out IntPtr properties);
        [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
        [PreserveSig] int GetState(out uint state);
    }
    [ComImport, Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IAudioEndpointVolume
    {
        [PreserveSig] int RegisterControlChangeNotify(IntPtr callback);
        [PreserveSig] int UnregisterControlChangeNotify(IntPtr callback);
        [PreserveSig] int GetChannelCount(out uint count);
        [PreserveSig] int SetMasterVolumeLevel(float level, ref Guid context);
        [PreserveSig] int SetMasterVolumeLevelScalar(float level, ref Guid context);
        [PreserveSig] int GetMasterVolumeLevel(out float level);
        [PreserveSig] int GetMasterVolumeLevelScalar(out float level);
        [PreserveSig] int SetChannelVolumeLevel(uint channel, float level, ref Guid context);
        [PreserveSig] int SetChannelVolumeLevelScalar(uint channel, float level, ref Guid context);
        [PreserveSig] int GetChannelVolumeLevel(uint channel, out float level);
        [PreserveSig] int GetChannelVolumeLevelScalar(uint channel, out float level);
        [PreserveSig] int SetMute([MarshalAs(UnmanagedType.Bool)] bool mute, ref Guid context);
        [PreserveSig] int GetMute([MarshalAs(UnmanagedType.Bool)] out bool mute);
        [PreserveSig] int GetVolumeStepInfo(out uint step, out uint count);
        [PreserveSig] int VolumeStepUp(ref Guid context);
        [PreserveSig] int VolumeStepDown(ref Guid context);
        [PreserveSig] int QueryHardwareSupport(out uint mask);
        [PreserveSig] int GetVolumeRange(out float minimum, out float maximum, out float increment);
    }
}

internal static class FocusAssist
{
    public static int WindowsBuild()
    {
        return Convert.ToInt32(Registry.GetValue(@"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion", "CurrentBuildNumber", "0"), CultureInfo.InvariantCulture);
    }

    public static object Set(string mode)
    {
        if (mode != "Off" && mode != "PriorityOnly" && mode != "DoNotDisturb" && mode != "AlarmsOnly")
            throw new ArgumentException("Choose Off or PriorityOnly.");
        bool windows11 = WindowsBuild() >= 22000;
        if (windows11 && mode == "AlarmsOnly") throw new InvalidOperationException("Windows 11 uses Do not disturb with priority exceptions, not the Windows 10 Alarms only profile.");
        bool enabled = mode != "Off";
        using (var process = Process.Start(new ProcessStartInfo(windows11 ? "ms-settings:notifications" : "ms-settings:quiethours") { UseShellExecute = true })) { }
        var timeout = Stopwatch.StartNew();
        AutomationElement control = null;
        while (timeout.ElapsedMilliseconds < 12000)
        {
            control = FindControl(windows11, mode);
            if (control != null && control.Current.IsEnabled) break;
            Thread.Sleep(200);
        }
        if (control == null || !control.Current.IsEnabled)
            throw new InvalidOperationException("Cannot locate the Windows Do not disturb / Focus assist control on this build or language. Settings was opened; change the mode there manually. No registry hacks were applied.");
        object pattern;
        if (windows11 && control.TryGetCurrentPattern(TogglePattern.Pattern, out pattern))
        {
            var toggle = (TogglePattern)pattern;
            ToggleState desired = enabled ? ToggleState.On : ToggleState.Off;
            if (toggle.Current.ToggleState != desired) toggle.Toggle();
            Verify(() => {
                var current = FindControl(true, mode);
                object currentPattern;
                return current != null && current.TryGetCurrentPattern(TogglePattern.Pattern, out currentPattern) && ((TogglePattern)currentPattern).Current.ToggleState == desired;
            });
        }
        else if (!windows11 && control.TryGetCurrentPattern(SelectionItemPattern.Pattern, out pattern))
        {
            var selection = (SelectionItemPattern)pattern;
            if (!selection.Current.IsSelected) selection.Select();
            Verify(() => {
                var current = FindControl(false, mode);
                object currentPattern;
                return current != null && current.TryGetCurrentPattern(SelectionItemPattern.Pattern, out currentPattern) && ((SelectionItemPattern)currentPattern).Current.IsSelected;
            });
        }
        else throw new InvalidOperationException("Windows exposed an unsupported Focus assist control. No setting was changed.");
        return new { mode = mode, verified = true, method = "UIAutomation" };
    }

    private static void Verify(Func<bool> matches)
    {
        var timeout = Stopwatch.StartNew();
        while (timeout.ElapsedMilliseconds < 3000)
        {
            try { if (matches()) return; }
            catch (ElementNotAvailableException) { }
            Thread.Sleep(100);
        }
        throw new InvalidOperationException("Windows did not confirm the requested Focus assist state.");
    }

    private static AutomationElement FindControl(bool windows11, string mode)
    {
        var windows = AutomationElement.RootElement.FindAll(TreeScope.Children, Condition.TrueCondition);
        foreach (AutomationElement window in windows)
        {
            try
            {
                using (var process = Process.GetProcessById(window.Current.ProcessId))
                {
                    if (!String.Equals(process.ProcessName, "SystemSettings", StringComparison.OrdinalIgnoreCase)) continue;
                }
                if (!windows11)
                {
                    string profile = mode == "Off" ? "Unrestricted" : mode == "AlarmsOnly" ? "AlarmsOnly" : "PriorityOnly";
                    return window.FindFirst(TreeScope.Descendants, new PropertyCondition(AutomationElement.AutomationIdProperty, "Microsoft.QuietHoursProfile." + profile + "_Button"));
                }
                // Exact identifiers/labels only. Never toggle a generic notification or automatic-rule switch.
                var controls = window.FindAll(TreeScope.Descendants, new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.CheckBox));
                foreach (AutomationElement item in controls)
                {
                    var current = item.Current;
                    if (current.AutomationId == "DoNotDisturbButton" || current.AutomationId == "SystemSettings_Notifications_QuietHours_ToggleSwitch" ||
                        current.Name == "Do not disturb" || current.Name == "Jangan ganggu") return item;
                }
                // Some Windows builds expose a ToggleSwitch as a Button instead of a CheckBox.
                var named = window.FindFirst(TreeScope.Descendants, new OrCondition(
                    new PropertyCondition(AutomationElement.NameProperty, "Do not disturb"),
                    new PropertyCondition(AutomationElement.NameProperty, "Jangan ganggu"),
                    new PropertyCondition(AutomationElement.AutomationIdProperty, "SystemSettings_Notifications_QuietHours_ToggleSwitch")));
                object toggle;
                if (named != null && named.TryGetCurrentPattern(TogglePattern.Pattern, out toggle)) return named;
            }
            catch (ElementNotAvailableException) { }
            catch (ArgumentException) { }
            catch (InvalidOperationException) { }
        }
        return null;
    }
}

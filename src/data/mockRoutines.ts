export type RoutineCategory = "work" | "gaming" | "study" | "chill" | "system";
export type RoutineColor = "strawberry" | "mint" | "sunny" | "blueberry" | "grape";
export type ActionType = "audio" | "app" | "web" | "powershell" | "focus";

export interface RoutineStep {
  id: string;
  type: ActionType;
  title: string;
  subtitle: string;
  param: string;
  proScript?: string;
  delayMs?: number;
}

export interface Routine {
  id: string;
  name: string;
  category: RoutineCategory;
  icon: string;
  color: RoutineColor;
  description: string;
  triggers: string[];
  steps: RoutineStep[];
  enabled: boolean;
  streakCount: number;
  lastRun?: string;
}

export const initialRoutines: Routine[] = [
  {
    id: "routine_work_mode",
    name: "Deep Focus (Work Mode)",
    category: "work",
    icon: "💻",
    color: "mint",
    description: "Sets workspace volume, turns on Do Not Disturb, and launches coding apps.",
    triggers: ["Mulai kerja", "Work mode", "Start working", "Waktunya ngoding"],
    enabled: true,
    streakCount: 5,
    steps: [
      {
        id: "step_1",
        type: "audio",
        title: "Set Master Volume",
        subtitle: "Level: 25%",
        param: "25",
        proScript: "Set-AudioEndpointVolume -Level 25",
      },
      {
        id: "step_2",
        type: "focus",
        title: "Turn ON Focus Assist",
        subtitle: "Silence notifications",
        param: "DoNotDisturb",
        proScript: "Set-WindowsFocusAssist -Mode PriorityOnly",
      },
      {
        id: "step_3",
        type: "app",
        title: "Launch Visual Studio Code",
        subtitle: "IDE & Development",
        param: "code.exe",
        proScript: "Start-Process 'code.exe' -ArgumentList '.'",
        delayMs: 300,
      },
      {
        id: "step_4",
        type: "app",
        title: "Launch Spotify",
        subtitle: "Playlist: Deep Focus Lo-Fi",
        param: "spotify.exe",
        proScript: "Start-Process 'spotify.exe' --uri 'spotify:playlist:focus'",
      },
      {
        id: "step_5",
        type: "web",
        title: "Open GitHub & Workspace",
        subtitle: "Browser tabs",
        param: "https://github.com",
        proScript: "Start-Process 'https://github.com'",
      },
    ],
  },
  {
    id: "routine_gaming_time",
    name: "Gaming Zone (Mabar Time)",
    category: "gaming",
    icon: "🎮",
    color: "strawberry",
    description: "Pumps audio to 70%, launches Steam and Discord for gaming sessions.",
    triggers: ["Waktunya mabar", "Gaming mode", "Let's play", "Main game"],
    enabled: true,
    streakCount: 3,
    steps: [
      {
        id: "step_g1",
        type: "audio",
        title: "Set Master Volume",
        subtitle: "Level: 70%",
        param: "70",
        proScript: "Set-AudioEndpointVolume -Level 70",
      },
      {
        id: "step_g2",
        type: "app",
        title: "Launch Discord",
        subtitle: "Voice communication",
        param: "discord.exe",
        proScript: "Start-Process 'discord.exe'",
      },
      {
        id: "step_g3",
        type: "app",
        title: "Launch Steam Client",
        subtitle: "Game launcher",
        param: "steam.exe",
        proScript: "Start-Process 'steam.exe'",
      },
    ],
  },
  {
    id: "routine_meeting_stealth",
    name: "Stealth Meeting (Mode Rapat)",
    category: "work",
    icon: "🎙️",
    color: "blueberry",
    description: "Mutes microphone initially, sets volume to 40%, and launches Zoom.",
    triggers: ["Mode rapat", "Meeting mode", "Start meeting", "Rapat online"],
    enabled: true,
    streakCount: 8,
    steps: [
      {
        id: "step_m1",
        type: "audio",
        title: "Set Volume to 40%",
        subtitle: "Earphone safe volume",
        param: "40",
      },
      {
        id: "step_m2",
        type: "audio",
        title: "Mute Microphone",
        subtitle: "Mute input until ready",
        param: "mute_mic",
        proScript: "Set-AudioEndpointMute -Endpoint Microphone -State $true",
      },
      {
        id: "step_m3",
        type: "app",
        title: "Launch Zoom Client",
        subtitle: "Video conferencing",
        param: "zoom.exe",
      },
    ],
  },
  {
    id: "routine_chill_night",
    name: "Night Chill (Mode Santai)",
    category: "chill",
    icon: "🍿",
    color: "grape",
    description: "Dim volume, open streaming movies, and set a peaceful shutdown timer.",
    triggers: ["Mode santai", "Chill mode", "Waktunya nonton", "Relax session"],
    enabled: true,
    streakCount: 2,
    steps: [
      {
        id: "step_c1",
        type: "audio",
        title: "Set Volume to 30%",
        subtitle: "Cozy movie volume",
        param: "30",
      },
      {
        id: "step_c2",
        type: "web",
        title: "Open Netflix / YouTube",
        subtitle: "Video entertainment",
        param: "https://netflix.com",
      },
      {
        id: "step_c3",
        type: "powershell",
        title: "Set 60m Sleep Timer",
        subtitle: "Desktop sleep schedule",
        param: "shutdown -s -t 3600",
        proScript: "shutdown.exe /s /t 3600",
      },
    ],
  },
];

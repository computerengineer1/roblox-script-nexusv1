const pool = require('../config/db');

const RIVALS_LUA_CODE = `-- ============================================================
-- 🔥 ENI RIVALS ULTIMATE HUB v6.0 (ENGLISH VERSION)
-- 👨‍💻 Developed for High Performance & Precision Gameplay
-- ============================================================

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Stats = game:GetService("Stats")
local Camera = workspace.CurrentCamera
local LocalPlayer = Players.LocalPlayer
local Mouse = LocalPlayer:GetMouse()

-- ========== [ Dynamic Configuration ] ==========
local Config = {
    Aimbot = {
        Enabled = true,
        OnShoot = true,          -- Activate when firing (Left Click)
        OnAim = true,            -- Activate when aiming down sights (Right Click)
        Key = Enum.KeyCode.X,     -- Keyboard keybind
        Smoothness = 0.35,       -- Regular aim smoothness (0.05 - 1.0)
        ShootingSmoothness = 0.9, -- High lock strength when shooting (Recoil Fix)
        FOV = 180,               -- Field of View size
        DrawFOV = true,          -- Draw FOV circle
        TargetPart = "Head",     -- "Head" or "HumanoidRootPart"
        Prediction = true,       -- Velocity lead prediction
        PredictionAmount = 0.035,-- Prediction factor
        VisibleCheck = true,     -- Don't aim through walls
        TeamCheck = false        -- Ignore teammates
    },
    ESP = {
        Enabled = true,
        Box = true,
        BoxColor = Color3.fromRGB(255, 50, 50),
        HealthBar = true,
        Name = true,
        Distance = true,
        TeamCheck = false
    },
    UI = {
        MenuOpen = true
    }
}

-- ========== [ UI Creation ] ==========
local CoreGui = game:GetService("CoreGui")
local ParentTarget = (gethui and gethui()) or CoreGui or LocalPlayer:WaitForChild("PlayerGui")

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "ENI_Rivals_Hub_v6"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = ParentTarget

-- 1. Floating Watermark Badge (Clickable)
local FloatBadge = Instance.new("TextButton")
FloatBadge.Name = "FloatingWatermark"
FloatBadge.Size = UDim2.new(0, 260, 0, 32)
FloatBadge.Position = UDim2.new(0, 15, 0, 15)
FloatBadge.BackgroundColor3 = Color3.fromRGB(20, 20, 28)
FloatBadge.BorderSizePixel = 0
FloatBadge.Text = "🔥 ENI RIVALS v6.0 | FPS: 60"
FloatBadge.TextColor3 = Color3.fromRGB(255, 170, 0)
FloatBadge.Font = Enum.Font.SourceSansBold
FloatBadge.TextSize = 13
FloatBadge.Active = true
FloatBadge.Draggable = true
FloatBadge.Parent = ScreenGui

local BadgeCorner = Instance.new("UICorner")
BadgeCorner.CornerRadius = UDim.new(0, 8)
BadgeCorner.Parent = FloatBadge

local BadgeStroke = Instance.new("UIStroke")
BadgeStroke.Color = Color3.fromRGB(255, 170, 0)
BadgeStroke.Thickness = 1
BadgeStroke.Transparency = 0.5
BadgeStroke.Parent = FloatBadge

-- 2. Main GUI Frame
local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 420, 0, 380)
MainFrame.Position = UDim2.new(0.5, -210, 0.5, -190)
MainFrame.BackgroundColor3 = Color3.fromRGB(18, 18, 24)
MainFrame.BorderSizePixel = 0
MainFrame.Active = true
MainFrame.Draggable = true
MainFrame.Visible = Config.UI.MenuOpen
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 10)
UICorner.Parent = MainFrame

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -60, 0, 40)
Title.Position = UDim2.new(0, 15, 0, 0)
Title.Text = "🔥 ENI RIVALS HUB v6.0 PRO"
Title.TextColor3 = Color3.fromRGB(255, 170, 0)
Title.TextSize = 18
Title.Font = Enum.Font.SourceSansBold
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.BackgroundTransparency = 1
Title.Parent = MainFrame

-- Close Button (✕)
local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 30, 0, 30)
CloseBtn.Position = UDim2.new(1, -38, 0, 5)
CloseBtn.BackgroundColor3 = Color3.fromRGB(180, 40, 40)
CloseBtn.Text = "✕"
CloseBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
CloseBtn.TextSize = 16
CloseBtn.Font = Enum.Font.SourceSansBold
CloseBtn.Parent = MainFrame

local CloseCorner = Instance.new("UICorner")
CloseCorner.CornerRadius = UDim.new(0, 6)
CloseCorner.Parent = CloseBtn

-- Toggle GUI Visibility Function
local function ToggleGUI()
    Config.UI.MenuOpen = not Config.UI.MenuOpen
    MainFrame.Visible = Config.UI.MenuOpen
end

CloseBtn.MouseButton1Click:Connect(ToggleGUI)
FloatBadge.MouseButton1Click:Connect(ToggleGUI)

local Line = Instance.new("Frame")
Line.Size = UDim2.new(1, -20, 0, 2)
Line.Position = UDim2.new(0, 10, 0, 40)
Line.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
Line.BorderSizePixel = 0
Line.Parent = MainFrame

local Container = Instance.new("ScrollingFrame")
Container.Size = UDim2.new(1, -20, 1, -55)
Container.Position = UDim2.new(0, 10, 0, 48)
Container.BackgroundTransparency = 1
Container.ScrollBarThickness = 4
Container.CanvasSize = UDim2.new(0, 0, 0, 470)
Container.Parent = MainFrame

local UIListLayout = Instance.new("UIListLayout")
UIListLayout.SortOrder = Enum.SortOrder.LayoutOrder
UIListLayout.Padding = UDim.new(0, 8)
UIListLayout.Parent = Container

-- Helper Function: Create Toggle Buttons
local function CreateToggle(text, category, key)
    local Button = Instance.new("TextButton")
    Button.Size = UDim2.new(1, -10, 0, 32)
    Button.BackgroundColor3 = Config[category][key] and Color3.fromRGB(35, 120, 75) or Color3.fromRGB(35, 35, 45)
    Button.Text = "   " .. text .. ": " .. (Config[category][key] and "[ON]" or "[OFF]")
    Button.TextColor3 = Color3.fromRGB(255, 255, 255)
    Button.Font = Enum.Font.SourceSansSemibold
    Button.TextSize = 14
    Button.TextXAlignment = Enum.TextXAlignment.Left
    Button.Parent = Container

    local Corner = Instance.new("UICorner")
    Corner.CornerRadius = UDim.new(0, 6)
    Corner.Parent = Button

    Button.MouseButton1Click:Connect(function()
        Config[category][key] = not Config[category][key]
        Button.BackgroundColor3 = Config[category][key] and Color3.fromRGB(35, 120, 75) or Color3.fromRGB(35, 35, 45)
        Button.Text = "   " .. text .. ": " .. (Config[category][key] and "[ON]" or "[OFF]")
    end)
end

-- Target Part Selector Button (Head / Body)
local TargetPartBtn = Instance.new("TextButton")
TargetPartBtn.Size = UDim2.new(1, -10, 0, 34)
TargetPartBtn.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
TargetPartBtn.Text = "   🎯 Target Part: " .. (Config.Aimbot.TargetPart == "Head" and "Head" or "Body")
TargetPartBtn.TextColor3 = Color3.fromRGB(255, 200, 100)
TargetPartBtn.Font = Enum.Font.SourceSansBold
TargetPartBtn.TextSize = 14
TargetPartBtn.TextXAlignment = Enum.TextXAlignment.Left
TargetPartBtn.Parent = Container

local TargetPartCorner = Instance.new("UICorner")
TargetPartCorner.CornerRadius = UDim.new(0, 6)
TargetPartCorner.Parent = TargetPartBtn

TargetPartBtn.MouseButton1Click:Connect(function()
    if Config.Aimbot.TargetPart == "Head" then
        Config.Aimbot.TargetPart = "HumanoidRootPart"
        TargetPartBtn.Text = "   🎯 Target Part: Body"
    else
        Config.Aimbot.TargetPart = "Head"
        TargetPartBtn.Text = "   🎯 Target Part: Head"
    end
end)

-- Helper Function: Create Sliders
local function CreateSlider(text, category, key, min, max)
    local Frame = Instance.new("Frame")
    Frame.Size = UDim2.new(1, -10, 0, 45)
    Frame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
    Frame.Parent = Container

    local Corner = Instance.new("UICorner")
    Corner.CornerRadius = UDim.new(0, 6)
    Corner.Parent = Frame

    local Label = Instance.new("TextLabel")
    Label.Size = UDim2.new(1, -10, 0, 20)
    Label.Position = UDim2.new(0, 10, 0, 2)
    Label.Text = text .. ": " .. tostring(Config[category][key])
    Label.TextColor3 = Color3.fromRGB(220, 220, 220)
    Label.Font = Enum.Font.SourceSans
    Label.TextSize = 13
    Label.TextXAlignment = Enum.TextXAlignment.Left
    Label.BackgroundTransparency = 1
    Label.Parent = Frame

    local SliderBtn = Instance.new("TextButton")
    SliderBtn.Size = UDim2.new(1, -20, 0, 14)
    SliderBtn.Position = UDim2.new(0, 10, 0, 24)
    SliderBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 65)
    SliderBtn.Text = ""
    SliderBtn.Parent = Frame

    local SliderCorner = Instance.new("UICorner")
    SliderCorner.CornerRadius = UDim.new(0, 4)
    SliderCorner.Parent = SliderBtn

    local Fill = Instance.new("Frame")
    Fill.Size = UDim2.new((Config[category][key] - min) / (max - min), 0, 1, 0)
    Fill.BackgroundColor3 = Color3.fromRGB(255, 170, 0)
    Fill.BorderSizePixel = 0
    Fill.Parent = SliderBtn

    local dragging = false
    local function UpdateSlider(input)
        local pos = math.clamp((input.Position.X - SliderBtn.AbsolutePosition.X) / SliderBtn.AbsoluteSize.X, 0, 1)
        local value = math.floor((min + (max - min) * pos) * 100) / 100
        Config[category][key] = value
        Fill.Size = UDim2.new(pos, 0, 1, 0)
        Label.Text = text .. ": " .. tostring(value)
    end

    SliderBtn.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            UpdateSlider(input)
        end
    end)
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then dragging = false end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then UpdateSlider(input) end
    end)
end

-- Build Menu UI Elements
CreateToggle("Main Aimbot", "Aimbot", "Enabled")
CreateToggle("Aim On Shoot (Left Click)", "Aimbot", "OnShoot")
CreateToggle("Aim On ADS (Right Click)", "Aimbot", "OnAim")
CreateToggle("Movement Prediction (Lead Aim)", "Aimbot", "Prediction")
CreateToggle("Visibility Check (Wall Check)", "Aimbot", "VisibleCheck")
CreateToggle("Draw FOV Circle", "Aimbot", "DrawFOV")

CreateSlider("FOV Size", "Aimbot", "FOV", 50, 500)
CreateSlider("Aim Smoothness", "Aimbot", "Smoothness", 0.05, 1)
CreateSlider("Shooting Lock (Recoil Fix)", "Aimbot", "ShootingSmoothness", 0.1, 1)

CreateToggle("Main ESP", "ESP", "Enabled")
CreateToggle("Box ESP", "ESP", "Box")
CreateToggle("Health Bar", "ESP", "HealthBar")
CreateToggle("Player Names", "ESP", "Name")
CreateToggle("Show Distance", "ESP", "Distance")

-- Keybind Listener (RightControl or Insert to toggle GUI)
UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end
    if input.KeyCode == Enum.KeyCode.RightControl or input.KeyCode == Enum.KeyCode.Insert then
        ToggleGUI()
    end
end)

-- ========== [ Drawing FOV Circle ] ==========
local FOVCircle = Drawing.new("Circle")
FOVCircle.Thickness = 1.5
FOVCircle.Color = Color3.fromRGB(255, 170, 0)
FOVCircle.Transparency = 0.8
FOVCircle.Filled = false
FOVCircle.NumSides = 64

-- ========== [ ESP Core ] ==========
local ESPCache = {}

local function IsTeammate(Player)
    if not Config.ESP.TeamCheck then return false end
    if Player.Team and LocalPlayer.Team then return Player.Team == LocalPlayer.Team end
    return false
end

local function IsVisible(TargetPart)
    if not Config.Aimbot.VisibleCheck then return true end
    local Origin = Camera.CFrame.Position
    local Direction = TargetPart.Position - Origin

    local RayParams = RaycastParams.new()
    RayParams.FilterType = Enum.RaycastFilterType.Exclude
    local Ignore = {Camera}
    if LocalPlayer.Character then table.insert(Ignore, LocalPlayer.Character) end
    RayParams.FilterDescendantsInstances = Ignore

    local Result = workspace:Raycast(Origin, Direction, RayParams)
    return not Result or Result.Instance:IsDescendantOf(TargetPart.Parent)
end

local function UpdateESP()
    for _, Player in pairs(Players:GetPlayers()) do
        if Player == LocalPlayer then continue end

        if not ESPCache[Player] then
            ESPCache[Player] = {
                Box = Drawing.new("Square"),
                HealthBg = Drawing.new("Square"),
                Health = Drawing.new("Square"),
                Name = Drawing.new("Text"),
                Distance = Drawing.new("Text")
            }
        end

        local Draw = ESPCache[Player]
        local Char = Player.Character
        local Root = Char and Char:FindFirstChild("HumanoidRootPart")
        local Head = Char and Char:FindFirstChild("Head")
        local Hum = Char and Char:FindFirstChildOfClass("Humanoid")

        if Config.ESP.Enabled and Char and Root and Head and Hum and Hum.Health > 0 and not IsTeammate(Player) then
            local RootPos, OnScreen1 = Camera:WorldToViewportPoint(Root.Position)
            local HeadPos, OnScreen2 = Camera:WorldToViewportPoint(Head.Position + Vector3.new(0, 0.5, 0))
            local LegPos, OnScreen3 = Camera:WorldToViewportPoint(Root.Position - Vector3.new(0, 3, 0))

            if OnScreen1 and OnScreen2 then
                local Height = math.abs(HeadPos.Y - LegPos.Y)
                local Width = Height * 0.55
                local CenterX = RootPos.X

                Draw.Box.Size = Vector2.new(Width, Height)
                Draw.Box.Position = Vector2.new(CenterX - Width / 2, HeadPos.Y)
                Draw.Box.Color = Config.ESP.BoxColor
                Draw.Box.Thickness = 1.5
                Draw.Box.Visible = Config.ESP.Box

                local HealthPct = math.clamp(Hum.Health / Hum.MaxHealth, 0, 1)
                local BarHeight = Height * HealthPct

                Draw.HealthBg.Size = Vector2.new(4, Height)
                Draw.HealthBg.Position = Vector2.new(CenterX - Width / 2 - 6, HeadPos.Y)
                Draw.HealthBg.Color = Color3.fromRGB(0, 0, 0)
                Draw.HealthBg.Filled = true
                Draw.HealthBg.Visible = Config.ESP.HealthBar

                Draw.Health.Size = Vector2.new(2, BarHeight)
                Draw.Health.Position = Vector2.new(CenterX - Width / 2 - 5, HeadPos.Y + (Height - BarHeight))
                Draw.Health.Color = Color3.fromRGB(255 * (1 - HealthPct), 255 * HealthPct, 0)
                Draw.Health.Filled = true
                Draw.Health.Visible = Config.ESP.HealthBar

                Draw.Name.Position = Vector2.new(CenterX, HeadPos.Y - 16)
                Draw.Name.Text = Player.DisplayName or Player.Name
                Draw.Name.Size = 13
                Draw.Name.Center = true
                Draw.Name.Outline = true
                Draw.Name.Visible = Config.ESP.Name

                local Dist = math.floor((Camera.CFrame.Position - Root.Position).Magnitude)
                Draw.Distance.Position = Vector2.new(CenterX, LegPos.Y + 2)
                Draw.Distance.Text = Dist .. "m"
                Draw.Distance.Size = 12
                Draw.Distance.Center = true
                Draw.Distance.Outline = true
                Draw.Distance.Visible = Config.ESP.Distance
            else
                for _, obj in pairs(Draw) do obj.Visible = false end
            end
        else
            for _, obj in pairs(Draw) do obj.Visible = false end
        end
    end
end

-- ========== [ Precision Aimbot & Velocity Prediction ] ==========
local function GetScreenCenter()
    return Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y / 2)
end

local function GetPredictedPosition(TargetPart)
    local Position = TargetPart.Position
    if Config.Aimbot.Prediction and TargetPart.Parent then
        local Root = TargetPart.Parent:FindFirstChild("HumanoidRootPart") or TargetPart
        local Velocity = Root.AssemblyLinearVelocity or Root.Velocity or Vector3.zero
        Position = Position + (Velocity * Config.Aimbot.PredictionAmount)
    end
    return Position
end

local function GetAimbotTarget()
    local TargetPart = nil
    local MinDist = Config.Aimbot.FOV
    local ScreenCenter = GetScreenCenter()

    for _, Player in pairs(Players:GetPlayers()) do
        if Player ~= LocalPlayer and not IsTeammate(Player) then
            local Char = Player.Character
            local Hum = Char and Char:FindFirstChildOfClass("Humanoid")
            local Part = Char and Char:FindFirstChild(Config.Aimbot.TargetPart)

            if Char and Hum and Hum.Health > 0 and Part then
                if IsVisible(Part) then
                    local ScreenPos, OnScreen = Camera:WorldToViewportPoint(Part.Position)
                    if OnScreen then
                        local Dist = (ScreenCenter - Vector2.new(ScreenPos.X, ScreenPos.Y)).Magnitude
                        if Dist < MinDist then
                            MinDist = Dist
                            TargetPart = Part
                        end
                    end
                end
            end
        end
    end
    return TargetPart
end

local function IsShooting()
    return Config.Aimbot.OnShoot and UserInputService:IsMouseButtonPressed(Enum.UserInputType.MouseButton1)
end

local function IsAiming()
    return Config.Aimbot.OnAim and UserInputService:IsMouseButtonPressed(Enum.UserInputType.MouseButton2)
end

local function IsKeyPressed()
    return UserInputService:IsKeyDown(Config.Aimbot.Key)
end

-- ========== [ Render Core (High Priority Camera Binding) ] ==========
local FrameCount, LastTime, CurrentFPS = 0, os.clock(), 60

RunService:UnbindFromRenderStep("ENI_Aimbot_Core")
RunService:BindToRenderStep("ENI_Aimbot_Core", Enum.RenderPriority.Camera.Value + 1, function()
    -- Calculate FPS & Ping for Watermark
    FrameCount = FrameCount + 1
    if os.clock() - LastTime >= 1 then
        CurrentFPS = FrameCount
        FrameCount = 0
        LastTime = os.clock()
    end

    local Ping = math.floor(Stats.Network.ServerStatsItem["Data Ping"]:GetValue())
    FloatBadge.Text = string.format("🔥 ENI RIVALS v6.0 | FPS: %d | Ping: %dms | [Click to Menu]", CurrentFPS, Ping)

    -- Update FOV Circle at screen center
    local ScreenCenter = GetScreenCenter()
    FOVCircle.Position = ScreenCenter
    FOVCircle.Radius = Config.Aimbot.FOV
    FOVCircle.Visible = Config.Aimbot.Enabled and Config.Aimbot.DrawFOV

    -- Update ESP
    UpdateESP()

    -- Execute Aimbot Camera Override
    if Config.Aimbot.Enabled and (IsShooting() or IsAiming() or IsKeyPressed()) then
        local TargetPart = GetAimbotTarget()
        if TargetPart then
            local AimPos = GetPredictedPosition(TargetPart)
            local TargetCFrame = CFrame.lookAt(Camera.CFrame.Position, AimPos)
            local CurrentSmoothness = IsShooting() and Config.Aimbot.ShootingSmoothness or Config.Aimbot.Smoothness
            Camera.CFrame = Camera.CFrame:Lerp(TargetCFrame, math.clamp(CurrentSmoothness, 0.01, 1))
        end
    end
end)

print("✅ ENI RIVALS ULTIMATE HUB v6.0 (ENGLISH) LOADED SUCCESSFULLY!")`;

// In-Memory Fallback Data Store (Activated automatically when MySQL DB is down or unreachable)
let memoryMaps = [
  {
    id: 1,
    name: 'Blox Fruits',
    image: 'https://www.roblox.com/asset-thumbnail/image?assetId=2753915549&width=768&height=432&format=png',
    description: 'Master swordsman and fruit powers in the vast ocean. Automatic farming, chest collector, and ESP scripts.',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Pet Simulator 99',
    image: 'https://www.roblox.com/asset-thumbnail/image?assetId=8737871904&width=768&height=432&format=png',
    description: 'Hatch eggs, collect shiny pets, and auto-break coins across all unlocked zones.',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Arsenal',
    image: 'https://www.roblox.com/asset-thumbnail/image?assetId=286090424&width=768&height=432&format=png',
    description: 'Fast-paced FPS game. Features silent aimbot, wallhack ESP, unlimited ammo, and kill aura.',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Brookhaven RP',
    image: 'https://www.roblox.com/asset-thumbnail/image?assetId=4924922222&width=768&height=432&format=png',
    description: 'Roleplay game with custom vehicle modifiers, unlock all gamepasses, and infinite jump.',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Rivals',
    image: 'https://www.roblox.com/asset-thumbnail/image?assetId=17625359962&width=768&height=432&format=png',
    description: 'Ultimate FPS Arena Game. Features ENI Rivals Hub v6.0 Pro Aimbot, Silent Aim, ESP, and Recoil Control.',
    created_at: new Date().toISOString()
  }
];

let memoryScripts = [
  {
    id: 37,
    map_id: 1,
    title: 'Auto Farm & Fast Attack Ultimate',
    category: 'Farming',
    description: 'Automated level farming, mob auto-aggro, and zero delay attack speed boost.',
    code: `-- Roblox Script Nexus - Blox Fruits Auto Farm
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Blox Fruits Auto Farm Loaded Successfully!",
        Duration = 5
    })
end)

local OrionLib = loadstring(game:HttpGet('https://raw.githubusercontent.com/shlexware/Orion/main/source'))()
local Window = OrionLib:MakeWindow({Name = "Blox Fruits - Script Nexus", HidePremium = false, SaveConfig = true, ConfigFolder = "NexusConfig"})

local FarmTab = Window:MakeTab({Name = "Auto Farm", Icon = "rbxassetid://4483345998", PremiumOnly = false})
FarmTab:AddToggle({
    Name = "Enable Auto Level Farm",
    Default = false,
    Callback = function(Value)
        _G.AutoFarm = Value
    end    
})
OrionLib:Init()`,
    created_at: new Date().toISOString(),
    like_count: 12
  },
  {
    id: 38,
    map_id: 1,
    title: 'Devil Fruit Finder & Store Notifier',
    category: 'ESP',
    description: 'Highlights spawned fruits on map with distance indicators and notifies when rare fruits appear.',
    code: `-- Roblox Script Nexus - Fruit Finder ESP
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Devil Fruit ESP Activated!",
        Duration = 5
    })
end)

local OrionLib = loadstring(game:HttpGet('https://raw.githubusercontent.com/shlexware/Orion/main/source'))()
local Window = OrionLib:MakeWindow({Name = "Fruit Finder - Script Nexus", HidePremium = false, SaveConfig = true, ConfigFolder = "NexusConfig"})
local ESPTab = Window:MakeTab({Name = "ESP Tracker", Icon = "rbxassetid://4483345998", PremiumOnly = false})

ESPTab:AddButton({
    Name = "Highlight Spawned Fruits",
    Callback = function()
        for _, v in pairs(game.Workspace:GetChildren()) do
            if v:IsA("Tool") or string.find(v.Name:lower(), "fruit") then
                local Highlight = Instance.new("Highlight")
                Highlight.Parent = v
                Highlight.FillColor = Color3.fromRGB(255, 0, 0)
            end
        end
    end
})
OrionLib:Init()`,
    created_at: new Date().toISOString(),
    like_count: 8
  },
  {
    id: 39,
    map_id: 2,
    title: 'Zone Auto Hatch & Shiny Boost',
    category: 'Farming',
    description: 'Auto-opens highest zone eggs with maximum speed and auto-deletes common pets.',
    code: `-- Roblox Script Nexus - Pet Sim 99 Auto Hatch
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Pet Sim 99 Auto Hatch Loaded!",
        Duration = 5
    })
end)

local OrionLib = loadstring(game:HttpGet('https://raw.githubusercontent.com/shlexware/Orion/main/source'))()
local Window = OrionLib:MakeWindow({Name = "Pet Sim 99 - Script Nexus", HidePremium = false, SaveConfig = true, ConfigFolder = "NexusConfig"})
local HatchTab = Window:MakeTab({Name = "Auto Hatch", Icon = "rbxassetid://4483345998", PremiumOnly = false})

HatchTab:AddToggle({
    Name = "Auto Open Best Zone Egg",
    Default = false,
    Callback = function(Value)
        _G.AutoHatch = Value
    end    
})
OrionLib:Init()`,
    created_at: new Date().toISOString(),
    like_count: 15
  },
  {
    id: 40,
    map_id: 3,
    title: 'Arsenal Aimbot & Wallhack Visuals',
    category: 'Combat',
    description: 'Smooth FOV aimbot with hitpart selection (Head, Torso) and chams color customizer.',
    code: `-- Roblox Script Nexus - Arsenal Aimbot & ESP
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Arsenal Aimbot & Visuals Active!",
        Duration = 5
    })
end)

local OrionLib = loadstring(game:HttpGet('https://raw.githubusercontent.com/shlexware/Orion/main/source'))()
local Window = OrionLib:MakeWindow({Name = "Arsenal - Script Nexus", HidePremium = false, SaveConfig = true, ConfigFolder = "NexusConfig"})
local CombatTab = Window:MakeTab({Name = "Combat", Icon = "rbxassetid://4483345998", PremiumOnly = false})

CombatTab:AddToggle({
    Name = "Enable Silent Aimbot",
    Default = false,
    Callback = function(Value)
        _G.Aimbot = Value
    end
})
OrionLib:Init()`,
    created_at: new Date().toISOString(),
    like_count: 24
  },
  {
    id: 41,
    map_id: 5,
    title: 'ENI RIVALS ULTIMATE HUB v6.0 PRO',
    category: 'Combat',
    description: 'Ultimate precision aimbot, smooth camera tracking, movement prediction, and full player ESP for Rivals.',
    code: RIVALS_LUA_CODE,
    created_at: new Date().toISOString(),
    like_count: 45
  }
];

let nextMapId = 6;
let nextScriptId = 42;

// Resilient Map Queries
async function getMaps() {
  try {
    const [rows] = await pool.execute(`
      SELECT m.*, COUNT(s.id) AS script_count
      FROM maps m
      LEFT JOIN scripts s ON m.id = s.map_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn('DB getMaps fallback:', err.message);
  }
  return memoryMaps.map(m => ({
    ...m,
    script_count: memoryScripts.filter(s => s.map_id === m.id).length
  }));
}

async function getMapById(id) {
  try {
    const [rows] = await pool.execute('SELECT * FROM maps WHERE id = ?', [id]);
    if (rows && rows.length > 0) return rows[0];
  } catch (err) {
    console.warn('DB getMapById fallback:', err.message);
  }
  return memoryMaps.find(m => m.id === parseInt(id, 10)) || null;
}

async function addMap({ name, image, description }) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO maps (name, image, description) VALUES (?, ?, ?)',
      [name, image, description || '']
    );
    return result.insertId;
  } catch (err) {
    console.warn('DB addMap fallback to memory:', err.message);
    const newMap = {
      id: nextMapId++,
      name,
      image,
      description: description || '',
      created_at: new Date().toISOString()
    };
    memoryMaps.unshift(newMap);
    return newMap.id;
  }
}

async function deleteMap(id) {
  try {
    await pool.execute('DELETE FROM maps WHERE id = ?', [id]);
  } catch (err) {
    console.warn('DB deleteMap fallback:', err.message);
  }
  const mapIdNum = parseInt(id, 10);
  memoryMaps = memoryMaps.filter(m => m.id !== mapIdNum);
  memoryScripts = memoryScripts.filter(s => s.map_id !== mapIdNum);
}

// Resilient Script Queries
async function getScriptsByMapId(mapId) {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*,
              (SELECT COUNT(*) FROM likes l WHERE l.script_id = s.id) AS like_count
       FROM scripts s
       WHERE s.map_id = ?
       ORDER BY s.created_at DESC`,
      [mapId]
    );
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn('DB getScriptsByMapId fallback:', err.message);
  }
  return memoryScripts.filter(s => s.map_id === parseInt(mapId, 10));
}

async function getAllScripts() {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, m.name AS map_name
      FROM scripts s
      JOIN maps m ON s.map_id = m.id
      ORDER BY s.created_at DESC
    `);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn('DB getAllScripts fallback:', err.message);
  }
  return memoryScripts.map(s => {
    const map = memoryMaps.find(m => m.id === s.map_id);
    return { ...s, map_name: map ? map.name : 'Game Map' };
  });
}

async function getScriptCodeById(scriptId) {
  const idNum = parseInt(scriptId, 10);
  try {
    const [rows] = await pool.execute('SELECT code FROM scripts WHERE id = ?', [idNum]);
    if (rows && rows.length > 0) return rows[0].code;
  } catch (err) {
    console.warn('DB getScriptCodeById fallback:', err.message);
  }

  // Check memory store
  const found = memoryScripts.find(s => s.id === idNum);
  if (found) return found.code;

  // Fallback for special / custom requested IDs like 90001
  if (idNum === 90001 || scriptId === '90001') {
    return RIVALS_LUA_CODE;
  }

  return null;
}

async function addScript({ map_id, title, category, code, description }) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO scripts (map_id, title, category, code, description) VALUES (?, ?, ?, ?, ?)',
      [map_id, title, category || 'General', code, description || '']
    );
    return result.insertId;
  } catch (err) {
    console.warn('DB addScript fallback to memory:', err.message);
    const newScript = {
      id: nextScriptId++,
      map_id: parseInt(map_id, 10),
      title,
      category: category || 'General',
      code,
      description: description || '',
      created_at: new Date().toISOString(),
      like_count: 0
    };
    memoryScripts.unshift(newScript);
    return newScript.id;
  }
}

async function deleteScript(id) {
  try {
    await pool.execute('DELETE FROM scripts WHERE id = ?', [id]);
  } catch (err) {
    console.warn('DB deleteScript fallback:', err.message);
  }
  const scriptIdNum = parseInt(id, 10);
  memoryScripts = memoryScripts.filter(s => s.id !== scriptIdNum);
}

// Search Query Fallback
async function searchMapsAndScripts(query) {
  try {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT m.*, COUNT(s.id) AS script_count
       FROM maps m
       LEFT JOIN scripts s ON m.id = s.map_id
       WHERE m.name LIKE ? OR m.description LIKE ?
       GROUP BY m.id
       ORDER BY m.created_at DESC`,
      [searchTerm, searchTerm]
    );
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn('DB searchMapsAndScripts fallback:', err.message);
  }

  const q = query.toLowerCase();
  return memoryMaps
    .filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    .map(m => ({
      ...m,
      script_count: memoryScripts.filter(s => s.map_id === m.id).length
    }));
}

module.exports = {
  getMaps,
  getMapById,
  addMap,
  deleteMap,
  getScriptsByMapId,
  getAllScripts,
  getScriptCodeById,
  addScript,
  deleteScript,
  searchMapsAndScripts,
  memoryMaps,
  memoryScripts,
  RIVALS_LUA_CODE
};

const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🌱 Starting database setup and seeding...');

  try {
    // 0. Ensure tables exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          google_id VARCHAR(255) NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          avatar VARCHAR(500) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS maps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          image LONGTEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS scripts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          map_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          code TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_scripts_map FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          script_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_likes_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_script_like (user_id, script_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          script_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_comments_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
          id INT AUTO_INCREMENT PRIMARY KEY,
          script_id INT NULL,
          map_id INT NULL,
          event_type ENUM('view', 'copy') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_analytics_map FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE SET NULL,
          CONSTRAINT fk_analytics_script FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          map_id INT NOT NULL,
          user_token VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_subscriptions_map FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS login_attempts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ip_address VARCHAR(45) NOT NULL,
          attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ All database tables created/verified successfully.');

    // 1. Seed Admin User
    const adminUsername = '72430170';
    const adminPassword = 'Okgg123321okgg';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    await pool.execute('DELETE FROM admin_users');
    await pool.execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [adminUsername, passwordHash]
    );
    console.log(`✅ Admin created (username: ${adminUsername})`);


    // Seed Demo User
    const [demoUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', ['demo@robloxnexus.com']);
    if (demoUsers.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, avatar) VALUES (?, ?, ?)',
        ['Nexus Gamer', 'demo@robloxnexus.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=NexusGamer']
      );
      console.log('✅ Demo community user created');
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'public/uploads/maps');
    if (!fs.existsSync(uploadsDir)) {
      try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
    }

    const mapsData = [
      {
        name: 'Blox Fruits',
        image: '/uploads/maps/bloxfruits.jpg',
        description: 'Master swordsman and fruit powers in the vast ocean. Automatic farming, chest collector, and ESP scripts.',
        scripts: [
          {
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
        if Value then
            print("[NEXUS] Auto Farm Enabled")
        end
    end    
})
FarmTab:AddButton({
    Name = "Fast Attack Speed (On)",
    Callback = function()
        print("[NEXUS] Fast Attack Activated")
    end
})

OrionLib:Init()`
          },
          {
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

OrionLib:Init()`
          }
        ]
      },
      {
        name: 'Pet Simulator 99',
        image: '/uploads/maps/petsim99.jpg',
        description: 'Hatch eggs, collect shiny pets, and auto-break coins across all unlocked zones.',
        scripts: [
          {
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

OrionLib:Init()`
          },
          {
            title: 'Infinite Coin & Gem Collector',
            category: 'Utility',
            description: 'Teleports all dropped breakable coins directly to your avatar.',
            code: `-- Roblox Script Nexus - Coin Magnet
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Coin & Gem Magnet Active!",
        Duration = 5
    })
end)
print("[NEXUS] Pet Sim 99 Magnet Activated")`
          }
        ]
      },
      {
        name: 'Arsenal',
        image: '/uploads/maps/arsenal.jpg',
        description: 'Fast-paced FPS game. Features silent aimbot, wallhack ESP, unlimited ammo, and kill aura.',
        scripts: [
          {
            title: 'Aimbot & Wallhack Visuals',
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

CombatTab:AddToggle({
    Name = "Player Wallhack ESP",
    Default = false,
    Callback = function(Value)
        _G.ESP = Value
    end
})

OrionLib:Init()`
          },
          {
            title: 'No Recoil & Rapid Fire',
            category: 'Combat',
            description: 'Eliminates weapon recoil and increases fire rate on all assault rifles and pistols.',
            code: `-- Roblox Script Nexus - Weapon Mods
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Arsenal No Recoil Active!",
        Duration = 5
    })
end)
print("[NEXUS] Arsenal Weapon Modifier Activated")`
          }
        ]
      },
      {
        name: 'Brookhaven RP',
        image: '/uploads/maps/brookhaven.jpg',
        description: 'Roleplay game with custom vehicle modifiers, unlock all gamepasses, and infinite jump.',
        scripts: [
          {
            title: 'Vehicle Speed & Fly Mod',
            category: 'Movement',
            description: 'Unlock super speed for all cars, enable vehicle flight and zero collision mode.',
            code: `-- Roblox Script Nexus - Brookhaven Vehicle Fly
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Roblox Script Nexus",
        Text = "Brookhaven Vehicle Fly Active! Press F in car.",
        Duration = 5
    })
end)
print("[NEXUS] Brookhaven Vehicle Fly Loaded")`
          }
        ]
      }
    ];

    await pool.execute('DELETE FROM scripts');
    await pool.execute('DELETE FROM maps');

    for (const mapItem of mapsData) {
      const [result] = await pool.execute(
        'INSERT INTO maps (name, image, description) VALUES (?, ?, ?)',
        [mapItem.name, mapItem.image, mapItem.description]
      );
      const mapId = result.insertId;

      for (const scriptItem of mapItem.scripts) {
        await pool.execute(
          'INSERT INTO scripts (map_id, title, category, code, description) VALUES (?, ?, ?, ?, ?)',
          [mapId, scriptItem.title, scriptItem.category, scriptItem.code, scriptItem.description]
        );
      }
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Seed Admin User
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    await pool.execute('DELETE FROM admin_users');
    await pool.execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [adminUsername, passwordHash]
    );
    console.log(`✅ Default admin created (username: ${adminUsername}, password: ${adminPassword})`);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'public/uploads/maps');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate dummy SVG/PNG image placeholders for maps if missing
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
            code: `-- Roblox Script Nexus - Blox Fruits Auto Farm\nlocal Library = loadstring(game:HttpGet("https://raw.githubusercontent.com/nexus/ui/main/lib.lua"))()\nlocal Window = Library:CreateWindow("Blox Fruits Nexus")\n\nlocal FarmTab = Window:CreateTab("Auto Farm")\nFarmTab:CreateToggle("Enable Auto Farm", function(state)\n    _G.AutoFarm = state\n    while _G.AutoFarm do\n        task.wait(0.1)\n        print("[NEXUS] Auto-farming closest mob...")\n    end\nend)`
          },
          {
            title: 'Devil Fruit Finder & Store Notifier',
            category: 'ESP',
            description: 'Highlights spawned fruits on map with distance indicators and sends Discord webhooks when rare fruits appear.',
            code: `-- Blox Fruits Fruit ESP & Finder\nlocal ESP = loadstring(game:HttpGet("https://raw.githubusercontent.com/nexus/esp/main.lua"))()\nESP.Fruits = true\nESP:Enable()\nprint("[NEXUS] Devil Fruit ESP Active!")`
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
            code: `-- Pet Sim 99 Auto Hatch\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")
local EggService = ReplicatedStorage.Network.Eggs_RequestPurchase
print("[NEXUS] Auto-Hatching Activated for Zone 99")`
          },
          {
            title: 'Infinite Coin & Gem Collector',
            category: 'Utility',
            description: 'Teleports all dropped breakable coins directly to your avatar.',
            code: `-- PS99 Magnet Loot Script\ngetgenv().MagnetRange = 5000\nprint("[NEXUS] Global loot magnet active!")`
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
            code: `-- Arsenal Nexus Combat Suite\nlocal Aimbot = {}\nAimbot.FOV = 120\nAimbot.Smoothness = 0.2\nprint("[NEXUS] Arsenal Silent Aimbot initialized!")`
          },
          {
            title: 'No Recoil & Rapid Fire',
            category: 'Combat',
            description: 'Eliminates weapon recoil and increases fire rate on all assault rifles and pistols.',
            code: `-- Arsenal Fire Rate Modifier\nlocal CurrentWeapon = game:GetService("Players").LocalPlayer.Character:FindFirstChildOfClass("Tool")\nif CurrentWeapon then\n    print("[NEXUS] Modified weapon stats for " .. CurrentWeapon.Name)\nend`
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
            code: `-- Brookhaven Vehicle Fly Script\nlocal Player = game.Players.LocalPlayer\nprint("[NEXUS] Vehicle fly loaded. Press 'F' to toggle.")`
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

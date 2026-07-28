const pool = require('../config/db');

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
  }
];

let nextMapId = 5;
let nextScriptId = 41;

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
  try {
    const [rows] = await pool.execute('SELECT code FROM scripts WHERE id = ?', [scriptId]);
    if (rows && rows.length > 0) return rows[0].code;
  } catch (err) {
    console.warn('DB getScriptCodeById fallback:', err.message);
  }
  const found = memoryScripts.find(s => s.id === parseInt(scriptId, 10));
  return found ? found.code : null;
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
  memoryScripts
};

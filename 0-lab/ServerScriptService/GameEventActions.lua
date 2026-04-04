local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

-- สร้าง BindableEvent เพื่อสื่อสารกับ Farm Script (ถ้ายังไม่มีให้สร้าง)
local function getBindable(name)
	local event = ServerStorage:FindFirstChild(name)
	if not event then
		event = Instance.new("BindableEvent")
		event.Name = name
		event.Parent = ServerStorage
	end
	return event
end

local GameEventActions = {}

-- ==================================================================
-- 🛠️ Helper: เสก NPC
-- ==================================================================
local function spawnMob(mobName, amount, targetRole, senderName)
	local npcFolder = ServerStorage:WaitForChild("NPC")
	local model = npcFolder:FindFirstChild(mobName)
	if not model then return end

	local count = tonumber(amount) or 1
	print("🤖 Spawning " .. count .. " " .. mobName .. (senderName and " by " .. senderName or ""))

	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("Role") == targetRole then
			local character = player.Character
			if character and character:FindFirstChild("HumanoidRootPart") then
				local rootPart = character.HumanoidRootPart
				for i = 1, count do
					local npc = model:Clone()
					npc.Name = mobName .. "_" .. math.random(1, 1000)
					if not npc:GetAttribute("Team") then npc:SetAttribute("Team", "Neutral") end

					-- สุ่มตำแหน่งรอบตัว
					local angle = math.rad(math.random(1, 360))
					local dist = 15
					local spawnPos = rootPart.Position + Vector3.new(math.cos(angle)*dist, 0, math.sin(angle)*dist)
					-- ถ้าเป็น Team Villain 62.234, 0.9, -102.691 แต่ถา้เป็น Guardian  228.3, 0.9, -103.2
					if npc:GetAttribute("Team") == "Villain" then
						spawnPos = Vector3.new(62.234, 0.9, -102.691) + Vector3.new(math.cos(angle)*dist, 0, math.sin(angle)*dist)
					end
					if npc:GetAttribute("Team") == "Guardian" then
						spawnPos = Vector3.new(228.3, 0.9, -103.2) + Vector3.new(math.cos(angle)*dist, 0, math.sin(angle)*dist)
					end

					npc:PivotTo(CFrame.new(spawnPos, rootPart.Position))
					npc.Parent = workspace

					-- Effect
					local ex = Instance.new("Explosion")
					ex.Position = spawnPos
					ex.BlastRadius = 0
					ex.BlastPressure = 0
					ex.Parent = workspace
					task.wait(0.1)
				end
			end
		end
	end
end

-- ==================================================================
-- 🟢 Game Actions
-- ==================================================================



-- [1] Downgrade (ลดระดับพืช)
function GameEventActions.Downgrade(amount, senderName)
	print("🔻 Downgrade Event by " .. tostring(senderName))
	local bridge = getBindable("FarmSystemBridge")
	bridge:Fire("Downgrade", tonumber(amount) or 1)
end

-- [2] Upgrade (เพิ่มระดับพืช) [แก้ไขให้ปลอดภัยขึ้น]
function GameEventActions.Upgrade(amount, senderName)
	print("⬆️ Upgrade Event by " .. tostring(senderName))
	local bridge = getBindable("FarmSystemBridge")
	-- ส่งคำสั่งไปที่ Bridge
	bridge:Fire("Upgrade", tonumber(amount) or 1)
end

-- [3] SpawnGuardian
function GameEventActions.SpawnGuardian(amount, senderName)
	spawnMob("Guardian", amount, "streamer", senderName)
end

-- [4] SpawnVillain
function GameEventActions.SpawnVillain(amount, senderName)
	spawnMob("Villain", amount, "streamer", senderName)
end

-- [4] SpawnVillain
function GameEventActions.SpawnVillain_old(amount, senderName)
	spawnMob("Villain_old", amount, "streamer", senderName)
end

-- [4] SpawnVillain
function GameEventActions.SpawnGuardian_old(amount, senderName)
	spawnMob("Guardian_old", amount, "streamer", senderName)
end

-- [5] Kill (สั่งตาย Streamer)
function GameEventActions.Kill(amount, senderName)
	print("💀 Kill Command by " .. tostring(senderName))
	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("Role") == "streamer" then
			local char = player.Character
			if char and char:FindFirstChild("Humanoid") then
				-- Effect
				local root = char:FindFirstChild("HumanoidRootPart")
				if root then
					local ex = Instance.new("Explosion")
					ex.Position = root.Position
					ex.BlastRadius = 0
					ex.Parent = workspace
				end
				-- Die
				char.Humanoid.Health = 0
				pcall(function() char:BreakJoints() end)
			end
		end
	end
end

-- [6] IceStorm (พายุน้ำแข็ง)
function GameEventActions.IceStorm(amount, senderName)
	local duration = tonumber(amount) or 5
	for _, player in ipairs(Players:GetPlayers()) do
		if player:GetAttribute("Role") == "streamer" then
			task.spawn(function()
				local char = player.Character
				if not char then return end
				local root = char:FindFirstChild("HumanoidRootPart")
				if not root then return end

				local cloud = Instance.new("Part")
				cloud.Size = Vector3.new(15, 1, 15)
				cloud.Anchored = true
				cloud.CanCollide = false
				cloud.Transparency = 0.5
				cloud.BrickColor = BrickColor.new("Cyan")
				cloud.Material = Enum.Material.Ice
				cloud.CFrame = root.CFrame * CFrame.new(0, 20, 0)
				cloud.Parent = workspace
				game:GetService("Debris"):AddItem(cloud, duration)

				local endTime = tick() + duration
				while tick() < endTime and char.Parent do
					local ice = Instance.new("Part")
					ice.Size = Vector3.new(2,2,2)
					ice.Shape = Enum.PartType.Ball
					ice.BrickColor = BrickColor.new("White")
					ice.CFrame = cloud.CFrame * CFrame.new(math.random(-6,6), -2, math.random(-6,6))
					ice.Parent = workspace
					game:GetService("Debris"):AddItem(ice, 3)
					task.wait(0.2)
				end
			end)
		end
	end
end

-- [7] Meteor (อุกกาบาตล้างโลก)
function GameEventActions.Meteor(amount, senderName)
	-- ตั้งค่า Default amount เป็น 1 ถ้าไม่ได้ใส่มา หรือเป็น nil
	amount = tonumber(amount) or 1

	print("☄️ Meteor Event x" .. amount .. " by " .. tostring(senderName))

	local farmGrid = workspace:FindFirstChild("FarmGrid")
	local centerPlot = farmGrid and farmGrid:FindFirstChild("Plot5") -- จุดเล็งเป้า
	local meteorTemplate = ServerStorage:FindFirstChild("OldMeteor")

	if centerPlot and meteorTemplate then

		-- เริ่มวนลูปปล่อยของ
		for i = 1, amount do
			-- ใช้ task.spawn เพื่อแยก Thread (ไม่งั้นต้องรอ 5 วิกว่าลูกแรกจะระเบิด ถึงจะลูปต่อ)
			task.spawn(function()
				local meteor = meteorTemplate:Clone()
				local root = meteor:IsA("Model") and meteor.PrimaryPart or meteor
				if not root then meteor:Destroy() return end

				-- [Optional] สุ่มตำแหน่งตกเล็กน้อย รอบๆ Plot 5 (ระยะ +/- 20 studs) 
				-- เพื่อไม่ให้โมเดลมันซ้อนกันจนดูบั๊ก
				local randomOffset = Vector3.new(math.random(-20, 20), 0, math.random(-20, 20))
				local targetPosition = centerPlot.Position + randomOffset

				-- ถ้าอยากให้ตกจุดเดิมเป๊ะๆ ให้ใช้บรรทัดนี้แทน:
				-- local targetPosition = centerPlot.Position

				meteor.Parent = workspace

				-- ตั้งตำแหน่งเริ่มต้น (สูง 400)
				if meteor:IsA("Model") then 
					meteor:PivotTo(CFrame.new(targetPosition + Vector3.new(0,400,0)))
				else 
					meteor.CFrame = CFrame.new(targetPosition + Vector3.new(0,400,0)) 
				end

				root.Anchored = true

				-- Tween ลงมา
				local tween = TweenService:Create(root, TweenInfo.new(5, Enum.EasingStyle.Linear), {CFrame = CFrame.new(targetPosition)})
				tween:Play()
				tween.Completed:Wait() -- รอ 5 วิ ใน Thread ย่อยนี้

				-- ระเบิด
				local ex = Instance.new("Explosion")
				ex.Position = root.Position
				ex.BlastRadius = 60
				ex.BlastPressure = 0
				ex.Parent = workspace

				-- ฆ่าคน
				ex.Hit:Connect(function(part)
					if part.Parent and part.Parent:FindFirstChild("Humanoid") then
						part.Parent.Humanoid.Health = 0
					end
				end)

				meteor:Destroy()
			end)

			-- Delay 0.5 วินาที ก่อนปล่อยลูกถัดไป
			if i < amount then
				task.wait(0.5)
			end
		end
	end

	-- 2. Reset Game
	-- หมายเหตุ: เนื่องจากเราใช้ task.spawn โค้ดจะวิ่งมาบรรทัดนี้ทันทีหลังจากปล่อยลูกสุดท้าย (ซึ่งลูกสุดท้ายยังอยู่กลางอากาศ)
	-- ถ้าต้องการให้ "ระเบิดทุกลูกให้หมดก่อน" ค่อยรีเซ็ตเกม ให้เปิดบรรทัด task.wait(5) ด้านล่างนี้ครับ

	-- task.wait(5) 

	local bridge = getBindable("FarmSystemBridge")
	bridge:Fire("ResetGame")
end

return GameEventActions
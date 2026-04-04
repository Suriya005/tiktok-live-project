-- Module: GameEventActions
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local Players = game:GetService("Players")

local GameEventActions = {}

-- ==================================================================
-- 🟢 TEMPLATE: วิธีเพิ่ม Event ใหม่
-- 1. ก๊อปปี้ฟังก์ชันด้านล่าง
-- 2. เปลี่ยนชื่อฟังก์ชันให้ตรงกับ 'event_name' ใน Database
-- 3. เขียน Logic ที่ต้องการข้างใน
-- ==================================================================

-- [Example 1] สั่ง Villain ยิงลูกไฟ
function GameEventActions.Fireball(amount)
	local villainEvent = ReplicatedStorage:FindFirstChild("VillainEvent")
	if villainEvent then
		villainEvent:Fire(amount)
		print("🔥 Action: Fireball executed with amount:", amount)
	end
end

-- [Example 2] สั่ง Guardian ฮีล/ฟื้นฟู
function GameEventActions.Heal(amount)
	local guardianEvent = ReplicatedStorage:FindFirstChild("GuardianEvent")
	if guardianEvent then
		guardianEvent:Fire(amount)
		print("🌿 Action: Heal executed with amount:", amount)
	end
end

-- [Example 3] แจกเงินให้ทุกคน (ไม่ต้องใช้ BindableEvent เขียนสดได้เลย)
function GameEventActions.GiveGold(amount)
	for _, player in ipairs(Players:GetPlayers()) do
		local leaderstats = player:FindFirstChild("leaderstats")
		if leaderstats then
			local gold = leaderstats:FindFirstChild("Gold") -- สมมติว่ามี
			if gold then
				gold.Value = gold.Value + amount
			end
		end
	end
	print("💰 Action: GiveGold executed, added " .. amount .. " to everyone.")
end

-- [Event ใหม่] พายุน้ำแข็ง (เฉพาะ Streamer)
function GameEventActions.IceStorm(amount)
	local duration = tonumber(amount) or 5 -- ใช้ amount เป็นระยะเวลา (วินาที)
	print("❄️ Event: IceStorm กำลังถล่ม Streamer นาน " .. duration .. " วินาที!")

	-- 1. วนลูปหาคนทั้งเซิร์ฟ
	for _, player in ipairs(Players:GetPlayers()) do

		-- 2. เช็คเงื่อนไข: ต้องมียศเป็น "streamer" เท่านั้น
		local role = player:GetAttribute("Role")

		if role == "streamer" then
			print("   🎯 เป้าหมายยืนยัน: " .. player.Name)

			-- แยก Thread ทำงานเฉพาะคน (จะได้ไม่บล็อกคนอื่น)
			task.spawn(function()
				local character = player.Character
				if not character then return end
				local rootPart = character:FindFirstChild("HumanoidRootPart")
				if not rootPart then return end

				-- สร้างก้อนเมฆน้ำแข็งเหนือหัว
				local cloud = Instance.new("Part")
				cloud.Name = "IceCloud"
				cloud.Size = Vector3.new(10, 1, 10)
				cloud.Transparency = 0.5
				cloud.BrickColor = BrickColor.new("Cyan")
				cloud.Material = Enum.Material.Ice
				cloud.Anchored = true
				cloud.CanCollide = false
				cloud.CFrame = rootPart.CFrame * CFrame.new(0, 15, 0) -- สูงจากหัว 15 stud
				cloud.Parent = workspace

				-- ลบเมฆทิ้งเมื่อหมดเวลา
				game:GetService("Debris"):AddItem(cloud, duration)

				-- ลูปปล่อยก้อนน้ำแข็งตกลงมา
				local endTime = tick() + duration
				while tick() < endTime do
					if not character.Parent then break end -- ถ้าตายหรือออกเกม ให้หยุด

					-- สร้างก้อนน้ำแข็ง
					local ice = Instance.new("Part")
					ice.Size = Vector3.new(2, 2, 2)
					ice.BrickColor = BrickColor.new("Baby blue")
					ice.Material = Enum.Material.Ice
					ice.Shape = Enum.PartType.Ball
					ice.CFrame = cloud.CFrame * CFrame.new(math.random(-4, 4), -2, math.random(-4, 4))
					ice.Parent = workspace

					-- เมื่อน้ำแข็งชน (Touched) ให้ระเบิด/ทำดาเมจ
					ice.Touched:Connect(function(hit)
						if hit.Parent == character then return end -- ไม่ทำดาเมจตัวเอง (หรือจะทำก็ได้แล้วแต่)

						-- Effect แตกกระจาย
						local particle = Instance.new("ParticleEmitter")
						particle.Texture = "rbxassetid://1266170131" -- Texture เกล็ดหิมะ (ถ้ามี)
						particle.Lifetime = NumberRange.new(0.5)
						particle.Rate = 50
						particle.Parent = ice

						task.wait(0.1)
						ice:Destroy()
					end)

					-- ทำลายก้อนน้ำแข็งถ้าร่วงไปไม่โดนอะไร
					game:GetService("Debris"):AddItem(ice, 3)

					task.wait(0.2) -- ปล่อยลงมาทุกๆ 0.2 วิ (รัวๆ)
				end
			end)
		end
	end
end


function GameEventActions.Kill(amount)
	print("💀 Event: Kill Command Executed!")

	for _, player in ipairs(Players:GetPlayers()) do
		local role = player:GetAttribute("Role")

		if role == "streamer" then
			local character = player.Character

			-- 1. เช็คว่ามีตัวละครจริงไหม และอยู่ใน Workspace ไหม
			if character and character.Parent then

				local humanoid = character:FindFirstChild("Humanoid")
				local rootPart = character:FindFirstChild("HumanoidRootPart")

				if humanoid and rootPart then
					-- เล่นเสียง
					local sound = Instance.new("Sound")
					sound.SoundId = "rbxassetid://12222084"
					sound.Volume = 1
					sound.Parent = rootPart
					sound.PlayOnRemove = true
					sound:Destroy()

					-- เอฟเฟกต์
					local explosion = Instance.new("Explosion")
					explosion.Position = rootPart.Position
					explosion.BlastRadius = 0 
					explosion.Parent = workspace

					-- 2. สั่งตาย (วิธีที่ปลอดภัยที่สุด)
					humanoid.Health = 0

					-- 3. สั่งตัวแตก (ใช้ pcall กัน error กรณีตัวกำลังจะหายไป)
					pcall(function()
						character:BreakJoints()
					end)

					print("   💀 ฆ่าผู้เล่น: " .. player.Name)
				end
			end
		end
	end
end


-- [TEMPLATE] อีเวนต์ใหม่ของคุณ (ก๊อปปี้ตรงนี้ไปใช้)
function GameEventActions.YOUR_EVENT_NAME(amount)
	print("✨ New Event Triggered! Amount:", amount)

	-- เขียนโค้ดตรงนี้เลย เช่น:
	-- 1. เสกมอนสเตอร์
	-- 2. เปลี่ยนท้องฟ้า
	-- 3. ประกาศข้อความทั้งเซิร์ฟ
end

return GameEventActions
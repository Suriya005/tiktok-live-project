local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

-- ==============================================================================
-- ⚙️ CONFIGURATION & CONSTANTS
-- ==============================================================================
local SECRET_NAME = "my_secret_key"
local API_URL = "https://demure-kecia-noncondensing.ngrok-free.dev/api/v1/event-queue/next"
local DEFAULT_POLLING = 2

-- Map ชื่อ Event กับ BindableEvent ที่ต้องทำงาน
local EVENTS_MAP = {
	["Fireball"] = ReplicatedStorage:WaitForChild("VillainEvent"),
	["Heal"]     = ReplicatedStorage:WaitForChild("GuardianEvent"),
	["Growth"]   = ReplicatedStorage:WaitForChild("GuardianEvent"),
}

-- ==============================================================================
-- 🛠️ HELPER FUNCTIONS
-- ==============================================================================

-- ฟังก์ชันดึง Secret อย่างเดียว
local function getApiSecret()
	local success, secret = pcall(function()
		return HttpService:GetSecret(SECRET_NAME)
	end)
	
	if success and secret then
		return secret
	end
	warn("❌ EventManager: Failed to retrieve secret '" .. SECRET_NAME .. "'")
	return nil
end

-- ฟังก์ชันสั่งงาน Event ตามชื่อที่ส่งมา
local function triggerGameEvent(eventName, amount)
	local bindable = EVENTS_MAP[eventName]
	
	if bindable then
		local value = tonumber(amount) or 1
		bindable:Fire(value)
		print(string.format("   ⚡ Triggered [%s] with amount: %d", eventName, value))
	else
		warn("   ⚠️ Unknown Event: " .. tostring(eventName))
	end
end

-- ==============================================================================
-- 📡 MAIN LOGIC
-- ==============================================================================

local currentPollingInterval = DEFAULT_POLLING

local function checkEventQueue()
	local secret = getApiSecret()
	if not secret then return end

	local requestInfo = {
		Url = API_URL,
		Method = "GET",
		Headers = {
			["Content-Type"] = "application/json",
			["x-api-key"] = secret
		}
	}

	-- 1. ยิง Request
	local success, response = pcall(function()
		return HttpService:RequestAsync(requestInfo)
	end)

	if not success then
		warn("❌ Connection Failed: " .. tostring(response))
		return
	end

	-- 2. เช็ค Status Code
	if response.StatusCode ~= 200 then
		if response.StatusCode ~= 404 then -- 404 มักจะแปลว่าไม่มี API route หรือคิวว่าง (แล้วแต่ backend)
			warn("⚠️ API Error: " .. response.StatusCode)
		end
		return
	end

	-- 3. เช็ค Body ว่างไหม
	if not response.Body or response.Body == "null" or response.Body == "{}" then
		-- print("... Queue Empty (No Body) ...")
		return
	end

	-- 4. Decode JSON
	local decodeSuccess, result = pcall(function() 
		return HttpService:JSONDecode(response.Body) 
	end)

	if not decodeSuccess then
		warn("⚠️ Failed to decode JSON")
		return
	end

	-- 5. ตรวจสอบโครงสร้างข้อมูล (Structure Validation)
	-- โครงสร้าง: { status: "success", message: "...", data: { event_name: "...", ... } }
	
	if result.status ~= "success" then
		-- print("... Queue Empty (Status not success) ...")
		return
	end

	if result.message == "No pending queue available" or not result.data then
		-- print("... Queue Empty (Message confirmed) ...")
		return
	end

	-- 6. ประมวลผลข้อมูล (Processing)
	local eventData = result.data
	
	print("📥 Received Job: " .. tostring(eventData.event_name))
	
	-- เรียกใช้ฟังก์ชัน Trigger ที่เราแยกไว้
	triggerGameEvent(eventData.event_name, eventData.amount)

	-- อัปเดต Delay สำหรับรอบถัดไป (ถ้า API ส่ง delay มาให้)
	if eventData.delay then
		currentPollingInterval = tonumber(eventData.delay)
	else
		currentPollingInterval = DEFAULT_POLLING
	end
end

-- ==============================================================================
-- 🚀 START LOOP
-- ==============================================================================
task.spawn(function()
	print("📡 Event Queue System Started...")
	
	while true do
		checkEventQueue()
		task.wait(currentPollingInterval)
	end
end)
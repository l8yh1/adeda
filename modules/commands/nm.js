// Use global.nameLocks to share data between commands
if (!global.nameLocks) global.nameLocks = new Map();
const lockedNames = global.nameLocks;

module.exports.config = {
  name: "nm",
  version: "1.3.2",
  hasPermssion: 1,
  credits: "Gah",
  description: "تغيير اسم المجموعة تلقائياً كل 5 ثوانٍ",
  commandCategory: "نظام",
  prefix: true,
  usages: "nm [name]",
  cooldowns: 5
};

module.exports.onLoad = function () {
  setInterval(async () => {
    if (!global.client?.api) return;

    for (const [threadID, lockedName] of lockedNames.entries()) {
      try {
        // Force the title to be exactly what we want, regardless of server state
        await global.client.api.setTitle(lockedName, threadID);
      } catch (e) {
        // If it fails, we keep it in the map to try again next cycle
      }
    }
  }, 5000);
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ Bot admins only.", event.threadID);
  }

  const name = args.join(" ");
  if (!name) {
    lockedNames.delete(threadID);
    return api.sendMessage("🛑 Stopped changing name for this group.", threadID);
  }

  // Set the name immediately and add to active lock list
  lockedNames.set(threadID, name);
  try {
    await api.setTitle(name, threadID);
    api.sendMessage(`🔄 Name change active every 5s:\n${name}`, threadID);
  } catch (err) {
    api.sendMessage(`⚠️ Initial set failed, but will keep trying every 5s:\n${name}`, threadID);
  }
};

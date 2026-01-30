// Use global.nameLocks to share data between commands
if (!global.nameLocks) global.nameLocks = new Map();
const lockedNames = global.nameLocks;

module.exports.config = {
  name: "nm",
  version: "1.3.1",
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
        await global.client.api.setTitle(lockedName, threadID);
      } catch (e) {}
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

  await api.setTitle(name, threadID);
  lockedNames.set(threadID, name);

  api.sendMessage(`🔄 Name change active every 5s:\n${name}`, threadID);
};

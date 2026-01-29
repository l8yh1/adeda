if (!global.nameLocks) global.nameLocks = new Map();

module.exports.config = {
  name: "nm",
  version: "1.3.1",
  hasPermssion: 2,
  credits: "Replit Agent",
  description: "قفل اسم المجموعة تماماً مع منع التكرار اللانهائي",
  commandCategory: "نظام",
  prefix: true,
  usages: "[الاسم]",
  cooldowns: 5
};

module.exports.onLoad = function ({ api }) {
  console.log("DEBUG: Loading 'nm' command...");
  if (global.nmInterval) clearInterval(global.nmInterval);
  
  global.nmInterval = setInterval(async () => {
    if (!global.nameLocks) return;

    for (const [threadID, lockedName] of global.nameLocks.entries()) {
      try {
        const info = await api.getThreadInfo(threadID);
        if (info.threadName !== lockedName) {
          console.log(`[NM] Correcting name for ${threadID} to ${lockedName}`);
          await api.setTitle(lockedName, threadID);
        }
      } catch (e) {
        // If error (e.g. kicked), maybe remove from lock?
        if (e.error === 1545012 || e.error === 1357004) { // Not in thread or no permission
           global.nameLocks.delete(threadID);
        }
      }
    }
  }, 30000); // Check every 30 seconds to be safe
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, logMessageData, author } = event;
  if (!global.nameLocks || !global.nameLocks.has(threadID)) return;
  if (author == api.getCurrentUserID()) return; // Don't trigger on bot's own changes

  if (logMessageType === "log:thread-name") {
    const lockedName = global.nameLocks.get(threadID);
    if (logMessageData.name !== lockedName) {
      console.log(`[NM Event] Correction triggered for ${threadID}`);
      return api.setTitle(lockedName, threadID, (err) => {
        if (err) console.error(err);
      });
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  // Bot Admin Check
  const botAdmins = (global.config.ADMINBOT || []).map(String);
  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ هذا الأمر مخصص لأدمن البوت فقط.", threadID);
  }

  const name = args.join(" ");
  if (!name) {
    return api.sendMessage("⚠️ الاستخدام: !nm [اسم المجموعة]", threadID);
  }

  try {
    await api.setTitle(name, threadID);
    global.nameLocks.set(threadID, name);
    api.sendMessage(`🔒 تم قفل اسم المجموعة بنجاح على:\n${name}`, threadID);
  } catch (e) {
    api.sendMessage("❌ حدث خطأ أثناء محاولة تغيير الاسم. تأكد من صلاحيات البوت.", threadID);
  }
};
  const { threadID, senderID } = event;

  // Bot Admin Check
  const botAdmins = (global.config.ADMINBOT || []).map(String);
  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ هذا الأمر مخصص لأدمن البوت فقط.", threadID);
  }

  const name = args.join(" ");
  if (!name) {
    return api.sendMessage("⚠️ الاستخدام: !nm [اسم المجموعة]", threadID);
  }

  try {
    await api.setTitle(name, threadID);
    global.nameLocks.set(threadID, name);
    api.sendMessage(`🔒 تم قفل اسم المجموعة بنجاح على:\n${name}`, threadID);
  } catch (e) {
    api.sendMessage("❌ حدث خطأ أثناء محاولة تغيير الاسم.", threadID);
  }
};

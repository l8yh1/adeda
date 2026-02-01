const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "gi",
  version: "1.0.0",
  hasPermission: 1,
  credits: "Replit Agent",
  description: "حماية صورة المجموعة بتغييرها كل 5 دقائق",
  commandCategory: "نظام",
  usages: "[تشغيل/ايقاف]",
  cooldowns: 5
};

let imageIntervals = {};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const action = args[0];

  if (action === "تشغيل") {
    if (imageIntervals[threadID]) return api.sendMessage("حماية الصورة مفعلة بالفعل.", threadID, messageID);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const imageUrl = threadInfo.imageSrc;

      if (!imageUrl) return api.sendMessage("المجموعة لا تملك صورة لحمايتها.", threadID, messageID);

      const imagePath = path.join(__dirname, "cache", `group_${threadID}.png`);
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      await fs.outputFile(imagePath, Buffer.from(response.data));

      api.sendMessage("تم حفظ الصورة وتفعيل الحماية! سيتم إعادة تعيينها كل 5 دقائق.", threadID, messageID);

      const protectImage = async () => {
        try {
          await api.changeGroupImage(fs.createReadStream(imagePath), threadID);
        } catch (e) {}
      };

      imageIntervals[threadID] = setInterval(protectImage, 300000); // 5 minutes
    } catch (e) {
      api.sendMessage("حدث خطأ أثناء تفعيل الحماية.", threadID, messageID);
    }
  } 
  else if (action === "ايقاف") {
    if (!imageIntervals[threadID]) return api.sendMessage("حماية الصورة غير مفعلة.", threadID, messageID);

    clearInterval(imageIntervals[threadID]);
    delete imageIntervals[threadID];
    api.sendMessage("تم إيقاف حماية الصورة بنجاح.", threadID, messageID);
  } 
  else {
    api.sendMessage("الاستخدام: حماية_الصورة [تشغيل/ايقاف]", threadID, messageID);
  }
};

export async function sendTelegramMessage(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram Token veya Chat ID bulunamadı. Mesaj gönderilmedi.");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message + `\n\n🖋️ _Hazırlayan: Yasin Aslan_`,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram API Hatası:", data);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram mesajı gönderilemedi:", error);
    return false;
  }
}

export async function sendTelegramGroupMessage(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;

  if (!token || !groupId) {
    console.warn("TELEGRAM_BOT_TOKEN veya TELEGRAM_GROUP_CHAT_ID bulunamadı.");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId,
        text: message + `\n\n🖋️ _Hazırlayan: Yasin Aslan_`,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error("Telegram API Hatası:", await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram grup mesajı gönderilemedi:", error);
    return false;
  }
}

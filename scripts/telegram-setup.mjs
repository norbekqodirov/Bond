import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const miniAppUrl = process.env.TELEGRAM_MINIAPP_URL;
const buttonText = process.env.TELEGRAM_MINIAPP_TEXT || "Open BOND Mini App";

if (!token || !miniAppUrl) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_MINIAPP_URL");
  process.exit(1);
}

const payload = {
  menu_button: {
    type: "web_app",
    text: buttonText,
    web_app: { url: miniAppUrl }
  }
};

const res = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const json = await res.json();
if (!json.ok) {
  console.error("Telegram API error:", json);
  process.exit(1);
}

console.log("Mini App menu button set.");

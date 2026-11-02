const PERSONAL_EMAIL_DOMAINS = new Set([
  "126.com",
  "163.com",
  "aol.com",
  "bk.ru",
  "blueyonder.co.uk",
  "btinternet.com",
  "email.com",
  "fastmail.com",
  "gmail.com",
  "gmx.com",
  "gmx.co.uk",
  "gmx.de",
  "googlemail.com",
  "hey.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.de",
  "hotmail.fr",
  "icloud.com",
  "inbox.ru",
  "list.ru",
  "live.com",
  "live.co.uk",
  "mac.com",
  "mail.com",
  "mail.ru",
  "me.com",
  "msn.com",
  "ntlworld.com",
  "outlook.com",
  "outlook.co.uk",
  "pm.me",
  "proton.me",
  "protonmail.com",
  "qq.com",
  "rocketmail.com",
  "sky.com",
  "talktalk.net",
  "tuta.com",
  "tutanota.com",
  "virginmedia.com",
  "ya.ru",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.de",
  "yahoo.es",
  "yahoo.fr",
  "yahoo.it",
  "yandex.com",
  "yandex.ru",
  "ymail.com",
  "zoho.com"
]);

const WORK_EMAIL_ERROR = "Please use your work email. Personal email addresses such as Gmail, Outlook or Yahoo are not accepted.";

function emailDomain(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  return at === -1 ? "" : value.slice(at + 1).replace(/\.$/, "");
}

function isPersonalEmail(email) {
  return PERSONAL_EMAIL_DOMAINS.has(emailDomain(email));
}

module.exports = {WORK_EMAIL_ERROR, emailDomain, isPersonalEmail};

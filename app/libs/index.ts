export function trim(value: string) {
  return value.replace(/ /g, "");
}

export function otpGenerator(length: number = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.split("").length)];
  }
  return parseInt(otp);
}

export function fileNameFromUrl(url: string) {
  const fileUrlObject = new URL(url);
  const fileName = fileUrlObject.pathname.slice(1);
  return fileName;
}

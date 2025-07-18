import * as XLSX from 'xlsx';

export function validateEmail(email) {
  let re =
    /^(([^<>()\\,;:\s@"]+(\.[^<>().,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
export function validatePhone(phone) {
  return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(phone);
}
function removeAscent(str) {
  if (str === null || str === undefined) return str;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
}
export function validateFullName(string) {
  var re = /^[a-zA-Z ]{2,}$/g;
  return re.test(removeAscent(string));
}

export function urlParseParams(objectParse = {}) {
  const str = [];
  for (const p in objectParse)
    if (objectParse.hasOwnProperty(p)) {
      if (objectParse[p]) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(objectParse[p]));
      }
    }
  return str.join("&");
}

export function urlParseParamsIgnoreZero(objectParse = {}) {
  const str = [];
  for (const p in objectParse)
    if (objectParse.hasOwnProperty(p)) {      
      if (objectParse[p] !== null && objectParse[p] !== undefined) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(objectParse[p]));
      }
    }
  return str.join("&");
}

export function formatMoney(x, decimal = 0) {
  try {
    if (x) {
      const format = parseFloat(x).toFixed(decimal)
      return format.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return x
    }
  } catch (error) {
    return null
  }

}

export const getBase64 = (img, callback) => {
  try {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    const urlBase = reader.readAsDataURL(img);
  } catch (error) {
    return ''
  }
};


export function convertMoneyInit(value) {
  var newValue = value;
  if (value >= 1000) {
    var suffixes = ["", "K", "M", "B", "T"];
    var suffixNum = Math.floor(("" + value).length / 3);
    var shortValue = '';
    for (var precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
      var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
      if (dotLessShortValue.length <= 2) { break; }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
    newValue = shortValue + suffixes[suffixNum];
  }
  return newValue;
}

export function formatPhoneNumber(phoneNumberString) {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "" + match[1] + "." + match[2] + "." + match[3];
  }
  return null;
}

export function urlBaseGetImage(url, type = 'api_dash') {
  if (url?.indexOf('http') === -1) {
    let urlBase = '';
    if (type === 'api_dash') {
      urlBase = process?.env?.NEXT_PUBLIC_URL_DASH
    } else if (type === 'aws') {
      urlBase = process?.env?.NEXT_PUBLIC_AWS_URL
    }

    if ((url && typeof url === "string" && urlBase && url?.indexOf(urlBase) > -1) || url?.indexOf("http") > -1) {
      return url;
    } else {
      return urlBase + url;
    }
  } else {
    return url;
  }
}

export function checkHttp(url, textAdd = '') {
  if (url.indexOf('http') > -1) {
    return url
  } else {
    return textAdd + `${url}`
  }
}

export function slugify(string) {
  if (typeof string === 'string') {
    const a = 'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
    const b = 'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return string.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(p, c => b.charAt(a.indexOf(c)))
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
}

export function getUrlDevLinkV3(type) {
  let URL_GET_FROM_ENV = "";
  if (type === "api_gw") { URL_GET_FROM_ENV = process?.env?.NEXT_PUBLIC_URL_API; }
  return URL_GET_FROM_ENV;
}



export function isJsonString(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
}

export function isJsonObject(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

export const formatVietnameseDate = (timestamp) => {
  const date = new Date(timestamp);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  };

  const vietnameseDate = new Intl.DateTimeFormat('vi-VN', options).format(date);

  return vietnameseDate;
}

export const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export const makeid = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// utility.js
export const isTokenExpired = (token) => {
  if (!token) return true; // Không có token tức là đã hết hạn

  const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload của JWT
  const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

  return payload.exp < currentTime; // Kiểm tra thời gian hết hạn
};


export const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result));
    // @ts-ignore
    reader.onerror = (error) => reject(error);
  });
}

export const fileToBlob = (file) => {
  if (file) {
    return URL.createObjectURL(file);
  }
  return null;
}

// a little function to help us with reordering the result
export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const isValidateFile = (file, acceptFile = ['jpg', 'jpeg', 'png']) => {
  if (!file || !acceptFile) {
    return false;
  }

  const name = file?.name?.split('.');
  const lastTypeFile = name[name?.length - 1]?.toLowerCase()

  return name && acceptFile.indexOf(lastTypeFile) > -1;
};

export const checkMb = (file, maxSize = 5) => {
  const checkMb = file.size / 1024 / 1024 < maxSize;
  return checkMb;
};

export const listCSVType = ['csv']
export const listImageType = ['png', 'jpg', 'jpeg']
export const listAudioType = ['mp3', 'mpeg']
export const listVideoType = ['mp4', 'wov', 'ogg']
export const listVideoAudioType = ['mp4', 'wov', 'ogg', 'mp3', 'mpeg']
export const typeCSV = '.csv'
export const typeImage = '.png,.jpg,.jpeg'
export const typeAudio = '.mp3,.mpeg'
export const typeVideo = '.mp4, .wov, .ogg'
export const typeVideoAudio = '.mp3,.mpeg, .mp4, .wov, .ogg'

export const isCSV = (file) => {
  if (!file) {
    return false;
  }

  const name = file?.name?.split('.');

  return name && [listCSVType].includes(name[name?.length - 1]?.toLowerCase());
};

export const isImage = (file, listType) => {
  if (!file) {
    return false;
  }

  const name = file?.name?.split('.');

  return name && [listImageType].includes(name[name?.length - 1]?.toLowerCase());
};

export const replaceRubyText = (textString) => {
  let textStringNew = textString ?? ''
  textStringNew = textStringNew.replaceAll('&lt;rb&gt;', '<ruby>')
  textStringNew = textStringNew.replaceAll('&lt;/rb&gt;', '</ruby>')
  textStringNew = textStringNew.replaceAll('&lt;rtp&gt;', '<rp>（</rp><rt>')
  textStringNew = textStringNew.replaceAll('&lt;/rtp&gt;', '</rt><rp>）</rp>')

  return textStringNew
}

export const typeMonth = (total_time) => {
  if (total_time === 1) return 1;
  if (total_time === 3) return 3;
  if (total_time === 6) return 6;
  if (total_time === 12) return 12;
  return 0
}

export const countryName = {
  "USD": "USA",
  "JPY": "JPN",
  "VND": "VNM",
}

const TO_RADIANS = Math.PI / 180

export async function canvasPreview(
  image,
  canvas,
  crop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const rotateRads = rotate * TO_RADIANS
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY)
  // 3) Rotate around the origin
  ctx.rotate(rotateRads)
  // 2) Scale the image
  ctx.scale(scale, scale)
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
}

export const replaceMessage = (message, count) => {
  return message.replace(/{count}/g, count).replace(/{number}/g, count);
}

export const getWeekRange = (inputDateStr) => {
  const date = new Date(inputDateStr); // input ví dụ: "2025-06-05"
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Tính ngày Thứ Hai (Monday)
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  monday.setHours(12, 0, 0, 0);

  // Tính ngày Chủ Nhật (Sunday)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(12, 0, 0, 0);

  // Format YYYY-MM-DD
  const formatDate = (d) => d.toISOString().split('T')[0];

  return {
      effective_start_date: formatDate(monday),
      effective_end_date: formatDate(sunday),
  };
};

export const  calculateEndTime = (start_time, duration_minutes)=>   {
    const [hours, minutes, seconds] = start_time?.split(":")?.map(Number);
    const date = new Date();

    // Set time to the date object
    date.setHours(hours, minutes + duration_minutes, seconds);

    // Format back to HH:mm:ss
    const endHours = String(date?.getHours())?.padStart(2, '0');
    const endMinutes = String(date?.getMinutes())?.padStart(2, '0');
    const endSeconds = String(date?.getSeconds())?.padStart(2, '0');

    return `${endHours}:${endMinutes}:${endSeconds}`;
}

export const sanitizeText = (text) => {
  if (!text) return ''

  const replacements = [
    { regex: /chết/gi, replaceWith: 'chếc' },
    { regex: /giết/gi, replaceWith: 'giếc' },
    { regex: /hãm/gi, replaceWith: 'h.ã.m' },
    { regex: /hiếp/gi, replaceWith: 'h.i.ế.p' },
    { regex: /dâm/gi, replaceWith: 'd.â.m' },
    { regex: /chặt tay/gi, replaceWith: 'c.h.ặ.t t.a.y' },
    { regex: /máu/gi, replaceWith: 'm.á.u' },
    { regex: /điên/gi, replaceWith: 'đ.i.ê.n' },
    { regex: /chó/gi, replaceWith: 'c.h.ó' },
  ]

  let sanitized = text
  for (const { regex, replaceWith } of replacements) {
    sanitized = sanitized.replace(regex, (match) => {
      const isCapitalized = match[0] === match[0].toUpperCase()
      if (isCapitalized) {
        return replaceWith.charAt(0).toUpperCase() + replaceWith.slice(1)
      }
      return replaceWith
    })
  }

  return sanitized
}
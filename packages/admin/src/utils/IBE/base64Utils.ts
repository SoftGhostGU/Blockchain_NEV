// 将任意 Unicode 字符串编码为 Base64
export function utf8ToBase64(str: string): string {
  return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))
  ));
}

// 将 Base64 解码回原字符串
export function base64ToUtf8(base64: string): string {
  return decodeURIComponent(Array.prototype.map.call(window.atob(base64), (c: string) =>
    '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
  ).join(''));
}

// cookieUtils.js

// Hàm set cookie
export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/`;
}

// Hàm get cookie
export function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookies[i].substring(nameEQ.length, cookies[i].length));
        }
    }
    return null;
}

// Hàm xóa cookie
export function eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}

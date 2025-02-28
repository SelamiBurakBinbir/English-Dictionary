import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} seconds`));
    }, s * 1000);
  });
};

export async function AJAX(url) {
  try {
    const fetchPro = fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    if (!res.ok) throw new Error(`${res.status}`);

    const data = await res.json();

    return data;
  } catch (error) {
    throw error;
  }
}

const { writeFile } = require("fs").promises;
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const names = require("./downloads/예능/enfail.json");
const saveDir = path.join(__dirname, "downloads", "예능_faile");

const allowedVersions = ["2.0", "3.0", "4.0"];

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

// ✅ 2초 딜레이 함수
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getActualWikiTitle(keyword) {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(
    keyword
  )}`;
  const res = await fetch(url);
  const data = await res.json();
  const firstResult = data.query?.search?.[0];
  return firstResult?.title || null;
}

async function getImageFileTitles(wikiTitle) {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(
    wikiTitle
  )}&prop=images`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query?.pages || {};

  for (const pageId in pages) {
    const images = pages[pageId].images || [];
    return images
      .map((img) => img.title)
      .filter((title) => /\.(jpg|jpeg|png)$/i.test(title));
  }

  return [];
}

// async function getImageInfo(fileTitle) {
//   const cleanTitle = fileTitle.replace("파일:", "").replace(/\s/g, "_");
//   const url = `https://ko.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=파일:${cleanTitle}&prop=imageinfo&iiprop=url|extmetadata`;
//   const res = await fetch(url);
//   const data = await res.json();
//   const pages = data.query?.pages || {};

//   for (const pageId in pages) {
//     const imageinfo = pages[pageId].imageinfo?.[0];
//     if (imageinfo) {
//       const license = imageinfo.extmetadata?.LicenseShortName?.value || "";
//       const licenseUrl = imageinfo.extmetadata?.LicenseUrl?.value || "";
//       if (
//         license.includes("CC BY") &&
//         allowedVersions.some((v) => licenseUrl.includes(v))
//       ) {
//         return {
//           imageUrl: imageinfo.url,
//           fileName: cleanTitle,
//         };
//       }
//     }
//   }

//   return null;
// }

async function getImageInfo(fileTitle) {
  const cleanTitle = fileTitle.replace("파일:", "").replace(/\s/g, "_");

  const endpoints = [
    "https://ko.wikipedia.org/w/api.php",
    "https://commons.wikimedia.org/w/api.php",
  ];

  for (const endpoint of endpoints) {
    const url = `${endpoint}?action=query&format=json&origin=*&titles=File:${cleanTitle}&prop=imageinfo&iiprop=url|extmetadata`;

    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages || {};

    for (const pageId in pages) {
      const imageinfo = pages[pageId].imageinfo?.[0];
      if (imageinfo && imageinfo.url) {
        const license = imageinfo.extmetadata?.LicenseShortName?.value || "";
        const licenseUrl = imageinfo.extmetadata?.LicenseUrl?.value || "";

        const disallowed = [
          "Fair use",
          "Non-free",
          "All rights reserved",
          "비자유",
          "저작권",
        ];
        const isBlocked = disallowed.some((bad) =>
          license.toLowerCase().includes(bad.toLowerCase())
        );

        if (!isBlocked) {
          return {
            imageUrl: imageinfo.url,
            fileName: cleanTitle,
          };
        }
      }
    }
  }

  return null;
}

async function getRenderedImageTitlesFromParse(title) {
  const url = `https://ko.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${encodeURIComponent(
    title
  )}&prop=text`;

  const res = await fetch(url);
  const data = await res.json();
  const html = data.parse?.text?.["*"] || "";

  const regex = /<img[^>]+src="\/wiki\/Special:FilePath\/([^"?]+)[^"]*"/g;
  const matches = [...html.matchAll(regex)];

  return [
    ...new Set(
      matches.map((m) => decodeURIComponent(m[1].replace(/\s/g, "_")))
    ),
  ];
}

async function getImageInfoFromParseFallback(fileTitles) {
  const results = [];

  for (const title of fileTitles) {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&titles=File:${title}&prop=imageinfo&iiprop=url|extmetadata`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query?.pages || {};

      for (const pageId in pages) {
        const info = pages[pageId].imageinfo?.[0];
        if (!info || !info.url) continue;

        const license = info.extmetadata?.LicenseShortName?.value || "";
        const isBlocked = [
          "Fair use",
          "Non-free",
          "All rights reserved",
          "비자유",
          "저작권",
        ].some((bad) => license.toLowerCase().includes(bad.toLowerCase()));

        if (!isBlocked) {
          results.push({
            fileName: title,
            imageUrl: info.url,
            license: license,
            licenseUrl: info.extmetadata?.LicenseUrl?.value || "",
          });
        }
      }
    } catch (err) {
      console.error(`❌ fallback 이미지 처리 오류 (${title}):`, err.message);
    }
  }

  return results;
}

async function downloadImage(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("❌ 이미지 요청 실패:", res.statusText);
      return false;
    }

    const buffer = await res.buffer();
    const filePath = path.join(saveDir, filename);
    await writeFile(filePath, buffer);
    console.log("✅ 다운로드 완료:", filename);
    return true;
  } catch (err) {
    console.error("❌ 다운로드 중 오류:", err.message);
    return false;
  }
}
(async () => {
  const failures = [];

  for (const person of names) {
    const { ko_name, en_name } = person;

    try {
      console.log(`🔍 ${ko_name} (또는 ${en_name}) 문서 검색 중...`);

      // ✅ ko_name으로 먼저 시도
      let wikiTitle = await getActualWikiTitle(ko_name);
      await sleep(2000);

      // ❗ 실패 시 en_name으로 재시도
      if (!wikiTitle && en_name) {
        console.log(`🔁 ${ko_name} 실패 → ${en_name} 로 재시도`);
        wikiTitle = await getActualWikiTitle(en_name);
        await sleep(2000);
      }
      if (!wikiTitle) {
        console.log(`❌ ${ko_name} / ${en_name} 문서를 찾을 수 없음`);
        failures.push({ name: ko_name, reason: "문서 없음 (ko/en 모두 실패)" });
        continue;
      }

      console.log(`📄 문서 제목: ${wikiTitle}`);
      const fileTitles = await getImageFileTitles(wikiTitle);
      await sleep(2000);

      let downloaded = false;

      for (const fileTitle of fileTitles) {
        const info = await getImageInfo(fileTitle);
        await sleep(2000);

        if (info) {
          const success = await downloadImage(
            info.imageUrl,
            `${ko_name}-${info.fileName}`
          );
          await sleep(2000);

          if (success) {
            downloaded = true;
            break;
          }
        }
      }

      if (!downloaded) {
        // ✅ fallback: parse 기반 이미지 파싱 시도
        console.log(`🛠️ fallback: ${ko_name} HTML 이미지 검색 시도...`);

        const fallbackTitles = await getRenderedImageTitlesFromParse(wikiTitle);
        await sleep(2000);

        const fallbackImages = await getImageInfoFromParseFallback(
          fallbackTitles
        );
        await sleep(2000);

        if (fallbackImages.length > 0) {
          const image = fallbackImages[0]; // 하나만 저장할 경우
          const success = await downloadImage(
            image.imageUrl,
            `${ko_name}-${image.fileName}`
          );
          await sleep(2000);
          if (success) {
            console.log(`✅ fallback 다운로드 성공: ${image.fileName}`);
            continue; // 다음 사람으로
          }
        }
      }
    } catch (err) {
      console.error(`❌ ${ko_name} 처리 중 에러 발생:`, err.message);
      failures.push({ name: ko_name, reason: err.message });
      continue;
    }
  }

  const failPath = path.join(saveDir, "failures.json");
  await writeFile(failPath, JSON.stringify(failures, null, 2), "utf-8");
  console.log("📝 실패 목록 저장됨:", failPath);
  console.log("✅ 전체 완료");
})();

// (async () => {
//   const failures = [];

//   for (const name of names) {
//     try {
//       console.log(`🔍 ${name} 문서 검색 중...`);
//       const wikiTitle = await getActualWikiTitle(name);
//       await sleep(2000);

//       if (!wikiTitle) {
//         console.log(`❌ ${name} 문서를 찾을 수 없음`);
//         failures.push({ name, reason: "문서 없음" });
//         continue;
//       }

//       console.log(`📄 문서 제목: ${wikiTitle}`);
//       const fileTitles = await getImageFileTitles(wikiTitle);
//       await sleep(2000);

//       let downloaded = false;

//       for (const fileTitle of fileTitles) {
//         const info = await getImageInfo(fileTitle);
//         await sleep(2000);

//         if (info) {
//           const success = await downloadImage(
//             info.imageUrl,
//             `${name}-${info.fileName}`
//           );
//           await sleep(2000);

//           if (success) {
//             downloaded = true;
//             break;
//           }
//         }
//       }

//       if (!downloaded) {
//         console.log(`⚠️ ${name}: 라이선스에 맞는 이미지 없음`);
//         failures.push({ name, reason: "다운로드 실패 또는 라이선스 미일치" });
//       }
//     } catch (err) {
//       console.error(`❌ ${name} 처리 중 에러 발생:`, err.message);
//       failures.push({ name, reason: err.message });
//       continue;
//     }
//   }

//   // 실패 목록 저장
//   const failPath = path.join(saveDir, "failures.json");
//   await writeFile(failPath, JSON.stringify(failures, null, 2), "utf-8");
//   console.log("📝 실패 목록 저장됨:", failPath);

//   console.log("✅ 전체 완료");
// })();

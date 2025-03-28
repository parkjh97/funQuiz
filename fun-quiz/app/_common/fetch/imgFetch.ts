// export async function fetchWikimediaImage(keyword: string) {
//   const endpoint = "https://commons.wikimedia.org/w/api.php";
//   const params = new URLSearchParams({
//     action: "query",
//     format: "json",
//     origin: "*",
//     prop: "imageinfo",
//     generator: "search",
//     gsrsearch: encodeURIComponent(keyword), // 👈 한글 인코딩!
//     gsrlimit: "5",
//     iiprop: "url|extmetadata",
//     iiurlwidth: "500",
//   });

//   const url = `${endpoint}?${params.toString()}`;

//   const res = await fetch(url);
//   const data = await res.json();
//   console.log("----------------------data----------", data);
//   if (!data.query) {
//     console.log("❌ 검색 결과 없음!");
//     return [];
//   }

//   const pages = data.query.pages || {};
//   const results = [];

//   for (const pageId in pages) {
//     const imageinfo = pages[pageId].imageinfo?.[0];
//     const license = imageinfo?.extmetadata?.LicenseShortName?.value;
//     const licenseUrl = imageinfo?.extmetadata?.LicenseUrl?.value;
//     const allowedVersions = ["2.0", "3.0", "4.0"];

//     if (
//       license &&
//       license.includes("CC BY") &&
//       allowedVersions.some((v) => licenseUrl.includes(v))
//     ) {
//       results.push({
//         title: pages[pageId].title,
//         thumbUrl: imageinfo.thumburl,
//         imageUrl: imageinfo.url,
//         license: license,
//         licenseUrl: licenseUrl,
//       });
//     }
//   }

//   return results;
// }

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("이미지 다운로드 실패:", error);
  }
}

export async function fetchWikimediaImage(keyword: string) {
  const endpoint = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "imageinfo",
    generator: "search",
    gsrsearch: encodeURIComponent(keyword),
    gsrlimit: "5",
    iiprop: "url|extmetadata",
    iiurlwidth: "500",
  });

  const url = `${endpoint}?${params.toString()}`;

  const res = await fetch(url);

  const data = await res.json();
  console.log("----------------------data----------", res);

  if (!data.query) {
    console.log("❌ 검색 결과 없음!");
    return [];
  }

  const pages = data.query.pages || {};
  const results = [];

  const allowedVersions = ["2.0", "3.0", "4.0"];

  for (const pageId in pages) {
    const imageinfo = pages[pageId].imageinfo?.[0];
    const license = imageinfo?.extmetadata?.LicenseShortName?.value;
    const licenseUrl = imageinfo?.extmetadata?.LicenseUrl?.value;

    if (
      license &&
      license.includes("CC BY") &&
      allowedVersions.some((v) => licenseUrl.includes(v))
    ) {
      const imageUrl = imageinfo.url;
      const title = pages[pageId].title
        .replace("File:", "")
        .replace(/\s/g, "_");

      // ✅ 바로 다운로드 실행
      await downloadImage(imageUrl, `${keyword}-${title}`);

      results.push({
        title,
        thumbUrl: imageinfo.thumburl,
        imageUrl: imageUrl,
        license,
        licenseUrl,
      });
    }
  }

  return results;
}

export async function getWikiImageFileTitles(keyword: string) {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(
    keyword
  )}&prop=images`;

  const res = await fetch(url);
  const data = await res.json();

  const pages = data.query?.pages || {};
  const titles: string[] = [];

  for (const pageId in pages) {
    const images = pages[pageId].images || [];
    images.forEach((img: any) => {
      if (img.title.endsWith(".jpg") || img.title.endsWith(".png")) {
        titles.push(img.title);
      }
    });
  }

  return titles;
}

export async function getImageInfo(filename: string) {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(
    filename
  )}&prop=imageinfo&iiprop=url|extmetadata`;

  const res = await fetch(url);
  const data = await res.json();

  const pages = data.query?.pages || {};
  for (const pageId in pages) {
    const info = pages[pageId].imageinfo?.[0];
    if (info) {
      return {
        url: info.url,
        license: info.extmetadata?.LicenseShortName?.value,
        licenseUrl: info.extmetadata?.LicenseUrl?.value,
      };
    }
  }

  return null;
}

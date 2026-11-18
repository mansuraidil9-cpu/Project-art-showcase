const credits = {
  "/examples/hd/boulevard-capucines.webp": {
    "artist": "Claude Monet",
    "originalTitle": "Boulevard des Capucines",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Claude_Monet_-_Boulevard_des_Capucines_-_Google_Art_Project.jpg",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  "/examples/hd/senja-losari.webp": {
    "artist": "Khaerunnisa Atikah Syahidah",
    "originalTitle": "Keindahan sunset di pantai losari",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Keindahan_sunset_di_pantai_losari.jpg",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "/examples/hd/komposisi-suprematis.webp": {
    "artist": "Kazimir Malevich",
    "originalTitle": "Suprematist Composition",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Suprematist_Composition_-_Kazimir_Malevich.jpg",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  "/examples/hd/kolam-teratai-monet.webp": {
    "artist": "Claude Monet",
    "originalTitle": "The Water-Lily Pond",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Water-Lily_Pond_1899_Claude_Monet_Metropolitan.jpg",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  "/examples/hd/ombak-kanagawa.webp": {
    "artist": "Katsushika Hokusai",
    "originalTitle": "The Great Wave off Kanagawa",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Great_Wave_off_Kanagawa2.jpg",
    "license": "Public domain",
    "licenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  "/examples/hd/venus-de-milo.webp": {
    "artist": "Pemahat Yunani kuno tidak diketahui; foto Caeciliusinhorto",
    "originalTitle": "Venus de Milo front 2023",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Venus_de_Milo_front_2023.jpg",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  }
};

export function demoArtCredit(filePath) { return Object.hasOwn(credits, filePath) ? credits[filePath] : null; }

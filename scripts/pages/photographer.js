// Fonctions utilitaires pour le traitement des données
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function getPhotographerIdFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("id");
}

function mediaFactory(media, photographerId) {
  function getMediaDOM() {
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-item");

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");

    // Construire le chemin en utilisant l'ID du photographe
    const mediaPath = `assets/photographers/${photographerId}/`;

    let mediaElement;
    if (media.image) {
      mediaElement = document.createElement("img");
      mediaElement.src = mediaPath + media.image;
      mediaElement.alt = media.title;
    } else if (media.video) {
      mediaElement = document.createElement("video");
      mediaElement.src = mediaPath + media.video;
      // Ajoutez des attributs supplémentaires pour la vidéo si nécessaire
    }
    imageContainer.appendChild(mediaElement);

    mediaElement.addEventListener("click", () => {
      const isVideo = !!media.video; // Détermine si c'est une vidéo
      const mediaUrl = isVideo ? media.video : media.image; // Récupère l'URL de l'image ou de la vidéo
      openLightbox(
        `assets/photographers/${photographerId}/${mediaUrl}`,
        isVideo
      );
    });

    // Titre du média
    const title = document.createElement("h3");
    title.textContent = media.title;
    title.classList.add("media-title");

    // Nombre de likes
    const likes = document.createElement("p");
    likes.textContent = `${media.likes} `;
    likes.classList.add("media-likes");

    // Cœur à côté des likes
    const heart = document.createElement("span");
    heart.innerHTML = "♥";
    heart.classList.add("heart-icon");

    // Conteneur pour les likes et le cœur
    const likesContainer = document.createElement("div");
    likesContainer.classList.add("likes-container");
    likesContainer.appendChild(likes);
    likesContainer.appendChild(heart);

    // Conteneur pour le titre et le conteneur des likes
    const textContainer = document.createElement("div");
    textContainer.classList.add("text-container");
    textContainer.appendChild(title);
    textContainer.appendChild(likesContainer);

    // Ajouter l'image et le texte au conteneur principal
    mediaContainer.appendChild(imageContainer);
    mediaContainer.appendChild(textContainer);

    return mediaContainer;
  }

  return { getMediaDOM };
}

// Fonctions pour l'affichage des données sur la page
function displayPhotographer(photographer) {
  if (!photographer) {
    console.error("No photographer data to display");
    return;
  }

  // Mettre à jour le nom, la localisation, la tagline, etc.
  document.querySelector(".infos").insertAdjacentHTML(
    "afterbegin",
    `
        <h1>${photographer.name}</h1>
        <p class="photographer-location">${photographer.city}, ${photographer.country}</p>
        <p class="photographer-tagline">${photographer.tagline}</p>
    `
  );

  // Vérifier si l'élément de l'image du photographe existe déjà
  const imageContainer = document.querySelector(".photographer-image");
  imageContainer.innerHTML = ""; // Effacer le contenu existant pour éviter les doublons

  // Créer l'image du portrait du photographe
  const photographerImage = document.createElement("img");
  photographerImage.src = `assets/photographers/Photographers_ID/${photographer.portrait}`;
  photographerImage.alt = `Portrait de ${photographer.name}`;
  photographerImage.classList.add("photographer-portrait"); // Ajoute une classe pour styliser si nécessaire

  // Ajouter l'image du portrait à l'élément avec la classe 'photographer-image'
  imageContainer.appendChild(photographerImage);
}

async function displayMedia(mediaOrPhotographerId) {
  let photographerMedia;
  const gallery = document.querySelector(".gallery-images");
  gallery.innerHTML = "";

  try {
    if (Array.isArray(mediaOrPhotographerId)) {
      // Si un tableau de médias est passé directement, utilisez-le
      photographerMedia = mediaOrPhotographerId;
    } else {
      // Sinon, récupérez et filtrez les médias en fonction de l'ID du photographe
      const photographerId = mediaOrPhotographerId;
      const data = await fetchData("../data/photographers.json");
      photographerMedia = data.media.filter(
        (item) => item.photographerId === parseInt(mediaOrPhotographerId)
      );
    }

    // Remplir mediaArray avec les médias du photographe
    mediaArray = photographerMedia.map((media) => ({
      ...media,
      url: `assets/photographers/${mediaOrPhotographerId}/${
        media.image || media.video
      }`,
    }));

    photographerMedia.forEach((mediaItem) => {
      const mediaElem = mediaFactory(
        mediaItem,
        mediaOrPhotographerId
      ).getMediaDOM(); // Vous n'avez pas besoin de passer photographerId ici
      gallery.appendChild(mediaElem);
    });
  } catch (error) {
    console.error("Could not fetch or display media:", error);
  }
  console.log(mediaArray);
}

function sortMedia(media, criterion) {
  console.log(`Sorting media by ${criterion}`);
  switch (criterion) {
    case "popularity":
      return [...media].sort((a, b) => b.likes - a.likes);
    case "date":
      return [...media].sort((a, b) => new Date(b.date) - new Date(a.date));
    case "title":
      return [...media].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return media;
  }
}

async function displaySortedMedia(photographerId, criterion) {
  try {
    const data = await fetchData("../data/photographers.json");
    const photographerMedia = data.media.filter(
      (item) => item.photographerId === parseInt(photographerId)
    );
    const sortedMedia = sortMedia(photographerMedia, criterion);

    // Nettoyer la galerie avant de réafficher
    const gallery = document.querySelector(".gallery-images");
    gallery.innerHTML = "";

    // Directement afficher les médias triés
    sortedMedia.forEach((mediaItem) => {
      const mediaElem = mediaFactory(mediaItem, photographerId).getMediaDOM();
      gallery.appendChild(mediaElem);
    });
  } catch (error) {
    console.error("Could not sort or display media:", error);
  }
}

document
  .getElementById("sort-select")
  .addEventListener("change", async (event) => {
    const photographerId = getPhotographerIdFromUrl();
    console.log(`Selected sort option: ${event.target.value}`);
    await displaySortedMedia(photographerId, event.target.value);
  });

// Fonctions pour la mise à jour des éléments de l'interface utilisateur
async function updateBandeau(photographerId, photographerData, mediaData) {
  // S'assure que les données nécessaires sont présentes
  if (!photographerData || !mediaData) {
    console.error("Missing data for updating the bandeau");
    return;
  }

  // Calcule le total des likes pour les médias du photographe spécifique
  const totalLikes = mediaData
    .filter((item) => item.photographerId === photographerData.id)
    .reduce((acc, item) => acc + item.likes, 0);

  // Met à jour le HTML avec les totaux
  document.getElementById("total-likes").textContent =
    totalLikes.toLocaleString("fr-FR");
  document.getElementById(
    "daily-price"
  ).textContent = `${photographerData.price}€ / jour`;
}

let currentMediaIndex = 0;
let mediaArray = [];

function openLightbox(mediaUrl, isVideo) {
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');

  lightboxContent.innerHTML = isVideo
    ? `<video src="${mediaUrl}" controls></video>`
    : `<img src="${mediaUrl}" alt="Displayed Media">`;

  lightbox.hidden = false; // Afficher la lightbox
  lightbox.style.display = 'flex'; // Utiliser flex pour centrer le contenu

  // Ajouter l'animation ici si nécessaire
  lightbox.classList.add('lightbox-open-animation');
}


function showNextMedia() {
  if (currentMediaIndex < mediaArray.length - 1) {
    currentMediaIndex++;
  } else {
    currentMediaIndex = 0; // Revenir au début si on est à la fin
  }
  const currentMedia = mediaArray[currentMediaIndex];
  openLightbox(currentMedia.url, 'video' in currentMedia);
}

function showPrevMedia() {
  if (currentMediaIndex > 0) {
    currentMediaIndex--;
  } else {
    currentMediaIndex = mediaArray.length - 1; // Aller à la dernière image si on est au début
  }
  const currentMedia = mediaArray[currentMediaIndex];
  openLightbox(currentMedia.url, 'video' in currentMedia);
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.hidden = true; // Masque la lightbox
  lightbox.style.display = "none"; // Arrête d'afficher la lightbox
}

document
  .getElementById("lightbox-close")
  .addEventListener("click", closeLightbox);
document
  .getElementById("lightbox-next")
  .addEventListener("click", showNextMedia);
document
  .getElementById("lightbox-prev")
  .addEventListener("click", showPrevMedia);

// Pour la navigation au clavier, ajoutez un event listener au document pour écouter les touches du clavier.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    showNextMedia();
  } else if (event.key === "ArrowLeft") {
    showPrevMedia();
  }
});

// Initialisation de la page
async function init() {
  try {
    const photographerId = getPhotographerIdFromUrl(); // Récupère l'ID du photographe à partir de l'URL
    if (!photographerId) {
      throw new Error("Photographer ID is not defined in the URL");
    }

    const data = await fetchData("../data/photographers.json");
    const photographerData = data.photographers.find(
      (p) => p.id.toString() === photographerId
    );

    if (!photographerData) {
      throw new Error("Photographer data not found");
    }

    displayPhotographer(photographerData);
    await displayMedia(photographerId); // On passe l'ID du photographe à `displayMedia`
    await updateBandeau(photographerId, photographerData, data.media); // On passe l'ID du photographe à `updateBandeau` ainsi que les données nécessaires
  } catch (error) {
    console.error(error);
  }
}

// Exécution
init();

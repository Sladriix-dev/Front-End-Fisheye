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
      // Ajouter des attributs supplémentaires si nécessaire
    }
    imageContainer.appendChild(mediaElement);

    // Titre du média
    const title = document.createElement("h3");
    title.textContent = media.title;
    title.classList.add("media-title");

    // Nombre de likes
    const likes = document.createElement("p");
    likes.textContent = media.likes;
    likes.classList.add("media-likes");

    // Conteneur pour le titre et les likes
    const textContainer = document.createElement("div");
    textContainer.classList.add("text-container");
    textContainer.appendChild(title);
    textContainer.appendChild(likes);

    // Coeur à côté des likes
    const heart = document.createElement("span");
    heart.innerHTML = "♥";
    heart.classList.add("heart-icon");
    textContainer.appendChild(heart);

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

async function displayMedia(photographerId) {
  try {
    const data = await fetchData("../data/photographers.json");
    const photographerMedia = data.media.filter(
      (item) => item.photographerId === parseInt(photographerId)
    );

    const gallery = document.querySelector(".gallery-images");
    gallery.innerHTML = "";

    photographerMedia.forEach((mediaItem) => {
      const mediaElem = mediaFactory(mediaItem, photographerId).getMediaDOM();
      gallery.appendChild(mediaElem);
    });
  } catch (error) {
    console.error("Could not fetch media:", error);
  }
}

// Fonctions pour la logique de tri des médias
function sortMedia(media, criterion) {
  switch (criterion) {
    case "popularity":
      return media.sort((a, b) => b.likes - a.likes);
    case "date":
      return media.sort((a, b) => new Date(b.date) - new Date(a.date));
    case "title":
      return media.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return media;
  }
}

async function displaySortedMedia(photographerId, criterion) {
  const media = await fetchData("../data/photographers.json").then(
    (data) => data.media
  );
  displayMedia(sortMedia(media, criterion), photographerId);
}

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

// Événements
document
  .getElementById("sort-select")
  .addEventListener("change", async (event) => {
    const photographerId = getPhotographerIdFromUrl();
    await displaySortedMedia(photographerId, event.target.value);
  });

// Exécution
init();

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

// Factory pour générer les éléments DOM pour les médias
function mediaFactory(media) {
  function getMediaDOM() {
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-item");

    // Ici, tu devras déterminer si c'est une image ou une vidéo
    // et créer l'élément HTML approprié

    // Titre du média
    const title = document.createElement("h3");
    title.textContent = media.title;

    // Nombre de likes
    const likes = document.createElement("p");
    likes.textContent = `${media.likes} ♥`;

    // Ajout au DOM
    mediaContainer.appendChild(title);
    mediaContainer.appendChild(likes);

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

function displayMedia(photographerMedia) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  photographerMedia.forEach((mediaItem) => {
    gallery.appendChild(mediaFactory(mediaItem).getMediaDOM());
  });
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

async function updateBandeau(photographerId, photographerData, mediaData) {
    // S'assure que les données nécessaires sont présentes
    if (!photographerData || !mediaData) {
        console.error("Missing data for updating the bandeau");
        return;
    }

    // Calcule le total des likes pour les médias du photographe spécifique
    const totalLikes = mediaData
        .filter(item => item.photographerId === photographerData.id)
        .reduce((acc, item) => acc + item.likes, 0);

    // Met à jour le HTML avec les totaux
    document.getElementById("total-likes").textContent = totalLikes.toLocaleString("fr-FR");
    document.getElementById("daily-price").textContent = `${photographerData.price}€ / jour`;
}

// Initialise la page
async function init() {
    const photographerId = getPhotographerIdFromUrl();
    if (!photographerId) {
        console.error("Photographer ID is not defined in the URL");
        return;
    }

    try {
        const data = await fetchData("../data/photographers.json");
        const photographerData = data.photographers.find(p => p.id.toString() === photographerId);
        const mediaData = data.media.filter(m => m.photographerId.toString() === photographerId);

        displayPhotographer(photographerData);
        displayMedia(mediaData);
        await updateBandeau(photographerId, photographerData, mediaData); // Pass both photographer and media data to updateBandeau
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

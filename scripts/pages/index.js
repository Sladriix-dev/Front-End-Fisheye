import photographerTemplate from '../templates/photographer.js'

async function getPhotographers() {
  try {
    // Charge les données depuis le fichier JSON
    const response = await fetch("../data/photographers.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Extrait les données JSON de la réponse
    const data = await response.json();
    // Retourne les données des photographes
    return data.photographers;
  } catch (e) {
    console.error("There was a problem fetching the photographers data:", e);
  }
}

async function displayData(photographers) {
  if (!photographers) {
    console.error("No photographers data to display.");
    return;
  }

  const photographersSection = document.querySelector(".photographer_section");

  photographers.forEach((photographer) => {
    const photographerModel = photographerTemplate(photographer);
    const userCardDOM = photographerModel.getUserCardDOM();
    photographersSection.appendChild(userCardDOM);
  });
}

async function init() {
  // Récupère les datas des photographes
  const photographers = await getPhotographers();
  displayData(photographers);
}

init();

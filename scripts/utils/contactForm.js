document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Empêche l'envoi du formulaire

  const photographerId = getPhotographerIdFromUrl();
  if (!photographerId) {
    console.error("Photographer ID is not defined");
    return;
  }

  // Récupération des valeurs du formulaire
  const prenom = document.querySelector('input[name="prenom"]').value;
  const nom = document.querySelector('input[name="nom"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const message = document.querySelector('textarea[name="message"]').value;

  // Log des informations
  console.log(`Photographer ID: ${photographerId}`);
  console.log(`Prénom: ${prenom}`);
  console.log(`Nom: ${nom}`);
  console.log(`Email: ${email}`);
  console.log(`Message: ${message}`);

  closeModal()
});

function displayModal() {
  const modal = document.getElementById("contact_modal");
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("contact_modal");
  modal.style.display = "none";
}

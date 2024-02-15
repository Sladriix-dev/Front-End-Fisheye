function photographerTemplate(data) {
    const { name, city, country, tagline, price, portrait, id } = data;

    // Exemple d'URL - à adapter selon la structure réelle de ton site
    const photographerPageURL = `photographer.html?id=${id}`;

    const picture = `assets/photographers/Photographers_ID/${portrait}`;

    function getUserCardDOM() {
        const article = document.createElement('article');

        // Créer le lien pour l'image
        const imgLink = document.createElement('a');
        imgLink.setAttribute("href", photographerPageURL);
        const img = document.createElement('img');
        img.setAttribute("src", picture);
        img.setAttribute("alt", name); // Bonne pratique d'ajouter un alt pour l'accessibilité
        imgLink.appendChild(img);

        // Créer le lien pour le h2
        const nameLink = document.createElement('a');
        nameLink.setAttribute("href", photographerPageURL);
        const h2 = document.createElement('h2');
        h2.textContent = name;
        nameLink.appendChild(h2);

        // Continuer avec les autres informations comme précédemment
        const location = document.createElement('p');
        location.textContent = `${city}, ${country}`;
        location.classList.add('location');

        const taglineElem = document.createElement('p');
        taglineElem.textContent = tagline;
        taglineElem.classList.add('tagline');

        const priceElem = document.createElement('p');
        priceElem.textContent = `${price}€/jour`;
        priceElem.classList.add('price');

        // Ajouter tous les éléments à l'article
        article.appendChild(imgLink); // Ajoute l'image avec son lien
        article.appendChild(nameLink); // Ajoute le h2 avec son lien
        article.appendChild(location);
        article.appendChild(taglineElem);
        article.appendChild(priceElem);

        return article;
    }
    return { name, picture, getUserCardDOM };
}
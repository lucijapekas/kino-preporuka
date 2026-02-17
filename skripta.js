const API_KLJUC = "8ead4341c1d64ffd6deba2d079d242a6";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

window.onload = async () => {
    await dohvatiZanrove();  
    await dohvatiTrendove(); 
};

async function dohvatiZanrove() {
    try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KLJUC}&language=hr-HR`);
        const data = await res.json();
        const gumbiContainer = document.getElementById("brziGumbi");
        
        data.genres.slice(0, 8).forEach(z => {
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-light btn-sm px-4 rounded-pill shadow-sm";
            btn.innerText = z.name;
            btn.onclick = () => filtrirajPoZanru(z.id, z.name);
            gumbiContainer.appendChild(btn);
        });
    } catch (e) { console.error("Greška kod učitavanja žanrova:", e); }
}

async function dohvatiTrendove() {
    prikaziUcitavanje(true);
    document.getElementById("naslovSekcije").innerText = "Trenutno popularno";
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KLJUC}&language=hr-HR`);
        const data = await res.json();
        prikaziKartice(data.results);
    } catch (e) { console.error("Greška kod trendova:", e); }
    finally { prikaziUcitavanje(false); }
}

async function pretraziFilm(query) {
    const pojam = query || document.getElementById("unosFilm").value.trim();
    if (!pojam) return;

    document.getElementById("naslovSekcije").innerText = `Rezultati za: ${pojam}`;
    prikaziUcitavanje(true);
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KLJUC}&query=${pojam}&language=hr-HR`);
        const data = await res.json();
        prikaziKartice(data.results);
    } catch (e) { console.error("Greška kod pretrage:", e); }
    finally { prikaziUcitavanje(false); }
}

async function filtrirajPoZanru(id, ime) {
    document.getElementById("naslovSekcije").innerText = ` ${ime || "Odabrano"}`;
    prikaziUcitavanje(true);
    try {
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KLJUC}&with_genres=${id}&language=hr-HR&sort_by=popularity.desc`);
        const data = await res.json();
        prikaziKartice(data.results);
    } catch (e) { console.error("Greška kod filtriranja:", e); }
    finally { prikaziUcitavanje(false); }
}
async function otvoriDetaljeFilma(id) {
    prikaziUcitavanje(true);
    try {
        let res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KLJUC}&language=hr-HR&append_to_response=credits`);
        let data = await res.json();

        if (!data.overview || data.overview.length < 5) {
            const resEn = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KLJUC}&language=en-US`);
            const dataEn = await resEn.json();
            data.overview = dataEn.overview + " [Opis nije dostupan na hrvatskom jeziku]";
        }

        const glumci = data.credits.cast.slice(0, 5).map(g => g.name).join(", ");

        document.getElementById("modalNaslov").innerText = data.title;
        document.getElementById("modalPoster").src = data.poster_path ? IMAGE_URL + data.poster_path : 'https://via.placeholder.com/500x750?text=Nema+Slike';
        document.getElementById("modalOpis").innerText = data.overview;
        document.getElementById("modalGlumci").innerText = glumci || "Informacije o glumcima nisu dostupne";
        document.getElementById("modalTrajanje").innerText = data.runtime || "N/A";
        document.getElementById("modalZanrovi").innerText = data.genres.map(g => g.name).join(", ");
        document.getElementById("modalOcjena").innerText = data.vote_average.toFixed(1);

        const mojModal = new bootstrap.Modal(document.getElementById('filmModal'));
        mojModal.show();
    } catch (e) { console.error("Greška kod detalja:", e); }
    finally { prikaziUcitavanje(false); }
}

function prikaziKartice(filmovi) {
    const kontejner = document.getElementById("mrezaFilmova");
    kontejner.innerHTML = "";

    if (filmovi.length === 0) {
        kontejner.innerHTML = `<div class="col-12 text-center my-5"><p class="text-secondary">Nema pronađenih filmova.</p></div>`;
        return;
    }

    filmovi.forEach(film => {
        const slika = film.poster_path ? IMAGE_URL + film.poster_path : 'https://via.placeholder.com/500x750?text=Nema+Slike';
        const col = document.createElement("div");
        col.className = "col";
        col.innerHTML = `
            <div class="card h-100 film-kartica border-0 shadow-lg bg-dark text-white" onclick="otvoriDetaljeFilma(${film.id})">
                <div class="position-relative">
                    <img src="${slika}" class="card-img-top" alt="${film.title}">
                    <span class="badge bg-danger position-absolute top-0 end-0 m-2">⭐ ${film.vote_average.toFixed(1)}</span>
                </div>
                <div class="card-body text-center">
                    <h6 class="card-title text-truncate mb-0">${film.title}</h6>
                    <small class="text-secondary">${film.release_date ? film.release_date.split('-')[0] : 'N/A'}</small>
                </div>
            </div>
        `;
        kontejner.appendChild(col);
    });
}

function prikaziUcitavanje(stanje) {
    document.getElementById("ucitavanje").classList.toggle("d-none", !stanje);
}
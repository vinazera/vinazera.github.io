const fileInput = document.getElementById('fileInput');
const userNameInput = document.getElementById('userName');
const photoCaptionInput = document.getElementById('photoCaption');
const uploadBtn = document.getElementById('uploadBtn');
const photoGrid = document.getElementById('photoGrid');

// Inicializa a galeria ao carregar
window.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
});

// Evento do Botão de Upload
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async function () {
    const file = this.files[0];
    const name = userNameInput.value;
    const caption = photoCaptionInput.value;

    if (!file || !name || !caption) {
        alert("Por favor, preencha todos os campos e selecione uma foto! ❤️");
        return;
    }

    uploadBtn.innerText = "Enviando amor...";
    uploadBtn.disabled = true;

    try {
        // 1. Upload para o Storage (Pasta 'fotos/')
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = window.fb.ref(window.fb.storage, `fotos/${fileName}`);
        await window.fb.uploadBytes(storageRef, file);

        // 2. Obter a URL da imagem
        const url = await window.fb.getDownloadURL(storageRef);

        // 3. Salvar dados no Firestore
        await window.fb.addDoc(window.fb.collection(window.fb.db, "galeria"), {
            url: url,
            name: name,
            caption: caption,
            createdAt: Date.now()
        });

        alert("Foto enviada com sucesso! Obrigado por compartilhar! ✨");

        // Limpar campos
        userNameInput.value = '';
        photoCaptionInput.value = '';
        fileInput.value = '';

        loadPhotos(); // Atualiza galeria
    } catch (error) {
        console.error("Erro:", error);
        alert("Houve um erro ao enviar a foto. Tente novamente.");
    } finally {
        uploadBtn.innerText = "Selecionar Foto e Enviar";
        uploadBtn.disabled = false;
    }
});

async function loadPhotos() {
    try {
        photoGrid.innerHTML = '<div class="loader">Carregando memórias...</div>';

        // Busca as fotos ordenando por data (mais recentes primeiro)
        const q = window.fb.query(
            window.fb.collection(window.fb.db, "galeria"),
            window.fb.orderBy("createdAt", "desc")
        );

        const querySnapshot = await window.fb.getDocs(q);
        photoGrid.innerHTML = "";

        if (querySnapshot.empty) {
            photoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Ainda não há fotos. Seja o primeiro a postar!</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${data.url}" alt="Foto do Casamento">
                <p>${data.caption}</p>
                <span>By ${data.name}</span>
            `;
            photoGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar fotos:", error);
        photoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Erro ao carregar a galeria.</p>';
    }
}

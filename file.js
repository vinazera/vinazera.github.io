// Seus elementos da página (Mantenha igual ao seu)
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
    const file = this.files[0]; // Correção: Pegar o primeiro arquivo
    const name = userNameInput.value;
    const caption = photoCaptionInput.value;

    if (!file || !name || !caption) {
        alert("Por favor, preencha todos os campos e selecione uma foto! ❤️");
        return;
    }

    uploadBtn.innerText = "Enviando amor...";
    uploadBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append("image", file);

        // Upload para o Imgur por debaixo dos panos
        const respostaImgur = await fetch("https://imgur.com", {
            method: "POST",
            headers: { 
                Authorization: "Client-ID 6e08dd18f4a7c1b"
            }, 
            body: formData
        });
        
        const resultadoImgur = await respostaImgur.json();

        if (!resultadoImgur.success) {
            throw new Error("O Imgur recusou o upload.");
        }

        const url = resultadoImgur.data.link;

        // Salvar dados diretamente no Firestore utilizando a nossa importação limpa
        await addDoc(collection(db, "galeria"), {
            url: url,
            name: name,
            caption: caption,
            createdAt: Date.now()
        });

        alert("Foto enviada com sucesso! Obrigado por compartilhar! ✨");

        userNameInput.value = '';
        photoCaptionInput.value = '';
        fileInput.value = '';

        loadPhotos(); 
    } catch (error) {
        console.error("Erro:", error);
        alert("Houve um erro ao enviar a foto. Tente novamente.");
    } finally {
        uploadBtn.innerText = "Selecionar Foto e Enviar";
        uploadBtn.disabled = false;
    }
});

// FUNÇÃO ATUALIZADA SEM WINDOW.FB
async function loadPhotos() {
    try {
        photoGrid.innerHTML = '<div class="loader">Carregando memórias...</div>';

        // Busca direto no db local importado lá em cima
        const q = query(
            collection(db, "galeria"),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
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

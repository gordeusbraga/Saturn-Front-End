const getChatId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('chat');
}

const openCreateChatModal = () => {
    document.querySelector('.create-chat-modal').showModal()
}

const closeCreateChatModal = () => {
    loadChats();
    document.querySelector('.create-chat-modal').close()
}

const goToHome = () => {
    window.location.href = 'home.html';
}

const onCreateChatClick = async () => {
    const title = document.getElementById('chat-name').value
    if (!title) {
        return alert('Digite um nome válido para o chat!')
    }
    const response = await API.createChat(title)

    if (response.error) {
        return alert('Erro ao criar chat!')
    }

    window.location.href = `chat.html?chat=${response.chatId}`
}

const toggleMenu = () => {
    const menuButton = document.getElementById('menu');

    const menuContainer = document.querySelector('.toolbar-container');


    if (menuContainer.classList.contains('closed')) {

        setTimeout(() => {
            menuContainer.childNodes.forEach(child => {
                if (child && child.style) {
                    child.style.display = 'flex';
                }
            });
        }, 300);

        menuContainer.classList.remove('closed');
        menuButton.classList.add('rotated');
        return
    }

    menuButton.classList.remove('rotated');
    menuContainer.classList.add('closed');
    menuContainer.childNodes.forEach(child => {
        if (child && child.style) {
            child.style.display = 'none';
        }
    });

}

const addMessage = (content, fromUser) => {
    const messages = document.querySelector('.messages');

    const message = document.createElement('div');
    message.innerHTML = `
        <div class="message-container ${fromUser ? '' : 'bot'}">
            <div class="message">
                <p>${content} </p>
            </div>
        </div>
    `

    messages.scrollTop = messages.scrollHeight;
    messages.appendChild(message);
    return message;
}

const send = async () => {
    const content = document.getElementById('content');
    const messages = document.querySelector('.messages');

    if (content.value === '') {
        return alert('Digite algo!');
    }

    addMessage(content.value, true);
    content.disabled = true;

    try {

        let started = false;

        const response = await API.ask(getChatId(), content.value);
        content.value = '';

        const message = addMessage('Pensando na resposta...', false);

        if (!response) {
            return alert('Erro ao enviar mensagem!');
        }

        response.onmessage = (event) => {

            if (started === false) {
                if (event.data === '\n') {
                    return;
                }
                started = true;
                message.querySelector('p').innerText = '';
            }

            messages.scrollTop = messages.scrollHeight;
            message.querySelector('p').innerText += event.data;
        }

        response.onclose = () => {
            content.disabled = false;

        }

    } catch (error) {
        console.error(error);
    }

}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        send();
    }
});

const loadMessages = async () => {

    const chatId = getChatId();

    if (!chatId) {
        const chats = await API.listChats();

        if (!chats.chats || !chats.chats.length) {
            return openCreateChatModal();
        }

        window.location.href = `chat.html?chat=${chats.chats[0].id}`;
    }

    const messages = await API.getChatMessages(getChatId());
    if (!messages.messages) {
        alert('Erro ao carregar mensagens! O chat nao existe ou você nao tem permissão para acessá-lo!')
        window.location.href = 'chat.html';
        return
    }

    messages.messages.forEach(message => {
        addMessage(message.content, message.fromUser);
    });
}

const loadChats = async () => {
    const chatsList = document.querySelector('.chats-list');

    const chats = await API.listChats();

    if (chats.error) {
        window.location.href = '/index.html';
        return alert('Erro ao listar chats!');
    }

    if (!chats.chats || !chats.chats.length) {
        return openCreateChatModal();
    }

    chatsList.innerHTML = '';

    chats.chats.forEach((chat) => {
        chatsList.innerHTML += `
                <li class="chat-item ${getChatId() == chat.id ? 'selected-chat' : ''}" chat-id="${chat.id}">
                    <div class="chat-item-name">
                        <p>${chat.title}</p>
                    </div>
                    <div class="icon-button-container">
                        <ion-icon class="delete-chat-button" name="trash-outline"></ion-icon>
                    </div>
                </li>
            `
    })

    loadMessages();
}

window.addEventListener('DOMContentLoaded', async () => {

    const chatsList = document.querySelector('.chats-list');
    chatsList.addEventListener('click', async (e) => {
        if (e.target) {
            if (e.target.classList.contains('delete-chat-button')) {
                const itemElement = e.target.closest('.chat-item');
                const itemId = itemElement.getAttribute('chat-id');

                if (itemId) {
                    const response = await API.deleteChat(itemId)

                    if (response.error) {
                        return alert('Erro ao deletar chat!');
                    }

                    itemElement.remove();
                    return;
                }
            }

            const closest = e.target.closest('.chat-item');
            if (closest) {
                const itemId = closest.getAttribute('chat-id');

                if (itemId && getChatId() !== itemId) {
                    window.location.href = `chat.html?chat=${itemId}`
                }
            }
        }
    });

    loadChats();

})
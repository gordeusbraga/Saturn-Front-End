const toggleMenu = () => {
    const menuButton = document.getElementById('menu');
    const menuContainer = document.querySelector('.toolbar-container');


    if (menuContainer.classList.contains('closed')) {
        menuContainer.classList.remove('closed');
        menuButton.classList.add('opened');
    } else {
        menuButton.classList.remove('opened');
        menuContainer.classList.add('closed');
    }

}


const getChatId = () => {
    // const url = new URL(window.location.href);
    // return url.searchParams.get('chat_id');
    return 5;
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

    messages.appendChild(message);
    return message;
}

const send = async () => {
    const content = document.getElementById('content');

    if (content.value === '') {
        return alert('Digite algo!');
    }

    addMessage(content.value, true);
    content.disabled = true;

    try {

        let started = false;

        const response = await API.ask(getChatId(), content.value);
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

            message.querySelector('p').innerText += event.data;
        }

        response.onclose = () => {
            content.disabled = false;
            content.value = '';
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

window.addEventListener('DOMContentLoaded', async () => {
    const messages = await API.getChatMessages(getChatId());
    if (messages.messages) {
        messages.messages.forEach(message => {
            addMessage(message.content, message.fromUser);
        });
    }

})
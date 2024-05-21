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

        const response = await API.ask(5, content.value);
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
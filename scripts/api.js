class API {
    // static baseUrl = 'https://saturn.learxd.dev/api';
    static baseUrl = 'http://localhost:3000';

    static setToken = (token) => {
        localStorage.setItem('token', token);
    }

    static getToken = () => {
        return localStorage.getItem('token');
    }

    static login = async (email, password) => {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    }

    static register = async (email, username, password) => {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password })
        })
    }

    static getProfileInfo = () => {
        return this.request('/profile')
    }

    static createChat = async (title) => {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ title })
        });
    }

    static deleteChat = async (chatId) => {
        return this.request(`/chat/${chatId}`, {
            method: 'DELETE'
        });
    }

    static listChats = async () => {
        return this.request('/chat/list')

    }

    static getChatMessages = async (chatId) => {
        return this.request(`/chat/${chatId}/messages`)
    }

    static ask = async (chatId, content) => {
        return this.request(`/generation`, {
            method: 'POST',
            body: JSON.stringify({ chatId, content })
        })
            .then(data => {
                if (data.error) {
                    return false;
                }

                return new WebSocket(
                    'ws://localhost:3001/' + data.uuid,
                    API.getToken()
                );
            });
    }

    static request = async (url, options = {}) => {

        if (options) {
            if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
                options.headers = {
                    'Content-Type': 'application/json',
                    ...options.headers
                };
            }
        }

        const token = this.getToken();
        if (token) {
            options = {
                ...options,
                headers: {
                    ...(options.headers ?? {}),
                    Authorization: `Bearer ${token}`
                }
            }
        }

        return fetch(this.baseUrl + url, options)
            .then(response => response.json());
    }
}


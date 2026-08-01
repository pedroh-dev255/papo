import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

class NotificationService {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.listeners = [];
        this.setupListeners();
    }

    async setupListeners() {
        try {
            // Escutar notificações recebidas
            await listen('notification-received', (event) => {
                const notification = event.payload;
                this.addNotification(notification);
                this.notifyListeners('new', notification);
                this.updateUnreadCount();
            });

            // Carregar notificações existentes
            await this.loadNotifications();
        } catch (error) {
            console.error('Erro ao configurar listeners:', error);
        }
    }

    async loadNotifications() {
        try {
            const notifications = await invoke('get_notifications');
            this.notifications = notifications;
            this.updateUnreadCount();
            this.notifyListeners('load', notifications);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }

    async sendNotification(title, body, priority = 'Normal') {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const id = await invoke('send_notification', {
                title,
                body,
                priority,
                user_name: user.name || null,
                avatar: user.avatar || null,
                target_chat_id: 1,
            });
            return id;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    }

    async markAsRead(id) {
        try {
            const success = await invoke('mark_notification_as_read', { id });
            if (success) {
                const notification = this.notifications.find(n => n.id === id);
                if (notification) {
                    notification.read = true;
                    this.updateUnreadCount();
                    this.notifyListeners('update', notification);
                }
            }
            return success;
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            return false;
        }
    }

    async markAllAsRead() {
        try {
            await invoke('mark_all_notifications_as_read');
            this.notifications.forEach(n => n.read = true);
            this.updateUnreadCount();
            this.notifyListeners('markAllRead', this.notifications);
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    }

    async deleteNotification(id) {
        try {
            const success = await invoke('delete_notification', { id });
            if (success) {
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.updateUnreadCount();
                this.notifyListeners('delete', id);
            }
            return success;
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
            return false;
        }
    }

    async clearAll() {
        try {
            await invoke('clear_all_notifications');
            this.notifications = [];
            this.updateUnreadCount();
            this.notifyListeners('clearAll', []);
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
        }
    }

    async getUnreadCount() {
        try {
            const count = await invoke('get_unread_count');
            return count;
        } catch (error) {
            console.error('Erro ao obter contagem de não lidas:', error);
            return 0;
        }
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.updateUnreadCount();
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erro no listener:', error);
            }
        });
    }

    getNotifications() {
        return this.notifications;
    }

    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }
}

const notificationService = new NotificationService();
export default notificationService;
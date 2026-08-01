use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::Local;
use tauri::{AppHandle, Emitter, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindowBuilder};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: String,
    pub title: String,
    pub body: String,
    pub priority: String,
    pub timestamp: String,
    pub read: bool,
    pub user_name: Option<String>,
    pub avatar: Option<String>,
    pub target_chat_id: Option<usize>,
}

pub struct NotificationManager {
    notifications: HashMap<String, Notification>,
    max_notifications: usize,
}

impl NotificationManager {
    pub fn new() -> Self {
        Self {
            notifications: HashMap::new(),
            max_notifications: 100,
        }
    }

    pub fn send_notification(
        &mut self,
        app: &AppHandle,
        title: String,
        body: String,
        priority: String,
        user_name: Option<String>,
        avatar: Option<String>,
        target_chat_id: Option<usize>,
    ) -> Result<String, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let notification = Notification {
            id: id.clone(),
            title: title.clone(),
            body: body.clone(),
            priority: priority.clone(),
            timestamp: timestamp.clone(),
            read: false,
            user_name,
            avatar,
            target_chat_id,
        };

        // Armazenar notificação
        self.notifications.insert(id.clone(), notification.clone());

        // Limitar número de notificações
        if self.notifications.len() > self.max_notifications {
            if let Some(oldest_id) = self.notifications.keys().next().cloned() {
                self.notifications.remove(&oldest_id);
            }
        }

        // Enviar evento para o frontend
        let _ = app.emit("notification-received", notification.clone());
        self.open_notification_overlay(app, &notification);

        Ok(id)
    }

    pub fn send_debug_notification(&mut self, app: &AppHandle) -> Result<String, String> {
        let id = "1".to_string();
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        let notification = self
            .notifications
            .entry(id.clone())
            .or_insert_with(|| Notification {
                id: id.clone(),
                title: "João Silva".to_string(),
                body: "Você tem uma nova mensagem no sistema. Clique para abrir o chat.".to_string(),
                priority: "Normal".to_string(),
                timestamp: timestamp.clone(),
                read: false,
                user_name: Some("João Silva".to_string()),
                avatar: Some("https://i.pravatar.cc/150?img=1".to_string()),
                target_chat_id: Some(1),
            })
            .clone();

        let _ = app.emit("notification-received", notification.clone());
        self.open_notification_overlay(app, &notification);

        Ok(id)
    }

    fn open_notification_overlay(&self, app: &AppHandle, notification: &Notification) {
        let screen_padding = 24;
        let (x, y) = if let Ok(Some(monitor)) = app.primary_monitor() {
            let size = monitor.size();
            (
                size.width.saturating_sub(360 + screen_padding),
                size.height.saturating_sub(140 + screen_padding),
            )
        } else {
            (screen_padding, screen_padding)
        };

        let query = format!("index.html?overlay=true&notificationId={}", notification.id);
        let _ = WebviewWindowBuilder::new(app, format!("notification-overlay-{}", notification.id), WebviewUrl::App(query.into()))
            .title("Papo Notification")
            .inner_size(360.0, 140.0)
            .position(x as f64, y as f64)
            .decorations(false)
            .always_on_top(true)
            .resizable(false)
            .visible(true)
            .skip_taskbar(true)
            .build();
    }

    pub fn get_all_notifications(&self) -> Vec<Notification> {
        let mut notifs: Vec<Notification> = self.notifications.values().cloned().collect();
        notifs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        notifs
    }

    pub fn get_unread_notifications(&self) -> Vec<Notification> {
        self.notifications
            .values()
            .filter(|n| !n.read)
            .cloned()
            .collect()
    }

    pub fn mark_as_read(&mut self, id: &str) -> bool {
        if let Some(notification) = self.notifications.get_mut(id) {
            notification.read = true;
            return true;
        }
        false
    }

    pub fn mark_all_as_read(&mut self) {
        for notification in self.notifications.values_mut() {
            notification.read = true;
        }
    }

    pub fn delete_notification(&mut self, id: &str) -> bool {
        self.notifications.remove(id).is_some()
    }

    pub fn clear_all(&mut self) {
        self.notifications.clear();
    }

    pub fn get_unread_count(&self) -> usize {
        self.notifications.values().filter(|n| !n.read).count()
    }

    pub fn get_notification(&self, id: &str) -> Option<Notification> {
        self.notifications.get(id).cloned()
    }
}
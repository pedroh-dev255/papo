mod notifications;

use serde::Serialize;
use tauri::{Emitter, Manager};
use notifications::NotificationManager;

#[derive(Serialize, Clone)]
struct OpenNotificationPayload {
    id: String,
    chat_id: usize,
}

#[tauri::command]
fn send_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
    priority: String,
    user_name: Option<String>,
    avatar: Option<String>,
    target_chat_id: Option<usize>,
) -> Result<String, String> {
    let state = app.state::<std::sync::Mutex<NotificationManager>>();
    let mut manager = state.lock().unwrap();
    manager.send_notification(&app, title, body, priority, user_name, avatar, target_chat_id)
}

#[tauri::command]
fn get_notifications(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
) -> Result<Vec<notifications::Notification>, String> {
    let manager = state.lock().unwrap();
    Ok(manager.get_all_notifications())
}

#[tauri::command]
fn get_unread_notifications(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
) -> Result<Vec<notifications::Notification>, String> {
    let manager = state.lock().unwrap();
    Ok(manager.get_unread_notifications())
}

#[tauri::command]
fn mark_notification_as_read(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
    id: String,
) -> Result<bool, String> {
    let mut manager = state.lock().unwrap();
    Ok(manager.mark_as_read(&id))
}

#[tauri::command]
fn mark_all_notifications_as_read(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().unwrap();
    manager.mark_all_as_read();
    Ok(())
}

#[tauri::command]
fn delete_notification(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
    id: String,
) -> Result<bool, String> {
    let mut manager = state.lock().unwrap();
    Ok(manager.delete_notification(&id))
}

#[tauri::command]
fn clear_all_notifications(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().unwrap();
    manager.clear_all();
    Ok(())
}

#[tauri::command]
fn get_unread_count(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
) -> Result<usize, String> {
    let manager = state.lock().unwrap();
    Ok(manager.get_unread_count())
}

#[tauri::command]
fn get_notification(
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
    id: String,
) -> Result<notifications::Notification, String> {
    let manager = state.lock().unwrap();
    if let Some(notification) = manager.get_notification(&id) {
        Ok(notification)
    } else if id == "1" {
        Ok(notifications::Notification {
            id: id.clone(),
            title: "João Silva".to_string(),
            body: "Você tem uma nova mensagem no sistema. Clique para abrir o chat.".to_string(),
            priority: "Normal".to_string(),
            timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
            read: false,
            user_name: Some("João Silva".to_string()),
            avatar: Some("https://i.pravatar.cc/150?img=1".to_string()),
            target_chat_id: Some(1),
        })
    } else {
        Err("Notificação não encontrada".to_string())
    }
}

#[tauri::command]
fn open_notification_target(
    app: tauri::AppHandle,
    state: tauri::State<'_, std::sync::Mutex<NotificationManager>>,
    id: String,
) -> Result<(), String> {
    let mut manager = state.lock().unwrap();
    let chat_id = manager
        .get_notification(&id)
        .and_then(|n| n.target_chat_id)
        .unwrap_or(1);

    manager.mark_as_read(&id);

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.emit(
            "open-notification-message",
            OpenNotificationPayload {
                id: id.clone(),
                chat_id,
            },
        );
    }

    Ok(())
}

fn main() {
    let notification_manager = std::sync::Mutex::new(NotificationManager::new());
    
    tauri::Builder::default()
        .manage(notification_manager)
        .invoke_handler(tauri::generate_handler![
            send_notification,
            get_notifications,
            get_unread_notifications,
            get_notification,
            mark_notification_as_read,
            mark_all_notifications_as_read,
            delete_notification,
            clear_all_notifications,
            open_notification_target,
            get_unread_count,
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));
                let state = app_handle.state::<std::sync::Mutex<NotificationManager>>();
                let mut manager = state.lock().unwrap();
                let _ = manager.send_debug_notification(&app_handle);
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Erro ao executar o aplicativo");
}
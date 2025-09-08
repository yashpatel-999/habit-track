use serde::{Deserialize, Serialize};
use chrono::NaiveDate;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginUser {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Habit {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: String,
    pub frequency: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHabit {
    pub title: String,
    pub description: String,
    pub frequency: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateHabit {
    pub title: Option<String>,
    pub description: Option<String>,
    pub frequency: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct HabitLog {
    pub id: Uuid,
    pub habit_id: Uuid,
    pub date: NaiveDate,
    pub status: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHabitLog {
    pub date: NaiveDate,
    pub status: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HabitProgress {
    pub habit_id: Uuid,
    pub completion_percentage: f64,
    pub total_days: i64,
    pub completed_days: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub token: String,
    pub user_id: Uuid,
}

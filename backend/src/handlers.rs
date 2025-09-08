use actix_web::{web, HttpRequest, HttpResponse, Result};
use sqlx::{PgPool, Row};
use uuid::Uuid;
use crate::models::*;
use crate::auth::*;

pub async fn signup(pool: web::Data<PgPool>, user_data: web::Json<CreateUser>) -> Result<HttpResponse> {
    let password_hash = hash_password(&user_data.password)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to hash password"))?;

    match sqlx::query_as::<_, User>("INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *")
        .bind(&user_data.username)
        .bind(&user_data.email)
        .bind(&password_hash)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(user) => {
            let token = create_jwt(user.id)
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to create token"))?;
            Ok(HttpResponse::Created().json(AuthResponse { token, user_id: user.id }))
        }
        Err(sqlx::Error::Database(db_err)) if db_err.constraint().is_some() => {
            Ok(HttpResponse::Conflict().json("Username or email already exists"))
        }
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn login(pool: web::Data<PgPool>, credentials: web::Json<LoginUser>) -> Result<HttpResponse> {
    match sqlx::query_as::<_, User>("SELECT * FROM users WHERE username = $1")
        .bind(&credentials.username)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(user) => {
            let password_valid = verify_password(&credentials.password, &user.password_hash)
                .map_err(|_| actix_web::error::ErrorInternalServerError("Password verification failed"))?;

            if password_valid {
                let token = create_jwt(user.id)
                    .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to create token"))?;
                Ok(HttpResponse::Ok().json(AuthResponse { token, user_id: user.id }))
            } else {
                Ok(HttpResponse::Unauthorized().json("Invalid credentials"))
            }
        }
        Err(sqlx::Error::RowNotFound) => Ok(HttpResponse::Unauthorized().json("Invalid credentials")),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn get_habits(pool: web::Data<PgPool>, req: HttpRequest) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;

    match sqlx::query_as::<_, Habit>("SELECT * FROM habits WHERE user_id = $1 ORDER BY id")
        .bind(user_id)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(habits) => Ok(HttpResponse::Ok().json(habits)),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn create_habit(pool: web::Data<PgPool>, req: HttpRequest, habit_data: web::Json<CreateHabit>) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;

    match sqlx::query_as::<_, Habit>("INSERT INTO habits (user_id, title, description, frequency) VALUES ($1, $2, $3, $4) RETURNING *")
        .bind(user_id)
        .bind(&habit_data.title)
        .bind(&habit_data.description)
        .bind(&habit_data.frequency)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(habit) => Ok(HttpResponse::Created().json(habit)),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn update_habit(pool: web::Data<PgPool>, req: HttpRequest, path: web::Path<Uuid>, habit_data: web::Json<UpdateHabit>) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;
    let habit_id = path.into_inner();

    // Get current habit
    let current_habit = match sqlx::query_as::<_, Habit>("SELECT * FROM habits WHERE id = $1 AND user_id = $2")
        .bind(habit_id)
        .bind(user_id)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(habit) => habit,
        Err(sqlx::Error::RowNotFound) => return Ok(HttpResponse::NotFound().json("Habit not found")),
        Err(_) => return Err(actix_web::error::ErrorInternalServerError("Database error")),
    };

    let new_title = habit_data.title.as_deref().unwrap_or(&current_habit.title);
    let new_description = habit_data.description.as_deref().unwrap_or(&current_habit.description);
    let new_frequency = habit_data.frequency.as_deref().unwrap_or(&current_habit.frequency);

    match sqlx::query_as::<_, Habit>("UPDATE habits SET title = $1, description = $2, frequency = $3 WHERE id = $4 AND user_id = $5 RETURNING *")
        .bind(new_title)
        .bind(new_description)
        .bind(new_frequency)
        .bind(habit_id)
        .bind(user_id)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(habit) => Ok(HttpResponse::Ok().json(habit)),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn delete_habit(pool: web::Data<PgPool>, req: HttpRequest, path: web::Path<Uuid>) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;
    let habit_id = path.into_inner();

    match sqlx::query("DELETE FROM habits WHERE id = $1 AND user_id = $2")
        .bind(habit_id)
        .bind(user_id)
        .execute(pool.get_ref())
        .await
    {
        Ok(_) => Ok(HttpResponse::NoContent().finish()),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn log_habit(pool: web::Data<PgPool>, req: HttpRequest, path: web::Path<Uuid>, log_data: web::Json<CreateHabitLog>) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;
    let habit_id = path.into_inner();

    // Verify habit belongs to user
    match sqlx::query_as::<_, Habit>("SELECT * FROM habits WHERE id = $1 AND user_id = $2")
        .bind(habit_id)
        .bind(user_id)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(_) => {
            match sqlx::query_as::<_, HabitLog>("INSERT INTO habit_logs (habit_id, date, status) VALUES ($1, $2, $3) ON CONFLICT (habit_id, date) DO UPDATE SET status = $3 RETURNING *")
                .bind(habit_id)
                .bind(log_data.date)
                .bind(log_data.status)
                .fetch_one(pool.get_ref())
                .await
            {
                Ok(log) => Ok(HttpResponse::Created().json(log)),
                Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
            }
        }
        Err(sqlx::Error::RowNotFound) => Ok(HttpResponse::NotFound().json("Habit not found")),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

pub async fn get_habit_progress(pool: web::Data<PgPool>, req: HttpRequest, path: web::Path<Uuid>) -> Result<HttpResponse> {
    let auth_header = req.headers().get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing authorization header"))?;

    let user_id = extract_user_id_from_token(auth_header)?;
    let habit_id = path.into_inner();

    // Verify habit belongs to user
    match sqlx::query_as::<_, Habit>("SELECT * FROM habits WHERE id = $1 AND user_id = $2")
        .bind(habit_id)
        .bind(user_id)
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(_) => {
            match sqlx::query("SELECT COUNT(*) as total_days, SUM(CASE WHEN status = true THEN 1 ELSE 0 END) as completed_days FROM habit_logs WHERE habit_id = $1")
                .bind(habit_id)
                .fetch_one(pool.get_ref())
                .await
            {
                Ok(result) => {
                    let total_days: i64 = result.get("total_days");
                    let completed_days: i64 = result.get("completed_days");
                    
                    let completion_percentage = if total_days > 0 {
                        (completed_days as f64 / total_days as f64) * 100.0
                    } else {
                        0.0
                    };
                    
                    Ok(HttpResponse::Ok().json(HabitProgress {
                        habit_id,
                        completion_percentage,
                        total_days,
                        completed_days,
                    }))
                }
                Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
            }
        }
        Err(sqlx::Error::RowNotFound) => Ok(HttpResponse::NotFound().json("Habit not found")),
        Err(_) => Err(actix_web::error::ErrorInternalServerError("Database error")),
    }
}

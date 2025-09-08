mod models;
mod auth;
mod db;
mod handlers;

use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use dotenv::dotenv;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let pool = db::create_db_pool()
        .await
        .expect("Failed to create database pool");

    println!("Starting server on http://127.0.0.1:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:4200")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .supports_credentials();

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .route("/signup", web::post().to(handlers::signup))
            .route("/login", web::post().to(handlers::login))
            .route("/habits", web::get().to(handlers::get_habits))
            .route("/habits", web::post().to(handlers::create_habit))
            .route("/habits/{id}", web::put().to(handlers::update_habit))
            .route("/habits/{id}", web::delete().to(handlers::delete_habit))
            .route("/habits/{id}/log", web::post().to(handlers::log_habit))
            .route("/habits/{id}/progress", web::get().to(handlers::get_habit_progress))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

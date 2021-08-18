-- This files will serve as the schema to build out our entire database

-- We want to create the database IFF it does not exist
CREATE DATABASE IF NOT EXISTS `bitr`;

-- We want to load the database context
USE `bitr`;

-- Create a table to store the data records for our users
CREATE TABLE IF NOT EXISTS `users` (
	user_id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(32) NOT NULL UNIQUE,
	fName VARCHAR(32) NOT NULL,
	lName VARCHAR(32) NOT NULL,
	email VARCHAR(64) NOT NULL UNIQUE,
	password VARCHAR(256) NOT NULL
);

-- Create a table to store the data for posts
CREATE TABLE IF NOT EXISTS `posts` (
	post_id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id INTEGER REFERENCES users(user_id), -- FORIEGN KEY
	title VARCHAR(64) NOT NULL,
	text VARCHAR(1024),
	image_url VARCHAR(256),
	location VARCHAR(128)
);

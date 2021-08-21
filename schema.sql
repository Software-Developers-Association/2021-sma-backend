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
	location VARCHAR(128),
	likes INTEGER UNSIGNED,
	dislikes INTEGER UNSIGNED,
	created_date INTEGER UNSIGNED NOT NULL,
	edited_date INTEGER UNSIGNED
);

-- Create a table to store the comments assoicated with a post
CREATE TABLE IF NOT EXISTS `comments` (
	comm_id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	post_id INTEGER REFERENCES posts(post_id),
	text VARCHAR(512)
);

-- Create a table that stores all possible tags, these will be auto generated based on content
CREATE TABLE IF NOT EXISTS `tags` (
	tag_id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	text VARCHAR(32) NOT NULL UNIQUE
);

-- Create a table that stores that tag usages
CREATE TABLE IF NOT EXISTS `tag_usage` (
	tag_id INTEGER REFERENCES tags(tag_id),
	post_id INTEGER REFERENCES posts(post_id)
);

-- Create a table that stores the link between a follower and a followed person
CREATE TABLE IF NOT EXISTS `followers` (
	follower INTEGER REFERENCES users(user_id),
	followed INTEGER REFERENCES users(user_id)
);

-- Create a table to store a blocked user
CREATE TABLE IF NOT EXISTS `blocks` (
	blocker INTEGER REFERENCES users(user_id),
	blocked INTEGER REFERENCES users(user_id)
);

-- Create a table to store a user's favorite post
CREATE TABLE IF NOT EXISTS `favorites` (
	user_id INTEGER REFERENCES users(user_id),
	post_id INTEGER REFERENCES posts(post_id)
);
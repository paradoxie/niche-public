CREATE TABLE `presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`value` text NOT NULL,
	`label` text,
	`created_at` integer NOT NULL
);
